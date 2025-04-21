import { Scene } from "phaser";
import { lootConfig } from "../../../lib/craft/config";
import {
    JunkDetail,
    JunkDetailId,
    LootItem, // Corrected typo if present in original
    Pinpoint,
    RecipeDetailSocket, // Added RecipeItem type
    RecipeDetailType,
    RecipeItem,
    RecipePart,
    RecipePartSocket,
    RecipePartType, // Corrected typo if present in original
} from "../../../lib/craft/craftModel";
import { DepthLayers } from "../Game";

export class CraftedItemManager {
    private scene: Scene;
    private craftedItemRT: Phaser.GameObjects.RenderTexture;
    private craftedItem: LootItem | null = null;
    // Cache for estimated part dimensions
    private estimatedPartDimensionsCache = new Map<
        RecipePartType,
        { width: number; height: number }
    >();

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
        const rtY = this.scene.cameras.main.height / 2; // Center vertically

        this.craftedItemRT = this.scene.add.renderTexture(
            rtX,
            rtY,
            rtWidth,
            rtHeight
        );
        this.craftedItemRT.setOrigin(0.5, 0.5); // Set origin to center for easier positioning
        this.craftedItemRT.setDepth(DepthLayers.UI);
        this.craftedItemRT.setVisible(false);
        this.craftedItemRT.fill(0xffffff, 0); // Initial background
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

    // --- Pass 1: Estimate Part Dimensions ---
    private estimateAllPartDimensions(recipeItem: RecipeItem): void {
        this.estimatedPartDimensionsCache.clear();
        const junkDetailDataMap = this.getJunkDetailMap();
        const uniquePartTypes = new Set<RecipePartType>(
            recipeItem.sockets.map((s: RecipePartSocket) => s.acceptType)
        );

        uniquePartTypes.forEach((partType) => {
            const partDefinition = this.findPartDefinition(partType);
            if (!partDefinition) {
                console.warn(
                    `Part definition not found for type ${partType} during estimation.`
                );
                this.estimatedPartDimensionsCache.set(partType, {
                    width: 1,
                    height: 1,
                }); // Default
                return;
            }

            let minX = Infinity,
                minY = Infinity,
                maxX = -Infinity,
                maxY = -Infinity;
            let hasDetails = false;

            partDefinition.sockets.forEach(
                (detailSocket: RecipeDetailSocket) => {
                    // Find *a* representative detail for dimension estimation
                    const detailData = this.findRepresentativeDetail(
                        detailSocket.acceptType,
                        junkDetailDataMap
                    );
                    if (!detailData) {
                        // console.warn(`No representative detail found for ${detailSocket.acceptType} in part ${partType}`);
                        return; // Skip if no suitable detail found for estimation
                    }

                    const frameName = `${detailData.id}.png`;
                    const texture = this.scene.textures.get("details-sprites");
                    const frame = texture.get(frameName);

                    if (!frame || frame.name === "__MISSING") {
                        console.warn(
                            `Frame not found for detail ${detailData.id} during estimation.`
                        );
                        return;
                    }

                    const detailDimensions = {
                        width: frame.cutWidth,
                        height: frame.cutHeight,
                    };

                    // Calculate position offset for estimation based ONLY on localOffset relative to {0,0}
                    const detailPosX =
                        detailSocket.pinpoint.localOffset.x *
                        detailDimensions.width;
                    const detailPosY =
                        detailSocket.pinpoint.localOffset.y *
                        detailDimensions.height;

                    // Update bounding box (Phaser sprites default origin is 0.5, 0.5)
                    const halfWidth = detailDimensions.width / 2;
                    const halfHeight = detailDimensions.height / 2;
                    minX = Math.min(minX, detailPosX - halfWidth);
                    minY = Math.min(minY, detailPosY - halfHeight);
                    maxX = Math.max(maxX, detailPosX + halfWidth);
                    maxY = Math.max(maxY, detailPosY + halfHeight);
                    hasDetails = true;
                }
            );

            if (hasDetails && isFinite(minX)) {
                this.estimatedPartDimensionsCache.set(partType, {
                    width: Math.max(1, maxX - minX), // Ensure minimum size 1
                    height: Math.max(1, maxY - minY),
                });
                // console.log(`Estimated dimensions for ${partType}: w=${maxX - minX}, h=${maxY - minY}`);
            } else {
                this.estimatedPartDimensionsCache.set(partType, {
                    width: 1,
                    height: 1,
                });
                console.warn(
                    `Could not estimate dimensions for part ${partType} (no valid details found?), using default 1x1.`
                );
            }
        });
    }

