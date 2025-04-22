import { GameObjects, Scene } from "phaser";
import { lootConfig } from "../../lib/craft/config";
import { LootDetail, LootDetailId, LootItem, RecipeItem, RecipePart, RecipePartType } from "../../lib/craft/craftModel";

interface RenderedDetailInfo {
  sprite: Phaser.GameObjects.Sprite;
  x: number;
  y: number;
  zIndex: number;
}

/**
 * Service responsible for rendering a crafted item onto a RenderTexture.
 * It uses direct positioning based on pinpoint coordinates for simplified
 * layout and zIndex for proper layering.
 */
export class CraftedItemRenderer {
  private scene: Scene;
  private lootDetailMapCache: Map<LootDetailId, LootDetail> | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
  }

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

    // Clear the detail map cache
    this.lootDetailMapCache = null;

    // Build LootDetail Map for quick lookup
    const lootDetailMap = this.getLootDetailMap();

    // Prepare details for drawing - gather all sprites with their positions and zIndices
    const detailsToDraw = this.prepareDetailsForDrawing(item, recipeItem, lootDetailMap);

    // Clear the texture if needed
    if (clearTexture) {
      targetRT.clear();
      targetRT.fill(0x000000, 0); // Use transparent fill
    }

    // Sort by zIndex before drawing
    detailsToDraw.sort((a, b) => a.zIndex - b.zIndex);

    // Draw all details to the render texture
    detailsToDraw.forEach((detailInfo) => {
      // Calculate center-aligned position for the render texture
      const drawX = detailInfo.x * targetRT.width;
      const drawY = detailInfo.y * targetRT.height;

      targetRT.draw(detailInfo.sprite, drawX, drawY);

      // Clean up the temporary sprite
      detailInfo.sprite.destroy();
    });
  }

  private findRecipeItem(recipeId: string): RecipeItem | undefined {
    return Object.values(lootConfig.recipeItems)
      .flat()
      .find((item) => item.id === recipeId);
  }

  /** Creates and caches a map of LootDetailId to LootDetail for quick lookups */
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

  private findPartDefinition(partType: RecipePartType): RecipePart | undefined {
    return Object.values(lootConfig.recipeParts)
      .flat()
      .find((p) => p.type === partType);
  }

  private prepareDetailsForDrawing(item: LootItem, recipeItem: RecipeItem, lootDetailMap: Map<LootDetailId, LootDetail>): RenderedDetailInfo[] {
    const detailsToDraw: RenderedDetailInfo[] = [];
    const availableDetailIds = new Set<LootDetailId>(item.details);

    // Process part sockets first
    recipeItem.sockets.forEach((partSocket) => {
      const partDefinition = this.findPartDefinition(partSocket.acceptType);
      if (!partDefinition) return;

      // Process detail sockets within each part
      partDefinition.sockets.forEach((detailSocket) => {
        const requiredDetailType = detailSocket.acceptType;
        let foundDetailId: LootDetailId | null = null;

        // Find a matching detail in the available details
        for (const detailId of availableDetailIds) {
          const detailData = lootDetailMap.get(detailId);
          if (detailData && detailData.type === requiredDetailType) {
            foundDetailId = detailId;
            break;
          }
        }

        if (foundDetailId) {
          availableDetailIds.delete(foundDetailId);

          // Create a temporary sprite for the detail
          const frameName = `${foundDetailId}.png`;
          const tempSprite = this.scene.make.sprite({ key: "loot-details-sprites", frame: frameName }, false);

          if (!tempSprite.texture || tempSprite.frame.name === "__MISSING") {
            console.warn(`Sprite frame missing for LootDetailId: ${foundDetailId}`);
            tempSprite.destroy();
            return;
          }

          tempSprite.setOrigin(0.5, 0.5);

          // Use direct pinpoint coordinates for positioning
          const x = detailSocket.pinpoint.coords.x;
          const y = detailSocket.pinpoint.coords.y;

          // Calculate combined zIndex to maintain proper layering
          const combinedZIndex = partSocket.pinpoint.zIndex * 100 + detailSocket.pinpoint.zIndex;

          detailsToDraw.push({
            sprite: tempSprite,
            x,
            y,
            zIndex: combinedZIndex,
          });
        } else {
          console.warn(`No suitable LootDetail found for required type: ${requiredDetailType} in part ${partDefinition.type}`);
        }
      });
    });

    if (availableDetailIds.size > 0) {
      console.warn(`Unused LootDetails in item ${item.id}:`, Array.from(availableDetailIds));
    }

    return detailsToDraw;
  }

  /**
   * Cleans up any internal state. Call this if the renderer instance is long-lived
   * and you want to reset state between unrelated render batches.
   */
  public cleanup(): void {
    this.lootDetailMapCache = null;
  }
}
