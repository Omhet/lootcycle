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

        // --- Data Preparation ---
        const junkDetailDataMap = new Map<JunkDetailId, JunkDetail>();
        Object.values(lootConfig.junkDetails)
            .flat()
            .forEach((detail) => {
                junkDetailDataMap.set(detail.id, detail);
            });

        const availableDetailIds = new Set<JunkDetailId>(
            this.craftedItem.details
        );

        // --- Rendering Loop ---
        // Iterate through RecipeItem sockets (defining Part anchors and offsets)
        recipeItem.sockets
            .sort((a, b) => a.pinpoint.zIndex - b.pinpoint.zIndex) // Draw parts based on their zIndex
            .forEach((partSocket) => {
                const partDefinition = Object.values(lootConfig.recipeParts)
                    .flat()
                    .find((p) => p.type === partSocket.acceptType);

                if (!partDefinition) {
                    console.error(
                        `RecipePart definition not found for type: ${partSocket.acceptType}`
                    );
                    return;
                }

                // 1. Calculate the BASE anchor position for this part (ignoring part's localOffset for now)
                const partBaseAnchorPos = {
                    x: rtCenter.x + partSocket.pinpoint.coords.x,
                    y: rtCenter.y + partSocket.pinpoint.coords.y,
                };

                // Temporary storage for details belonging to this part
                const partDetailsToDraw: {
                    sprite: Phaser.GameObjects.Sprite;
                    position: { x: number; y: number }; // Position relative to partBaseAnchorPos
                    rotation: number;
                }[] = [];

                // Bounding box for the part based on its details
                let minX = Infinity,
                    minY = Infinity,
                    maxX = -Infinity,
                    maxY = -Infinity;

                // 2. Iterate through the Part's sockets (defining Detail positions relative to the part)
                partDefinition.sockets
                    .sort((a, b) => a.pinpoint.zIndex - b.pinpoint.zIndex) // Draw details within part based on their zIndex
                    .forEach((detailSocket) => {
                        const requiredDetailType = detailSocket.acceptType;
                        let foundDetailId: JunkDetailId | null = null;

                        // Find a suitable available JunkDetail
                        for (const detailId of availableDetailIds) {
                            const detailData = junkDetailDataMap.get(detailId);
                            if (
                                detailData &&
                                detailData.suitableForRecipeDetails.includes(
                                    requiredDetailType
                                )
                            ) {
                                foundDetailId = detailId;
                                break; // Found one, stop searching
                            }
                        }

                        if (foundDetailId) {
                            availableDetailIds.delete(foundDetailId); // Mark as used for this item

                            const frameName = `${foundDetailId}.png`;
                            const tempSprite = this.scene.add.sprite(
                                0,
                                0,
                                "details-sprites",
                                frameName
                            );

                            const detailDimensions = {
                                width: tempSprite.displayWidth,
                                height: tempSprite.displayHeight,
                            };

                            // Calculate detail's position relative to the part's BASE anchor
                            const detailRelativePos =
                                this.calculatePinpointPosition(
                                    { x: 0, y: 0 }, // Relative to the part's base anchor (0,0)
                                    detailSocket.pinpoint,
                                    detailDimensions
                                );

                            const detailRotation = Phaser.Math.DegToRad(
                                detailSocket.pinpoint.localRotationAngle
                            );

                            // Store for later drawing and bounding box calculation
                            partDetailsToDraw.push({
                                sprite: tempSprite,
                                position: detailRelativePos,
                                rotation: detailRotation,
                            });

                            // Update bounding box (consider sprite origin is 0.5, 0.5)
                            const halfWidth = detailDimensions.width / 2;
                            const halfHeight = detailDimensions.height / 2;
                            minX = Math.min(
                                minX,
                                detailRelativePos.x - halfWidth
                            );
                            minY = Math.min(
                                minY,
                                detailRelativePos.y - halfHeight
                            );
                            maxX = Math.max(
                                maxX,
                                detailRelativePos.x + halfWidth
                            );
                            maxY = Math.max(
                                maxY,
                                detailRelativePos.y + halfHeight
                            );
                        } else {
                            console.warn(
                                `No suitable JunkDetail found for RecipeDetailType: ${requiredDetailType} in part ${partDefinition.type}`
                            );
                        }
                    });

                // 3. Calculate Part Dimensions and Local Offset
                let partWidth = 0;
                let partHeight = 0;
                let partLocalOffsetX = 0;
                let partLocalOffsetY = 0;

                if (partDetailsToDraw.length > 0 && isFinite(minX)) {
                    partWidth = maxX - minX;
                    partHeight = maxY - minY;

                    // Calculate the part's local offset in pixels based on its calculated dimensions
                    partLocalOffsetX =
                        partSocket.pinpoint.localOffset.x * partWidth;
                    partLocalOffsetY =
                        partSocket.pinpoint.localOffset.y * partHeight;
                } else {
                    console.warn(
                        `Part ${partDefinition.type} has no details to render or invalid bounds.`
                    );
                }

                // 4. Draw the collected details for this part, applying the final offsets
                partDetailsToDraw.forEach((detailInfo) => {
                    // Final position = Base Part Anchor + Relative Detail Pos + Part Local Offset
                    const finalDrawX =
                        partBaseAnchorPos.x +
                        detailInfo.position.x +
                        partLocalOffsetX;
                    const finalDrawY =
                        partBaseAnchorPos.y +
                        detailInfo.position.y +
                        partLocalOffsetY;

                    detailInfo.sprite.setRotation(detailInfo.rotation);

                    this.craftedItemRT.draw(
                        detailInfo.sprite,
                        finalDrawX,
                        finalDrawY
                    );

                    detailInfo.sprite.destroy(); // Clean up temporary sprite
                });
            });
    }

    /**
     * Calculates the final drawing position for an element based on its parent anchor,
     * its pinpoint configuration, and its own dimensions.
     *
     * - `coords` are treated as direct offsets from the parent anchor.
     * - `localOffset` is calculated relative to the element's own dimensions.
     *
     * @param parentAnchor The anchor point {x, y} of the parent.
     * @param pinpoint The pinpoint data containing coords and localOffset.
     * @param selfDimensions The dimensions {width, y} of the element being positioned.
     * @returns The calculated final position {x, y}.
     */
    private calculatePinpointPosition(
        parentAnchor: { x: number; y: number },
        pinpoint: Pinpoint,
        selfDimensions: { width: number; height: number }
    ): { x: number; y: number } {
        // 1. Position based on parent anchor and coords (direct offset)
        const basePosX = parentAnchor.x + pinpoint.coords.x;
        const basePosY = parentAnchor.y + pinpoint.coords.y;

        // 2. Calculate offset based on localOffset and self dimensions
        const localOffsetX = pinpoint.localOffset.x * selfDimensions.width;
        const localOffsetY = pinpoint.localOffset.y * selfDimensions.height;

        // 3. Final position
        return {
            x: basePosX + localOffsetX,
            y: basePosY + localOffsetY,
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
