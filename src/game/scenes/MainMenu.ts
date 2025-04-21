import { GameObjects, Scene } from "phaser";

import { lootConfig } from "../../lib/craft/config"; // Import lootConfig
import {
    JunkDetail,
    JunkDetailId,
    LootItem,
    Rarity,
    RecipeDetailSocket,
    RecipePart,
    RecipePartSocket,
    RecipePartType,
} from "../../lib/craft/craftModel"; // Import necessary types
import { EventBus } from "../EventBus";
import { CraftedItemRenderer } from "../rendering/CraftedItemRenderer"; // Import the new renderer

export class MainMenu extends Scene {
    container: GameObjects.Container;
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    private itemRenderer: CraftedItemRenderer; // Renamed property

    constructor() {
        super("MainMenu");
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Create a container centered on the screen
        this.container = this.add.container(centerX, centerY);

        // Instantiate the CraftedItemRenderer with the new name
        this.itemRenderer = new CraftedItemRenderer(this);

        EventBus.emit("current-scene-ready", this);

        // Temporary start game right away to debug - REMOVE THIS LATER
        this.startGame();
    }

    // Method to change scene to Game
    startGame() {
        this.scene.start("Game");
    }

    // --- Helper: Get Junk Detail Map ---
    private getJunkDetailMap(): Map<JunkDetailId, JunkDetail> {
        const map = new Map<JunkDetailId, JunkDetail>();
        Object.values(lootConfig.junkDetails)
            .flat()
            .forEach((detail) => {
                map.set(detail.id, detail);
            });
        return map;
    }

    // --- Helper: Find Part Definition ---
    private findPartDefinition(
        partType: RecipePartType
    ): RecipePart | undefined {
        return Object.values(lootConfig.recipeParts)
            .flat()
            .find((p) => p.type === partType);
    }

    /**
     * Recursively generates all valid combinations of JunkDetailIds for a given set of sockets.
     * Ensures that each detail is used at most once per combination.
     *
     * @param socketsToFill The remaining RecipeDetailSockets to find details for.
     * @param availableDetailsMap A map of all JunkDetails available for consideration.
     * @param currentCombination The combination being built in the current recursion path.
     * @param usedDetailIds A set of JunkDetailIds already used in the current combination.
     * @param allCombinations The array to accumulate valid combinations.
     */
    private _generateDetailCombinations(
        socketsToFill: RecipeDetailSocket[],
        availableDetailsMap: Map<JunkDetailId, JunkDetail>,
        currentCombination: JunkDetailId[] = [],
        usedDetailIds: Set<JunkDetailId> = new Set(),
        allCombinations: JunkDetailId[][] = []
    ): JunkDetailId[][] {
        // Base case: All sockets have been filled
        if (socketsToFill.length === 0) {
            if (currentCombination.length > 0) {
                // Ensure we don't add empty combinations if no sockets
                allCombinations.push([...currentCombination]); // Add a copy
            }
            return allCombinations;
        }

        const currentSocket = socketsToFill[0];
        const remainingSockets = socketsToFill.slice(1);
        const requiredType = currentSocket.acceptType;

        // Find all details suitable for the current socket that haven't been used yet
        const suitableDetails: JunkDetail[] = [];
        for (const detail of availableDetailsMap.values()) {
            if (
                !usedDetailIds.has(detail.id) &&
                detail.suitableForRecipeDetails.includes(requiredType)
            ) {
                suitableDetails.push(detail);
            }
        }

        // If no suitable details found for this socket, this path is invalid
        if (suitableDetails.length === 0) {
            return allCombinations; // Backtrack
        }

        // Try adding each suitable detail to the combination and recurse
        for (const detail of suitableDetails) {
            currentCombination.push(detail.id);
            usedDetailIds.add(detail.id);

            this._generateDetailCombinations(
                remainingSockets,
                availableDetailsMap,
                currentCombination,
                usedDetailIds,
                allCombinations
            );

            // Backtrack: remove the detail for the next iteration
            currentCombination.pop();
            usedDetailIds.delete(detail.id);
        }

        return allCombinations;
    }

