import { GameObjects, Scene } from "phaser";
import { lootConfig } from "../../lib/craft/config";
import {
  LootDetail,
  LootDetailId,
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
  zIndex: number;
}

/**
 * Service responsible for rendering a crafted item onto a RenderTexture.
 * It handles dimension estimation, positioning calculations, and drawing logic,
 * using LootDetail IDs directly from the LootItem.
 */
export class CraftedItemRenderer {
  private scene: Scene;
  // Cache for estimated part dimensions, specific to a rendering session
  private estimatedPartDimensionsCache = new Map<RecipePartType, { width: number; height: number }>();
  // Cache for LootDetail definitions for quick lookup
  private lootDetailMapCache: Map<LootDetailId, LootDetail> | null = null;

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

    // Clear caches for this rendering operation
    this.estimatedPartDimensionsCache.clear();
    this.lootDetailMapCache = null; // Invalidate detail map cache

    // --- Pre-computation: Build LootDetail Map ---
    const lootDetailMap = this.getLootDetailMap();

    // --- Pass 1: Estimate Dimensions ---
    this.estimateAllPartDimensions(recipeItem, lootDetailMap);

    // --- Pass 2: Calculate Positions & Prepare Sprites ---
    const detailsToDraw = this.prepareDetailsForDrawing(item, recipeItem, lootDetailMap);

    // --- Pass 3: Calculate Centering Offset ---
    const { offsetX, offsetY } = this.calculateCenteringOffset(detailsToDraw);

    // --- Pass 4: Draw to RenderTexture ---
    if (clearTexture) {
      targetRT.clear();
      targetRT.fill(0x000000, 0); // Use transparent fill
    }

    // Sort by combined zIndex before drawing (important for overlap)
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

  // --- Internal Logic ---

  private findRecipeItem(recipeId: string): RecipeItem | undefined {
    return Object.values(lootConfig.recipeItems)
      .flat()
      .find((item) => item.id === recipeId);
  }

  /** Lazily creates and caches a map of LootDetailId to LootDetail */
  private getLootDetailMap(): Map<LootDetailId, LootDetail> {
    if (this.lootDetailMapCache) {
      return this.lootDetailMapCache;
    }
    const map = new Map<LootDetailId, LootDetail>();
    Object.values(lootConfig.lootDetails)
      .flat()
      .forEach((detail) => {
        if (!map.has(detail.id)) {
          map.set(detail.id, detail);
        }
      });
    this.lootDetailMapCache = map;
    return map;
  }

