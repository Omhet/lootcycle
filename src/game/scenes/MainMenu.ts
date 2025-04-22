import { GameObjects, Scene } from "phaser";

import { lootConfig } from "../../lib/craft/config";
import { LootDetail, LootDetailId, LootItem, Rarity, RecipeDetailType, RecipeItem, RecipePart, RecipePartType } from "../../lib/craft/craftModel";
import { EventBus } from "../EventBus";
import { CraftedItemRenderer } from "../rendering/CraftedItemRenderer";

export class MainMenu extends Scene {
  container: GameObjects.Container;
  background: GameObjects.Image;
  logo: GameObjects.Image;
  title: GameObjects.Text;
  private itemRenderer: CraftedItemRenderer;

  constructor() {
    super("MainMenu");
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    this.container = this.add.container(centerX, centerY);
    this.itemRenderer = new CraftedItemRenderer(this);

    EventBus.emit("current-scene-ready", this);

    // Temporary start game right away to debug - REMOVE THIS LATER
    this.startGame();

    console.log({ lootConfig });
  }

  startGame() {
    this.scene.start("Game");
  }

  // --- Helper: Get Loot Detail Map ---
  private getLootDetailMap(): Map<LootDetailId, LootDetail> {
    const map = new Map<LootDetailId, LootDetail>();
    Object.values(lootConfig.lootDetails)
      .flat()
      .forEach((detail) => {
        if (!map.has(detail.id)) {
          map.set(detail.id, detail);
        }
      });
    return map;
  }

  // --- Helper: Find Part Definition ---
  private findPartDefinition(partType: RecipePartType): RecipePart | undefined {
    return Object.values(lootConfig.recipeParts)
      .flat()
      .find((p) => p.type === partType);
  }

  /**
   * Gets all available LootDetails grouped by their type
   * @returns A map of RecipeDetailType to array of LootDetailIds
   */
  private getAvailableLootDetailsByType(): Map<RecipeDetailType, LootDetailId[]> {
    const detailsByType = new Map<RecipeDetailType, LootDetailId[]>();
    const allLootDetailsMap = this.getLootDetailMap();

    // Group available details by their type
    for (const [id, detail] of allLootDetailsMap.entries()) {
      if (!detailsByType.has(detail.type)) {
        detailsByType.set(detail.type, []);
      }
      detailsByType.get(detail.type)?.push(id);
    }

    return detailsByType;
  }

  /**
   * Generates all socket requirements for a recipe
   * @param recipe The recipe to analyze
   * @returns Array of required detail types
   */
  private getRecipeDetailRequirements(recipe: RecipeItem): RecipeDetailType[] {
    const requirements: RecipeDetailType[] = [];

    recipe.sockets.forEach((partSocket) => {
      const partDef = this.findPartDefinition(partSocket.acceptType);
      if (partDef) {
        partDef.sockets.forEach((detailSocket) => {
          requirements.push(detailSocket.acceptType);
        });
      }
    });

    return requirements;
  }

  /**
   * Generates combinations of LootDetailIds that satisfy the recipe requirements
   * @param recipe The recipe to generate combinations for
   * @returns Array of valid detail combinations
   */
  private generateLootDetailCombinations(recipe: RecipeItem): LootDetailId[][] {
    console.log(`Generating combinations for recipe: ${recipe.id}`);

    // 1. Get required detail types for recipe
    const requiredDetailTypes = this.getRecipeDetailRequirements(recipe);
    console.log(`Required detail types: ${requiredDetailTypes.join(", ")}`);

    // 2. Get available details by type
    const detailsByType = this.getAvailableLootDetailsByType();

    // 3. Ensure we have at least one detail available for each required type
    const validCombinations: LootDetailId[][] = [];
    const unavailableTypes: RecipeDetailType[] = [];

    requiredDetailTypes.forEach((type) => {
      if (!detailsByType.has(type) || detailsByType.get(type)?.length === 0) {
        unavailableTypes.push(type);
      }
    });

    if (unavailableTypes.length > 0) {
      console.warn(`Missing details for types: ${unavailableTypes.join(", ")}`);
      return [];
    }

    // 4. Generate all valid combinations
    // Start with seed combination
    const initialCombination: LootDetailId[] = [];

    this._generateValidCombinations(requiredDetailTypes, detailsByType, initialCombination, validCombinations);

    return validCombinations;
  }

