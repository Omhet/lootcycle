import { GameObjects, Scene } from "phaser"; // Removed Textures import
import { lootConfig } from "../../lib/craft/config";
import {
  JunkPiece,
  JunkPieceId,
  LootItem,
  Pinpoint,
  RecipeDetailSocket,
  RecipeDetailType,
  RecipeItem,
  RecipePart,
  RecipePartSocket,
  RecipePartType,
} from "../../lib/craft/craftModel";

interface RenderedDetailInfo {
  sprite: Phaser.GameObjects.Sprite;
  x: number;
  y: number;
  rotation: number;
  zIndex: number; // Keep zIndex for potential future use or debugging
}

/**
 * Service responsible for rendering a crafted item onto a RenderTexture.
 * It handles dimension estimation, positioning calculations, and drawing logic,
 * independent of how or where the final texture is displayed.
 */
export class CraftedItemRenderer {
  private scene: Scene;
  // Cache for estimated part dimensions, specific to a rendering session
  private estimatedPartDimensionsCache = new Map<RecipePartType, { width: number; height: number }>();

  constructor(scene: Scene) {
    this.scene = scene;
  }

  // --- Public Rendering Method ---

  /**
   * Renders a given LootItem onto the provided RenderTexture.
   * @param item The LootItem to render.
   * @param targetRT The RenderTexture to draw onto.
   * @param clearTexture Should the texture be cleared before drawing? Defaults to true.
   */
  public renderItemToTexture(item: LootItem, targetRT: GameObjects.RenderTexture, clearTexture: boolean = true): void {
    const recipeItem = this.findRecipeItem(item.recipeId);
    if (!recipeItem) {
      console.error(`RecipeItem not found for id: ${item.recipeId}`);
      return;
    }

    // Clear cache for this rendering operation
    this.estimatedPartDimensionsCache.clear();

    // --- Pass 1: Estimate Dimensions ---
    this.estimateAllPartDimensions(recipeItem);

    // --- Pass 2: Calculate Positions & Prepare Sprites ---
    const detailsToDraw = this.prepareDetailsForDrawing(item, recipeItem);

    // --- Pass 3: Calculate Centering Offset ---
    const { offsetX, offsetY } = this.calculateCenteringOffset(detailsToDraw);

    // --- Pass 4: Draw to RenderTexture ---
    if (clearTexture) {
      targetRT.clear();
      targetRT.fill(0x000000, 0); // Use transparent fill
    }

    // Sort by original zIndex before drawing (important for overlap)
    detailsToDraw.sort((a, b) => a.zIndex - b.zIndex);

    detailsToDraw.forEach((detailInfo) => {
      detailInfo.sprite.setRotation(detailInfo.rotation);
      // Adjust coordinates from calculated center-relative to top-left-relative for draw()
      const drawX = detailInfo.x + offsetX + targetRT.width / 2;
      const drawY = detailInfo.y + offsetY + targetRT.height / 2;

      targetRT.draw(
        detailInfo.sprite,
        drawX, // Top-left-relative X
        drawY // Top-left-relative Y
      );
      // Clean up the temporary sprite immediately after drawing
      detailInfo.sprite.destroy();
    });
  }

  // --- Asynchronous Data Extraction ---

  /**
   * Asynchronously retrieves the base64 encoded data URL of the provided RenderTexture.
   * Waits for the next frame to ensure rendering is complete.
   * @param sourceRT The RenderTexture to get the data from.
   * @returns A promise that resolves with the data URL string, or null if failed.
   */
  public getImageDataUrl(sourceRT: GameObjects.RenderTexture): Promise<string | null> {
    return new Promise((resolve) => {
      // Use game's event emitter for POST_STEP
      this.scene.game.events.once(Phaser.Core.Events.POST_STEP, () => {
        if (!sourceRT || !sourceRT.texture || !sourceRT.active) {
          // Check if RT and its texture exist and RT is active
          console.warn("RenderTexture not available or inactive for getImageDataUrl.");
          resolve(null);
          return;
        }
        try {
          // Use the texture key associated with the RenderTexture
          const textureKey = sourceRT.texture.key;
          const dataUrl = this.scene.textures.getBase64(textureKey);
          resolve(dataUrl);
        } catch (error) {
          console.error("Error getting base64 data from RenderTexture:", error);
          resolve(null);
        }
      });
    });
  }

  // --- Internal Logic (Moved from CraftedItemManager) ---

  private findRecipeItem(recipeId: string): RecipeItem | undefined {
    return Object.values(lootConfig.recipeItems)
      .flat()
      .find((item) => item.id === recipeId);
  }