  private estimateAllPartDimensions(recipeItem: RecipeItem, lootDetailMap: Map<LootDetailId, LootDetail>): void {
    const uniquePartTypes = new Set<RecipePartType>(recipeItem.sockets.map((s: RecipePartSocket) => s.acceptType));

    uniquePartTypes.forEach((partType) => {
      const partDefinition = this.findPartDefinition(partType);
      if (!partDefinition) {
        console.warn(`Part definition not found for type ${partType} during estimation.`);
        this.estimatedPartDimensionsCache.set(partType, { width: 1, height: 1 });
        return;
      }

      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      let hasDetails = false;

      partDefinition.sockets.forEach((detailSocket: RecipeDetailSocket) => {
        const representativeDetail = this.findRepresentativeLootDetail(detailSocket.acceptType, lootDetailMap);
        if (!representativeDetail) {
          console.warn(`No representative LootDetail found for type ${detailSocket.acceptType} during estimation.`);
          return;
        }

        const frameName = `${representativeDetail.id}.png`;
        const texture = this.scene.textures.get("loot-details-sprites");
        const frame = texture.get(frameName);

        if (!frame || frame.name === "__MISSING") {
          console.warn(`Frame not found for representative detail ${representativeDetail.id} during estimation.`);
          return;
        }

        const detailDimensions = { width: frame.cutWidth, height: frame.cutHeight };
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
        this.estimatedPartDimensionsCache.set(partType, { width: 1, height: 1 });
        console.warn(`Could not estimate dimensions for part ${partType}, using default 1x1.`);
      }
    });
  }

  /** Finds the first LootDetail definition matching the given type */
  private findRepresentativeLootDetail(detailType: RecipeDetailType, map: Map<LootDetailId, LootDetail>): LootDetail | undefined {
    for (const detail of map.values()) {
      if (detail.type === detailType) {
        return detail;
      }
    }
    return undefined;
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

    return { x: basePos.x - localOffsetX, y: basePos.y - localOffsetY };
  }

  private prepareDetailsForDrawing(item: LootItem, recipeItem: RecipeItem, lootDetailMap: Map<LootDetailId, LootDetail>): RenderedDetailInfo[] {
    const detailsToDraw: RenderedDetailInfo[] = [];
    const availableDetailIds = new Set<LootDetailId>(item.details);
    const rtAnchor = { x: 0, y: 0 };

    const sortedPartSockets = [...recipeItem.sockets].sort((a, b) => a.pinpoint.zIndex - b.pinpoint.zIndex);

    sortedPartSockets.forEach((partSocket) => {
      const partDefinition = this.findPartDefinition(partSocket.acceptType);
      if (!partDefinition) return;

      const estimatedPartDimensions = this.estimatedPartDimensionsCache.get(partSocket.acceptType) ?? { width: 1, height: 1 };

      const partFinalAnchorPos = this.calculatePosition(rtAnchor, { width: 0, height: 0 }, estimatedPartDimensions, partSocket.pinpoint);

      const sortedDetailSockets = [...partDefinition.sockets].sort((a, b) => a.pinpoint.zIndex - b.pinpoint.zIndex);

      sortedDetailSockets.forEach((detailSocket) => {
        const requiredDetailType = detailSocket.acceptType;
        let foundDetailId: LootDetailId | null = null;

        for (const detailId of availableDetailIds) {
          const detailData = lootDetailMap.get(detailId);
          if (detailData && detailData.type === requiredDetailType) {
            foundDetailId = detailId;
            break;
          }
        }

        if (foundDetailId) {
          availableDetailIds.delete(foundDetailId);

          const frameName = `${foundDetailId}.png`;
          const tempSprite = this.scene.make.sprite({ key: "loot-details-sprites", frame: frameName }, false);

          if (!tempSprite.texture || tempSprite.frame.name === "__MISSING") {
            console.warn(`Sprite frame missing for LootDetailId: ${foundDetailId}`);
            tempSprite.destroy();
            return;
          }

          tempSprite.setOrigin(0.5, 0.5);

          const detailDimensions = {
            width: tempSprite.width,
            height: tempSprite.height,
          };

          const detailFinalPos = this.calculatePosition(partFinalAnchorPos, estimatedPartDimensions, detailDimensions, detailSocket.pinpoint);

          const detailRotation = Phaser.Math.DegToRad(detailSocket.pinpoint.localRotationAngle);
          const combinedZIndex = partSocket.pinpoint.zIndex + detailSocket.pinpoint.zIndex / 100;

          detailsToDraw.push({
            sprite: tempSprite,
            x: detailFinalPos.x,
            y: detailFinalPos.y,
            rotation: detailRotation,
            zIndex: combinedZIndex,
          });
        } else {
          console.warn(`No suitable LootDetail found in item for required type: ${requiredDetailType} in part ${partDefinition.type}`);
        }
      });
    });

    if (availableDetailIds.size > 0) {
      console.warn(`Unused LootDetails in item ${item.id}:`, Array.from(availableDetailIds));
    }

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
      const halfWidth = detailInfo.sprite.width / 2;
      const halfHeight = detailInfo.sprite.height / 2;
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
      offsetX = -centerX;
      offsetY = -centerY;
    }

    return { offsetX, offsetY };
  }

  /**
   * Cleans up any internal state if necessary. Currently clears the dimension and detail map caches.
   * Call this if the renderer instance is long-lived and you want to reset state between unrelated render batches.
   */
  public cleanup(): void {
    this.estimatedPartDimensionsCache.clear();
    this.lootDetailMapCache = null;
  }
}