  /**
   * Helper method to recursively generate valid combinations
   */
  private _generateValidCombinations(
    remainingTypes: RecipeDetailType[],
    availableByType: Map<RecipeDetailType, LootDetailId[]>,
    currentCombination: LootDetailId[],
    results: LootDetailId[][]
  ): void {
    // Base case: all types have been processed
    if (remainingTypes.length === 0) {
      results.push([...currentCombination]);
      return;
    }

    // Get current type to process
    const currentType = remainingTypes[0];
    const remainingTypesToProcess = remainingTypes.slice(1);

    // Get available details for this type
    const availableDetails = availableByType.get(currentType) || [];

    // Try each available detail for this type
    for (const detailId of availableDetails) {
      // Add this detail to the current combination
      currentCombination.push(detailId);

      // Recursive call to handle remaining types
      this._generateValidCombinations(remainingTypesToProcess, availableByType, currentCombination, results);

      // Backtrack: remove the current detail
      currentCombination.pop();
    }
  }

  // --- Download Recipe Images ---
  public async downloadRecipeImages(): Promise<void> {
    console.log("Starting recipe image generation for all combinations...");
    const allRecipes = Object.values(lootConfig.recipeItems).flat();
    const tempRTWidth = 720;
    const tempRTHeight = 720;

    // Helper function to add delay between downloads
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    for (const recipe of allRecipes) {
      console.log(`Processing recipe: ${recipe.id}`);

      // Generate all valid combinations of LootDetailIds using the new approach
      const detailCombinations = this.generateLootDetailCombinations(recipe);

      console.log(`Found ${detailCombinations.length} valid LootDetail combinations for ${recipe.id}.`);

      // Skip if no valid combinations
      if (detailCombinations.length === 0) {
        console.warn(`No valid LootDetail combinations found for recipe ${recipe.id}.`);
        continue;
      }

      let combinationIndex = 0;
      for (const combination of detailCombinations) {
        const tempLootItem: LootItem = {
          id: `temp_${recipe.id}_${combinationIndex}`,
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

        try {
          const comboKey = `${recipe.id}_${combinationIndex}`;
          console.log(`Rendering recipe ${recipe.id} LootDetail combination ${combinationIndex}`);

          this.itemRenderer.renderItemToTexture(tempLootItem, tempRT);
          console.log(`Rendered to RenderTexture for ${comboKey}`);

          console.log(`Snapshotting RenderTexture for key: ${comboKey}`);
          const imageDataUrl: string = await new Promise((resolve) => {
            tempRT.snapshot((image: HTMLImageElement | Phaser.Display.Color) => {
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
            const filename = `${recipe.id}_combination_${combinationIndex}.png`;
            console.log(`Downloading image for ${comboKey} as ${filename}`);

            // Create download link
            const link = document.createElement("a");
            link.href = imageDataUrl;
            link.download = filename;
            document.body.appendChild(link);

            // Trigger download
            link.click();

            // Wait for a brief delay before removing the link and continuing
            await delay(300);

            // Clean up the link element
            document.body.removeChild(link);
          } else {
            console.warn(`No imageDataUrl for key: ${comboKey}`);
            console.warn(`Failed to get image data for ${recipe.id} combination ${combinationIndex}`);
          }
        } catch (error) {
          console.error(`Error processing ${recipe.id} combination ${combinationIndex}:`, error);
        } finally {
          if (tempRT) {
            tempRT.destroy();
          }
        }
        combinationIndex++;
      }
      console.log(`Finished rendering ${combinationIndex} images for ${recipe.id}.`);
    }

    console.log("All images downloaded.");
  }

  // --- Scene Shutdown ---
  shutdown() {
    // The renderer instance doesn't need explicit destruction here
    // unless it starts managing persistent resources itself.
  }
}
