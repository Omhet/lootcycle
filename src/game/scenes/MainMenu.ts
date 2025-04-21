import { saveAs } from "file-saver"; // Import file-saver (implicitly installed via jszip types?) - Need to install if not: pnpm add file-saver @types/file-saver
import JSZip from "jszip"; // Import JSZip
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
        // this.startGame();
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

    // --- Download Recipe Images ---
    public async downloadRecipeImages(): Promise<void> {
        console.log("Starting recipe image generation...");
        const zip = new JSZip();
        const allRecipes = Object.values(lootConfig.recipeItems).flat();
        const allJunkDetailsMap = this.getJunkDetailMap();
        const tempRTWidth = 400; // Define size for temporary textures
        const tempRTHeight = 400;

        for (const recipe of allRecipes) {
            console.log(`Processing recipe: ${recipe.id}`);
            const detailsForRecipe: JunkDetailId[] = [];
            const availableDetails = new Set(allJunkDetailsMap.keys()); // Use all available details for each recipe simulation

            // --- Simplified Detail Selection: Use the *first* suitable detail found ---
            // Get all detail sockets needed by this recipe's parts
            const requiredDetailSockets: RecipeDetailSocket[] = [];
            recipe.sockets.forEach((partSocket: RecipePartSocket) => {
                const partDef = this.findPartDefinition(partSocket.acceptType);
                if (partDef) {
                    requiredDetailSockets.push(...partDef.sockets);
                }
            });

            // Sort sockets by zIndex to maintain consistency (optional but good practice)
            requiredDetailSockets.sort(
                (a, b) => a.pinpoint.zIndex - b.pinpoint.zIndex
            );

            for (const detailSocket of requiredDetailSockets) {
                const requiredType = detailSocket.acceptType;
                let foundDetailId: JunkDetailId | null = null;

                // Iterate through *all* details to find the first suitable one
                for (const detailId of availableDetails) {
                    const detailData = allJunkDetailsMap.get(detailId);
                    if (
                        detailData &&
                        detailData.suitableForRecipeDetails.includes(
                            requiredType
                        )
                    ) {
                        foundDetailId = detailId;
                        break; // Found the first suitable one
                    }
                }

                if (foundDetailId) {
                    detailsForRecipe.push(foundDetailId);
                } else {
                    console.warn(
                        `No suitable JunkDetail found for RecipeDetailType: ${requiredType} in recipe ${recipe.id}`
                    );
                }
            }
            // --- End Simplified Detail Selection ---

            if (detailsForRecipe.length > 0) {
                // Ensure we have details before trying to render
                // Add placeholder values for missing LootItem properties
                const tempLootItem: LootItem = {
                    id: `temp_${recipe.id}`, // Temporary unique ID
                    recipeId: recipe.id,
                    details: detailsForRecipe,
                    name: recipe.name, // Use recipe name as placeholder
                    rarity: Rarity.Common, // Default rarity
                    sellPrice: 0, // Default price
                    temperatureRange: { min: 0, max: 100 }, // Default range
                };

                // Create a temporary, off-screen RenderTexture for this item
                const tempRT = this.make.renderTexture({
                    width: tempRTWidth,
                    height: tempRTHeight,
                });

                try {
                    // Use the renamed itemRenderer
                    this.itemRenderer.renderItemToTexture(tempLootItem, tempRT);

                    // Use the renamed itemRenderer
                    const imageDataUrl =
                        await this.itemRenderer.getImageDataUrl(tempRT);

                    if (imageDataUrl) {
                        // Add image to zip, removing the 'data:image/png;base64,' prefix
                        zip.file(
                            `${recipe.id}_representative.png`,
                            imageDataUrl.split(",")[1],
                            { base64: true }
                        );
                        console.log(`Added image for ${recipe.id} to zip.`);
                    } else {
                        console.warn(
                            `Failed to get image data for recipe: ${recipe.id}`
                        );
                    }
                } catch (error) {
                    console.error(
                        `Error processing recipe ${recipe.id}:`,
                        error
                    );
                } finally {
                    // IMPORTANT: Destroy the temporary RenderTexture to free GPU memory
                    if (tempRT) {
                        tempRT.destroy();
                    }
                }
            } else {
                console.warn(
                    `Skipping recipe ${recipe.id} as no suitable details could be assigned.`
                );
            }
        }

        console.log("Generating zip file...");
        try {
            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, "loot_cycle_recipes.zip"); // Trigger download
            console.log("Zip file generated and download triggered.");
        } catch (error) {
            console.error("Error generating zip file:", error);
        }
    }

    // --- Scene Shutdown ---
    shutdown() {
        // The renderer instance doesn't need explicit destruction here
        // unless it starts managing persistent resources itself.
    }
}