    // --- Download Recipe Images ---
    public async downloadRecipeImages(): Promise<void> {
        console.log("Starting recipe image generation for all combinations...");
        const allRecipes = Object.values(lootConfig.recipeItems).flat();
        const allJunkDetailsMap = this.getJunkDetailMap();
        const tempRTWidth = 512; // Define size for temporary textures
        const tempRTHeight = 512;

        for (const recipe of allRecipes) {
            console.log(`Processing recipe: ${recipe.id}`);

            // 1. Get all required detail sockets for the recipe
            const requiredDetailSockets: RecipeDetailSocket[] = [];
            recipe.sockets.forEach((partSocket: RecipePartSocket) => {
                const partDef = this.findPartDefinition(partSocket.acceptType);
                if (partDef) {
                    // Add sockets from the part definition
                    requiredDetailSockets.push(...partDef.sockets);
                }
            });

            // Sort sockets by zIndex for consistent combination generation order (optional but good)
            requiredDetailSockets.sort(
                (a, b) => a.pinpoint.zIndex - b.pinpoint.zIndex
            );

            if (requiredDetailSockets.length === 0) {
                console.log(
                    `Recipe ${recipe.id} has no detail sockets, skipping combination generation.`
                );
                continue; // Skip recipes with no details needed
            }

            // 2. Generate all valid combinations of JunkDetailIds
            console.log(
                `Generating combinations for ${recipe.id} with ${requiredDetailSockets.length} sockets...`
            );
            const detailCombinations = this._generateDetailCombinations(
                requiredDetailSockets,
                allJunkDetailsMap,
                [], // Start with empty combination
                new Set(), // Start with empty used set
                [] // Start with empty results array
            );
            console.log(
                `Found ${detailCombinations.length} valid combinations for ${recipe.id}.`
            );

            // 3. Iterate through each combination and render
            if (detailCombinations.length === 0) {
                console.warn(
                    `No valid detail combinations found for recipe ${recipe.id}.`
                );
                continue;
            }

            let combinationIndex = 0;
            for (const combination of detailCombinations) {
                const tempLootItem: LootItem = {
                    id: `temp_${recipe.id}_${combinationIndex}`, // Unique ID per combination
                    recipeId: recipe.id,
                    details: combination, // Use the current combination
                    name: recipe.name,
                    rarity: Rarity.Common,
                    sellPrice: 0,
                    temperatureRange: { min: 0, max: 100 },
                };

                const tempRT = this.make.renderTexture({
                    width: tempRTWidth,
                    height: tempRTHeight,
                });

                try {
                    // Define a key for this combination for logging and naming
                    const comboKey = `${recipe.id}_${combinationIndex}`;
                    console.log(
                        `Rendering recipe ${recipe.id} combination ${combinationIndex}`
                    );
                    this.itemRenderer.renderItemToTexture(tempLootItem, tempRT);
                    console.log(
                        `Rendered to RenderTexture for ${recipe.id}_${combinationIndex}`
                    );
                    // Take a snapshot of the RenderTexture to a canvas
                    console.log(
                        `Snapshotting RenderTexture for key: ${comboKey}`
                    );
                    // Snapshot returns an HTMLImageElement. Draw it to a temp canvas to get dataURL.
                    const imageDataUrl: string = await new Promise(
                        (resolve) => {
                            tempRT.snapshot(
                                (
                                    image:
                                        | HTMLImageElement
                                        | Phaser.Display.Color
                                ) => {
                                    if (!(image instanceof HTMLImageElement)) {
                                        console.error(
                                            "Received Color instead of Image"
                                        );
                                        resolve("");
                                        return;
                                    }
                                    console.log(
                                        `Snapshot captured for ${comboKey} (as Image)`
                                    );
                                    if (
                                        image.width === 0 ||
                                        image.height === 0
                                    ) {
                                        console.warn(
                                            `Snapshot image for ${comboKey} has zero dimensions.`
                                        );
                                        resolve(""); // Resolve with empty string on error/empty image
                                        return;
                                    }
                                    const tempCanvas =
                                        document.createElement("canvas");
                                    tempCanvas.width = image.width;
                                    tempCanvas.height = image.height;
                                    const ctx = tempCanvas.getContext("2d");
                                    if (ctx) {
                                        ctx.drawImage(image, 0, 0);
                                        resolve(
                                            tempCanvas.toDataURL("image/png")
                                        );
                                    } else {
                                        console.error(
                                            `Could not get 2D context for temp canvas (${comboKey})`
                                        );
                                        resolve(""); // Resolve with empty string on context error
                                    }
                                }
                            );
                        }
                    );
                    console.log(
                        `snapshot dataURL length for ${comboKey}: ${imageDataUrl.length}`
                    );

                    if (imageDataUrl && imageDataUrl.length > 0) {
                        // Download the generated image directly
                        const filename = `${recipe.id}_combination_${combinationIndex}.png`;
                        console.log(
                            `Downloading image for ${comboKey} as ${filename}`
                        );
                        const link = document.createElement("a");
                        link.href = imageDataUrl;
                        link.download = filename;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    } else {
                        console.warn(`No imageDataUrl for key: ${comboKey}`);
                        console.warn(
                            `Failed to get image data for ${recipe.id} combination ${combinationIndex}`
                        );
                    }
                } catch (error) {
                    console.error(
                        `Error processing ${recipe.id} combination ${combinationIndex}:`,
                        error
                    );
                } finally {
                    if (tempRT) {
                        tempRT.destroy();
                    }
                }
                combinationIndex++;
            }
            console.log(
                `Finished rendering ${combinationIndex} images for ${recipe.id}.`
            );
        }

        console.log("All images downloaded.");
    }

    // --- Scene Shutdown ---
    shutdown() {
        // The renderer instance doesn't need explicit destruction here
        // unless it starts managing persistent resources itself.
    }
}
