import { GameObjects, Scene } from "phaser";

import { lootConfig } from "../../lib/craft/config";
import {
    JunkDetail,
    JunkDetailId,
    LootItem,
    Rarity,
    RecipeDetailSocket,
    RecipePart,
    RecipePartSocket,
    RecipePartType,
} from "../../lib/craft/craftModel";
import { EventBus } from "../EventBus";
import { CraftedItemRenderer } from "../rendering/CraftedItemRenderer";
import { SceneKeys } from "../SceneKeys"; // Assuming you have a central place for scene keys

interface MainMenuData {
    // Define any data passed to this scene if needed
}

export class MainMenu extends Scene {
    private container!: GameObjects.Container; // Use definite assignment assertion for properties initialized in create
    private background!: GameObjects.Image;
    private logo!: GameObjects.Image;
    private title!: GameObjects.Text;
    private itemRenderer: CraftedItemRenderer;

    constructor() {
        super(SceneKeys.MainMenu); // Use the SceneKeys enum
        this.itemRenderer = new CraftedItemRenderer(this); // Initialize here
    }

    init(data: MainMenuData) {
        // Handle any data passed to the scene
        console.log("MainMenu initialized with data:", data);
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Create a container centered on the screen
        this.container = this.add.container(centerX, centerY);

        // Add background (consider making it configurable or a parameter)
        this.background = this.add.image(0, 0, "mainMenuBackground").setOrigin(0.5);
        this.container.add(this.background);
        this.scale.on("resize", this.resizeBackground, this); // Handle resizing

        // Add logo and title
        this.logo = this.add.image(0, -100, "gameLogo").setOrigin(0.5).setScale(0.8);
        this.title = this.add.text(0, 50, "Main Menu", {
            fontSize: "48px",
            fontFamily: "Arial",
            color: "#fff",
            stroke: "#000",
            strokeThickness: 4,
            align: "center",
        }).setOrigin(0.5);
        this.container.addMultiple([this.logo, this.title]);

        // Add interactive elements (buttons)
        this.createButtons();

        EventBus.emit("current-scene-ready", this);

        // Remove temporary start game
        // this.startGame();
    }

    private resizeBackground(gameSize: Phaser.Structs.Size) {
        if (!this.background) return;
        const width = gameSize.width;
        const height = gameSize.height;
        const bgWidth = this.textures.get("mainMenuBackground").getSourceImage().width;
        const bgHeight = this.textures.get("mainMenuBackground").getSourceImage().height;

        const scaleX = width / bgWidth;
        const scaleY = height / bgHeight;
        const scale = Math.max(scaleX, scaleY);
        this.background.setScale(scale).setPosition(width / 2, height / 2);
    }

    private createButtons() {
        const centerX = 0;
        let yOffset = 150;
        const buttonSpacing = 60;

        const createButton = (text: string, callback: () => void) => {
            const button = this.add.text(centerX, yOffset, text, {
                fontSize: "32px",
                fontFamily: "Arial",
                color: "#eee",
                backgroundColor: "#333",
                padding: { x: 20, y: 10 },
                borderRadius: 8,
                align: "center",
            })
                .setOrigin(0.5)
                .setInteractive()
                .on("pointerdown", callback)
                .on("pointerover", () => button.setStyle({ backgroundColor: "#555" }))
                .on("pointerout", () => button.setStyle({ backgroundColor: "#333" }));
            this.container.add(button);
            yOffset += buttonSpacing;
            return button;
        };

        createButton("Start Game", this.startGame.bind(this));
        createButton("Options", this.openOptions.bind(this));
        createButton("Credits", this.openCredits.bind(this));
        createButton("Generate Images (Dev)", this.downloadRecipeImages.bind(this)); // Keep for development
    }

    private openOptions() {
        this.scene.start(SceneKeys.Options); // Use SceneKeys
    }

    private openCredits() {
        this.scene.start(SceneKeys.Credits); // Use SceneKeys
    }

    // Method to change scene to Game
    private startGame() {
        this.scene.start(SceneKeys.Game); // Use SceneKeys
    }