  private estimateAllPartDimensions(recipeItem: RecipeItem): void {
    const JunkPieceDataMap = this.getJunkPieceMap();
    const uniquePartTypes = new Set<RecipePartType>(recipeItem.sockets.map((s: RecipePartSocket) => s.acceptType));

    uniquePartTypes.forEach((partType) => {
      const partDefinition = this.findPartDefinition(partType);
      if (!partDefinition) {
        console.warn(`Part definition not found for type ${partType} during estimation.`);
        this.estimatedPartDimensionsCache.set(partType, {
          width: 1,
          height: 1,
        });
        return;
      }

      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      let hasDetails = false;

      partDefinition.sockets.forEach((detailSocket: RecipeDetailSocket) => {
        const detailData = this.findRepresentativeDetail(detailSocket.acceptType, JunkPieceDataMap);
        if (!detailData) return;

        const frameName = `${detailData.id}.png`;
        const texture = this.scene.textures.get("loot-details-sprites");
        const frame = texture.get(frameName);

        if (!frame || frame.name === "__MISSING") {
          console.warn(`Frame not found for detail ${detailData.id} during estimation.`);
          return;
        }

        const detailDimensions = {
          width: frame.cutWidth,
          height: frame.cutHeight,
        };
        const detailPosX = detailSocket.pinpoint.localOffset.x * detailDimensions.width;
        const detailPosY = detailSocket.pinpoint.localOffset.y * detailDimensions.height;

        const halfWidth = detailDimensions.width / 2;
        const halfHeight = detailDimensions.height / 2;
        minX = Math.min(minX, detailPosX - halfWidth);
        minY = Math.min(minY, detailPosY - halfHeight);
        maxX = Math.max(maxX, detailPosX + halfWidth);
        maxY = Math.max(maxY, detailPosY + halfHeight);
        hasDetails = true;
      });

      if (hasDetails && isFinite(minX)) {
        this.estimatedPartDimensionsCache.set(partType, {
          width: Math.max(1, maxX - minX),
          height: Math.max(1, maxY - minY),
        });
      } else {
        this.estimatedPartDimensionsCache.set(partType, {
          width: 1,
          height: 1,
        });
        console.warn(`Could not estimate dimensions for part ${partType}, using default 1x1.`);
      }
    });
  }

  private findRepresentativeDetail(detailType: RecipeDetailType, map: Map<JunkPieceId, JunkPiece>): JunkPiece | undefined {
    for (const detail of map.values()) {
      if (detail.suitableForRecipeDetails.includes(detailType)) {
        return detail;
      }
    }
    return undefined;
  }

  private getJunkPieceMap(): Map<JunkPieceId, JunkPiece> {
    const map = new Map<JunkPieceId, JunkPiece>();
    Object.values(lootConfig.junkPieces)
      .flat()
      .forEach((detail) => {
        map.set(detail.id, detail);
      });
    return map;
  }

  private findPartDefinition(partType: RecipePartType): RecipePart | undefined {
    return Object.values(lootConfig.recipeParts)
      .flat()
      .find((p) => p.type === partType);
  }

  private calculatePosition(
    parentAnchor: { x: number; y: number },
    parentDimensions: { width: number; height: number },
    selfDimensions: { width: number; height: number },
    pinpoint: Pinpoint
  ): { x: number; y: number } {
    const coordOffsetX = pinpoint.coords.x * parentDimensions.width;
    const coordOffsetY = pinpoint.coords.y * parentDimensions.height;
    const basePos = {
      x: parentAnchor.x + coordOffsetX,
      y: parentAnchor.y + coordOffsetY,
    };

    const localOffsetX = pinpoint.localOffset.x * selfDimensions.width;
    const localOffsetY = pinpoint.localOffset.y * selfDimensions.height;

    return { x: basePos.x + localOffsetX, y: basePos.y + localOffsetY };
  }