    // Helper to find a detail matching the type for estimation
    private findRepresentativeDetail(
        detailType: RecipeDetailType,
        map: Map<JunkDetailId, JunkDetail>
    ): JunkDetail | undefined {
        for (const detail of map.values()) {
            if (detail.suitableForRecipeDetails.includes(detailType)) {
                return detail;
            }
        }
        return undefined;
    }

    // Helper to get junk details map
    private getJunkDetailMap(): Map<JunkDetailId, JunkDetail> {
        const map = new Map<JunkDetailId, JunkDetail>();
        Object.values(lootConfig.junkDetails)
            .flat()
            .forEach((detail) => {
                map.set(detail.id, detail);
            });
        return map;
    }

    // Helper to find part definition
    private findPartDefinition(
        partType: RecipePartType
    ): RecipePart | undefined {
        return Object.values(lootConfig.recipeParts)
            .flat()
            .find((p) => p.type === partType);
    }

    /**
     * Renders the current crafted item using the two-pass approach.
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

        // --- Pass 1: Estimate Dimensions ---
        this.estimateAllPartDimensions(recipeItem);

        // --- Pass 2: Final Rendering ---
        this.craftedItemRT.setVisible(true);
        this.craftedItemRT.clear();
        this.craftedItemRT.fill(0xffffff, 0);

        const rtDimensions = {
            width: this.craftedItemRT.width,
            height: this.craftedItemRT.height,
        };
        const rtAnchor = { x: 0, y: 0 }; // RT center

        const junkDetailDataMap = this.getJunkDetailMap();
        const availableDetailIds = new Set<JunkDetailId>(
            this.craftedItem.details
        );

        // Store details and their calculated positions before drawing
        const detailsToDraw: {
            sprite: Phaser.GameObjects.Sprite;
            x: number;
            y: number;
            rotation: number;
        }[] = [];
        let overallMinX = Infinity,
            overallMinY = Infinity,
            overallMaxX = -Infinity,
            overallMaxY = -Infinity;

        // Sort parts by zIndex for correct drawing order
        const sortedPartSockets = [...recipeItem.sockets].sort(
            (a, b) => a.pinpoint.zIndex - b.pinpoint.zIndex
        );

        sortedPartSockets.forEach((partSocket) => {
            const partDefinition = this.findPartDefinition(
                partSocket.acceptType
            );
            if (!partDefinition) {
                console.warn(
                    `Part definition not found for type ${partSocket.acceptType} during rendering.`
                );
                return;
            }

            const estimatedPartDimensions =
                this.estimatedPartDimensionsCache.get(
                    partSocket.acceptType
                ) ?? { width: 1, height: 1 }; // Use default if not found

            const partFinalAnchorPos = this.calculatePosition(
                rtAnchor,
                rtDimensions,
                estimatedPartDimensions,
                partSocket.pinpoint
            );

            const sortedDetailSockets = [...partDefinition.sockets].sort(
                (a, b) => a.pinpoint.zIndex - b.pinpoint.zIndex
            );

            sortedDetailSockets.forEach((detailSocket) => {
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
                        break;
                    }
                }

                if (foundDetailId) {
                    availableDetailIds.delete(foundDetailId);

                    const frameName = `${foundDetailId}.png`;
                    const tempSprite = this.scene.add.sprite(
                        0,
                        0,
                        "details-sprites",
                        frameName
                    );
                    tempSprite.setOrigin(0.5, 0.5);

                    const detailDimensions = {
                        width: tempSprite.displayWidth,
                        height: tempSprite.displayHeight,
                    };

                    const detailFinalPos = this.calculatePosition(
                        partFinalAnchorPos,
                        estimatedPartDimensions,
                        detailDimensions,
                        detailSocket.pinpoint
                    );

                    const detailRotation = Phaser.Math.DegToRad(
                        detailSocket.pinpoint.localRotationAngle
                    );

                    // Store for later drawing and bounds calculation
                    detailsToDraw.push({
                        sprite: tempSprite,
                        x: detailFinalPos.x,
                        y: detailFinalPos.y,
                        rotation: detailRotation,
                    });

                    // Update overall bounds (sprite origin is 0.5, 0.5)
                    const halfWidth = detailDimensions.width / 2;
                    const halfHeight = detailDimensions.height / 2;
                    overallMinX = Math.min(
                        overallMinX,
                        detailFinalPos.x - halfWidth
                    );
                    overallMinY = Math.min(
                        overallMinY,
                        detailFinalPos.y - halfHeight
                    );
                    overallMaxX = Math.max(
                        overallMaxX,
                        detailFinalPos.x + halfWidth
                    );
                    overallMaxY = Math.max(
                        overallMaxY,
                        detailFinalPos.y + halfHeight
                    );
                } else {
                    // console.warn(`No suitable JunkDetail found for RecipeDetailType: ${requiredDetailType} in part ${partDefinition.type}`);
                }
            });
        });

        // --- Pass 3: Calculate Centering Offset and Draw ---
        let offsetX = 0;
        let offsetY = 0;

        if (detailsToDraw.length > 0 && isFinite(overallMinX)) {
            const centerX = (overallMinX + overallMaxX) / 2;
            const centerY = (overallMinY + overallMaxY) / 2;
            offsetX = -centerX; // Offset needed to move center to (0,0)
            offsetY = -centerY;

            // --- DEBUG LOGGING ---
            console.log(
                `[Centering] Bounds: X[${overallMinX.toFixed(
                    2
                )}, ${overallMaxX.toFixed(2)}], Y[${overallMinY.toFixed(
                    2
                )}, ${overallMaxY.toFixed(2)}]`
            );
            console.log(
                `[Centering] Calculated Center: (${centerX.toFixed(
                    2
                )}, ${centerY.toFixed(2)})`
            );
            console.log(
                `[Centering] Applied Offset: (${offsetX.toFixed(
                    2
                )}, ${offsetY.toFixed(2)})`
            );
            // --- END DEBUG LOGGING ---
        } else {
            console.log(
                "[Centering] No details or invalid bounds, skipping offset calculation."
            );
        }

        // Draw all stored details with the centering offset
        detailsToDraw.forEach((detailInfo) => {
            detailInfo.sprite.setRotation(detailInfo.rotation);
            // Adjust coordinates from center-relative to top-left-relative for draw()
            const drawX = detailInfo.x + offsetX + this.craftedItemRT.width / 2;
            const drawY =
                detailInfo.y + offsetY + this.craftedItemRT.height / 2;
            this.craftedItemRT.draw(
                detailInfo.sprite,
                drawX, // Top-left-relative X
                drawY // Top-left-relative Y
            );
            detailInfo.sprite.destroy(); // Clean up
        });
    }

    /**
     * Calculates final position based on parent anchor, parent dimensions, self dimensions, and pinpoint.
     * coords: Relative offset based on parent dimensions (e.g., {x:0, y:-0.5} is top-center of parent).
     * localOffset: Relative offset based on own dimensions (e.g., {x:0, y:-0.5} shifts self up by half own height).
     * Assumes parentAnchor is the reference point (e.g., center {0,0} if parent origin is 0.5,0.5)
     */
    private calculatePosition(
        parentAnchor: { x: number; y: number },
        parentDimensions: { width: number; height: number },
        selfDimensions: { width: number; height: number },
        pinpoint: Pinpoint
    ): { x: number; y: number } {
        // 1. Calculate base position offset using coords relative to parent anchor and dimensions
        const coordOffsetX = pinpoint.coords.x * parentDimensions.width;
        const coordOffsetY = pinpoint.coords.y * parentDimensions.height;
        const basePos = {
            x: parentAnchor.x + coordOffsetX,
            y: parentAnchor.y + coordOffsetY,
        };

        // 2. Calculate local offset relative to self dimensions
        const localOffsetX = pinpoint.localOffset.x * selfDimensions.width;
        const localOffsetY = pinpoint.localOffset.y * selfDimensions.height;

        // 3. Final position = base position + local offset
        return {
            x: basePos.x + localOffsetX,
            y: basePos.y + localOffsetY,
        };
    }

    /**
     * Clears the current crafted item display.
     */
    public clearDisplay(): void {
        this.craftedItemRT.setVisible(false);
        this.craftedItemRT.clear(); // Clear drawings
        this.craftedItemRT.fill(0xffffff, 0); // Re-apply background
        this.craftedItem = null;
        this.estimatedPartDimensionsCache.clear(); // Clear cache when display is cleared
    }

    /**
     * Cleans up resources used by the manager, like the render texture.
     * Should be called when the scene shuts down.
     */
    public destroy(): void {
        this.estimatedPartDimensionsCache.clear();
        if (this.craftedItemRT) {
            this.craftedItemRT.destroy();
        }
        this.craftedItem = null;
    }
}
