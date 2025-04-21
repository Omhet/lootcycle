import { Scene } from "phaser";
import { lootConfig } from "../../../lib/craft/config";
import {
    JunkDetail,
    JunkDetailId,
    LootItem,
    Pinpoint,
} from "../../../lib/craft/craftModel";
import { DepthLayers } from "../Game"; // Assuming DepthLayers is exported from Game.ts or moved

export class CraftedItemManager {
    private scene: Scene;
    private craftedItemRT: Phaser.GameObjects.RenderTexture;
    private craftedItem: LootItem | null = null;

    constructor(scene: Scene) {
        this.scene = scene;
        this.initializeDisplay();
    }

    /**
     * Initializes the render texture for displaying crafted items
     */
    private initializeDisplay(): void {
        const rtWidth = 400;
        const rtHeight = 400;
        const rtX = this.scene.cameras.main.width / 2;
        const rtY = this.scene.cameras.main.height / 2 - rtHeight / 2;

        this.craftedItemRT = this.scene.add.renderTexture(
            rtX,
            rtY,
            rtWidth,
            rtHeight
        );
        this.craftedItemRT.setDepth(DepthLayers.UI); // Ensure DepthLayers is accessible
        this.craftedItemRT.setVisible(false);
        this.craftedItemRT.fill(0x000000, 0.7); // Initial background
    }

    /**
     * Sets the item to be displayed and triggers rendering.
     * @param item The LootItem to display.
     */
    public displayItem(item: LootItem): void {
        this.clearDisplay(); // Clear previous item first
        this.craftedItem = item;
        this.renderCraftedItem();
    }

    /**
     * Renders the current crafted item directly to the render texture
     * using the socket and pinpoint structure from the recipe.
     */
    private renderCraftedItem(): void {
        if (!this.craftedItem) return;

        const recipeItem = Object.values(lootConfig.recipeItems)
            .flat()
            .find((item) => item.id === this.craftedItem?.recipeId);

        if (!recipeItem) {
            console.error(
                `RecipeItem not found for id: ${this.craftedItem.recipeId}`
            );
            return;
        }

        this.craftedItemRT.setVisible(true);
        this.craftedItemRT.clear(); // Clear previous drawing
        this.craftedItemRT.fill(0x000000, 0.7); // Re-apply background

        const rtCenter = {
            x: this.craftedItemRT.width / 2,
            y: this.craftedItemRT.height / 2,
        };

        const junkDetailDataMap = new Map<JunkDetailId, JunkDetail>();
        Object.values(lootConfig.junkDetails)
            .flat()
            .forEach((detail) => {
                junkDetailDataMap.set(detail.id, detail);
            });

        const availableDetailIds = new Set<JunkDetailId>(
            this.craftedItem.details
        );

        recipeItem.sockets
            .sort((a, b) => a.pinpoint.zIndex - b.pinpoint.zIndex)
            .forEach((partSocket) => {
                const part = Object.values(lootConfig.recipeParts)
                    .flat()
                    .find((p) => p.type === partSocket.acceptType);

                if (!part) {
                    console.error(
                        `PecipePart not found for type: ${partSocket.acceptType}`
                    );
                    return;
                }

                const partPos = this.calculatePosition(
                    rtCenter,
                    partSocket.pinpoint
                );

                part.sockets
                    .sort((a, b) => a.pinpoint.zIndex - b.pinpoint.zIndex)
                    .forEach((detailSocket) => {
                        const requiredDetailType = detailSocket.acceptType;
                        let foundDetailId: JunkDetailId | null = null;

                        for (const detailId of availableDetailIds) {
                            const detailData = junkDetailDataMap.get(detailId);
                            if (
                                detailData &&
                                detailData.suitableForRecipeDetails.includes(
                                    requiredDetailType
                                )
                            ) {
                                foundDetailId = detailId;
                                break;
                            }
                        }

                        if (foundDetailId) {
                            availableDetailIds.delete(foundDetailId);

                            const detailPos = this.calculatePosition(
                                partPos,
                                detailSocket.pinpoint
                            );
                            const frameName = `${foundDetailId}.png`;

                            // Use scene's add factory to create temporary sprite
                            const tempSprite = this.scene.add.sprite(
                                0,
                                0,
                                "details-sprites",
                                frameName
                            );
                            tempSprite.setRotation(
                                detailSocket.pinpoint.localRotationAngle
                            );

                            this.craftedItemRT.draw(
                                tempSprite,
                                detailPos.x,
                                detailPos.y
                            );
                            tempSprite.destroy(); // Destroy temporary sprite
                        }
                    });
            });
    }

    /**
     * Calculates a position based on a parent position and a pinpoint.
     * @param parentPos The parent position {x, y}.
     * @param pinpoint The pinpoint data for positioning.
     * @returns The calculated position {x, y}.
     */
    private calculatePosition(
        parentPos: { x: number; y: number },
        pinpoint: Pinpoint
    ): { x: number; y: number } {
        return {
            x: parentPos.x + (pinpoint.coords.x + pinpoint.localOffset.x),
            y: parentPos.y + (pinpoint.coords.y + pinpoint.localOffset.y),
        };
    }

    /**
     * Clears the current crafted item display.
     */
    public clearDisplay(): void {
        this.craftedItemRT.setVisible(false);
        this.craftedItemRT.clear(); // Clear drawings
        this.craftedItem = null;
    }

    /**
     * Cleans up resources used by the manager, like the render texture.
     * Should be called when the scene shuts down.
     */
    public destroy(): void {
        this.craftedItemRT.destroy();
        this.craftedItem = null;
    }
}