    // --- Helper: Get Junk Detail Map ---
    private getJunkDetailMap(): Map<JunkDetailId, JunkDetail> {
        return Object.values(lootConfig.junkDetails)
            .flat()
            .reduce((map, detail) => {
                map.set(detail.id, detail);
                return map;
            }, new Map<JunkDetailId, JunkDetail>());
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
        if (socketsToFill.length === 0) {
            if (currentCombination.length > 0) {
                allCombinations.push([...currentCombination]);
            }
            return allCombinations;
        }

        const currentSocket = socketsToFill[0];
        const remainingSockets = socketsToFill.slice(1);
        const requiredType = currentSocket.acceptType;

        const suitableDetails: JunkDetail[] = Array.from(availableDetailsMap.values()).filter(
            (detail) =>
                !usedDetailIds.has(detail.id) &&
                detail.suitableForRecipeDetails.includes(requiredType)
        );

        if (suitableDetails.length === 0) {
            return allCombinations;
        }

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
        const tempRTWidth = 512;
        const tempRTHeight = 512;

        for (const recipe of allRecipes) {
            console.log(`Processing recipe: ${recipe.id}`);

            const requiredDetailSockets: RecipeDetailSocket[] = recipe.sockets.reduce(
                (acc: RecipeDetailSocket[], partSocket: RecipePartSocket) => {
                    const partDef = this.findPartDefinition(partSocket.acceptType);
                    if (partDef) {
                        acc.push(...partDef.sockets);
                    }
                    return acc;
                },
                []
            );

            requiredDetailSockets.sort((a, b) => a.pinpoint.zIndex - b.pinpoint.zIndex);

            if (requiredDetailSockets.length === 0) {
                console.log(
                    `Recipe ${recipe.id} has no detail sockets, skipping combination generation.`
                );
                continue;
            }

            console.log(
                `Generating combinations for ${recipe.id} with ${requiredDetailSockets.length} sockets...`
            );
            const detailCombinations = this._generateDetailCombinations(
                requiredDetailSockets,
                allJunkDetailsMap
            );
            console.log(
                `Found ${detailCombinations.length} valid combinations for ${recipe.id}.`
            );

            if (detailCombinations.length === 0) {
                console.warn(
                    `No valid detail combinations found for recipe ${recipe.id}.`
                );
                continue;
            }

            for (let i = 0; i < detailCombinations.length; i++) {
                const combination = detailCombinations[i];
                const tempLootItem: LootItem = {
                    id: `temp_${recipe.id}_${i}`,
                    recipeId: recipe.id,
                    details: combination,
                    name: recipe.name,
                    rarity: Rarity.Common,
                    sellPrice: 0,
                    temperatureRange: { min: 0, max: 100 },
                };

                const tempRT = this.make.renderTexture({
                    width: tempRTWidth,
                    height: tempRTHeight,
                });

                const comboKey = `${recipe.id}_${i}`;
                console.log(`Rendering recipe ${recipe.id} combination ${i}`);
                this.itemRenderer.renderItemToTexture(tempLootItem, tempRT);
                console.log(`Rendered to RenderTexture for ${comboKey}`);

                try {
                    const imageDataUrl: string = await new Promise((resolve) => {
                        tempRT.snapshot((image) => {
                            if (!(image instanceof HTMLImageElement)) {
                                console.error("Received Color instead of Image");
                                resolve("");
                                return;
                            }
                            console.log(`Snapshot captured for ${comboKey} (as Image)`);
                            if (image.width === 0 || image.height === 0) {
                                console.warn(`Snapshot image for ${comboKey} has zero dimensions.`);
                                resolve("");
                                return;
                            }
                            const tempCanvas = document.createElement("canvas");
                            tempCanvas.width = image.width;
                            tempCanvas.height = image.height;
                            const ctx = tempCanvas.getContext("2d");
                            if (ctx) {
                                ctx.drawImage(image, 0, 0);
                                resolve(tempCanvas.toDataURL("image/png"));
                            } else {
                                console.error(`Could not get 2D context for temp canvas (${comboKey})`);
                                resolve("");
                            }
                        });
                    });
                    console.log(`snapshot dataURL length for ${comboKey}: ${imageDataUrl.length}`);

                    if (imageDataUrl && imageDataUrl.length > 0) {
                        const filename = `${recipe.id}_combination_${i}.png`;
                        console.log(`Downloading image for ${comboKey} as ${filename}`);
                        const link = document.createElement("a");
                        link.href = imageDataUrl;
                        link.download = filename;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    } else {
                        console.warn(`No imageDataUrl for key: ${comboKey}`);
                        console.warn(
                            `Failed to get image data for ${recipe.id} combination ${i}`
                        );
                    }
                } catch (error) {
                    console.error(
                        `Error processing ${recipe.id} combination ${i}:`,
                        error
                    );
                } finally {
                    tempRT.destroy();
                }
            }
            console.log(`Finished rendering ${detailCombinations.length} images for ${recipe.id}.`);
        }

        console.log("All images downloaded.");
    }

    shutdown() {
        this.scale.off("resize", this.resizeBackground, this);
    }
}