  private prepareDetailsForDrawing(item: LootItem, recipeItem: RecipeItem): RenderedDetailInfo[] {
    const detailsToDraw: RenderedDetailInfo[] = [];
    const JunkPieceDataMap = this.getJunkPieceMap();
    const availableDetailIds = new Set<JunkPieceId>(item.details);
    const rtAnchor = { x: 0, y: 0 }; // Base anchor for parts is the center of the conceptual RT

    // Sort parts by zIndex first
    const sortedPartSockets = [...recipeItem.sockets].sort((a, b) => a.pinpoint.zIndex - b.pinpoint.zIndex);

    sortedPartSockets.forEach((partSocket) => {
      const partDefinition = this.findPartDefinition(partSocket.acceptType);
      if (!partDefinition) return;

      const estimatedPartDimensions = this.estimatedPartDimensionsCache.get(partSocket.acceptType) ?? { width: 1, height: 1 };

      // Calculate the anchor position for this part relative to the RT center
      const partFinalAnchorPos = this.calculatePosition(
        rtAnchor, // Parent anchor is RT center
        { width: 0, height: 0 }, // Parent dimensions (RT itself) - coords are relative to anchor only here
        estimatedPartDimensions, // Self dimensions for local offset calc if needed (usually 0 for parts)
        partSocket.pinpoint // Pinpoint defining part's position relative to RT center
      );

      // Sort detail sockets within the part by their zIndex
      const sortedDetailSockets = [...partDefinition.sockets].sort((a, b) => a.pinpoint.zIndex - b.pinpoint.zIndex);

      sortedDetailSockets.forEach((detailSocket) => {
        const requiredDetailType = detailSocket.acceptType;
        let foundDetailId: JunkPieceId | null = null;

        for (const detailId of availableDetailIds) {
          const detailData = JunkPieceDataMap.get(detailId);
          if (detailData && detailData.suitableForRecipeDetails.includes(requiredDetailType)) {
            foundDetailId = detailId;
            break;
          }
        }

        if (foundDetailId) {
          availableDetailIds.delete(foundDetailId); // Consume the detail

          const frameName = `${foundDetailId}.png`;
          // Create a temporary sprite - DO NOT add it to the scene's display list
          const tempSprite = this.scene.make.sprite({ key: "loot-details-sprites", frame: frameName }, false);
          tempSprite.setOrigin(0.5, 0.5);

          const detailDimensions = {
            width: tempSprite.displayWidth,
            height: tempSprite.displayHeight,
          };

          // Calculate detail position relative to the PART's anchor position
          const detailFinalPos = this.calculatePosition(
            partFinalAnchorPos, // Parent anchor is the part's calculated anchor
            estimatedPartDimensions, // Parent dimensions are the part's estimated dimensions
            detailDimensions, // Self dimensions are the detail's sprite dimensions
            detailSocket.pinpoint // Pinpoint defining detail's position relative to part
          );

          const detailRotation = Phaser.Math.DegToRad(detailSocket.pinpoint.localRotationAngle);

          // Store sprite and calculated position relative to the conceptual (0,0) center
          detailsToDraw.push({
            sprite: tempSprite,
            x: detailFinalPos.x,
            y: detailFinalPos.y,
            rotation: detailRotation,
            zIndex: partSocket.pinpoint.zIndex + detailSocket.pinpoint.zIndex / 100, // Combine zIndices for sorting later
          });
        }
      });
    });

    return detailsToDraw;
  }

  private calculateCenteringOffset(detailsToDraw: RenderedDetailInfo[]): {
    offsetX: number;
    offsetY: number;
  } {
    let overallMinX = Infinity,
      overallMinY = Infinity,
      overallMaxX = -Infinity,
      overallMaxY = -Infinity;

    detailsToDraw.forEach((detailInfo) => {
      // Use sprite dimensions for bounds calculation
      const halfWidth = detailInfo.sprite.displayWidth / 2;
      const halfHeight = detailInfo.sprite.displayHeight / 2;
      // Note: Rotation is not accounted for in this simple bounding box; for rotated items, bounds might be larger.
      // A more accurate approach would involve calculating rotated bounding boxes.
      overallMinX = Math.min(overallMinX, detailInfo.x - halfWidth);
      overallMinY = Math.min(overallMinY, detailInfo.y - halfHeight);
      overallMaxX = Math.max(overallMaxX, detailInfo.x + halfWidth);
      overallMaxY = Math.max(overallMaxY, detailInfo.y + halfHeight);
    });

    let offsetX = 0;
    let offsetY = 0;

    if (detailsToDraw.length > 0 && isFinite(overallMinX)) {
      const centerX = (overallMinX + overallMaxX) / 2;
      const centerY = (overallMinY + overallMaxY) / 2;
      offsetX = -centerX; // Offset needed to move the calculated center to (0,0)
      offsetY = -centerY;
    } else {
      console.log("[Centering] No details or invalid bounds, skipping offset calculation.");
    }

    return { offsetX, offsetY };
  }

  /**
   * Cleans up any internal state if necessary. Currently clears the dimension cache.
   * Call this if the renderer instance is long-lived and you want to reset state between unrelated render batches.
   */
  public cleanup(): void {
    this.estimatedPartDimensionsCache.clear();
  }
}
