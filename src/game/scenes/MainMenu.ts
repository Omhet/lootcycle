import { GameObjects, Scene } from "phaser";

import { lootConfig } from "../../lib/craft/config"; // Import lootConfig
import {
  LootDetail, // Added
  LootDetailId, // Added
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
    // this.startGame();
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
   * Recursively generates all valid combinations of LootDetailIds for a given set of sockets.
   * Ensures that each detail is used at most once per combination.
   *
   * @param socketsToFill The remaining RecipeDetailSockets to find details for.
   * @param availableDetailsMap A map of all LootDetails available for consideration.
   * @param currentCombination The combination being built in the current recursion path.
   * @param usedDetailIds A set of LootDetailIds already used in the current combination.
   * @param allCombinations The array to accumulate valid combinations.
   */
  private _generateLootDetailCombinations(
    socketsToFill: RecipeDetailSocket[],
    availableDetailsMap: Map<LootDetailId, LootDetail>,
    currentCombination: LootDetailId[] = [],
    usedDetailIds: Set<LootDetailId> = new Set(),
    allCombinations: LootDetailId[][] = []
  ): LootDetailId[][] {
    // Base case: All sockets have been filled
    if (socketsToFill.length === 0) {
      if (currentCombination.length > 0) {
        allCombinations.push([...currentCombination]); // Add a copy
      }
      return allCombinations;
    }

    const currentSocket = socketsToFill[0];
    const remainingSockets = socketsToFill.slice(1);
    const requiredType = currentSocket.acceptType;

    // Find all details suitable for the current socket that haven't been used yet
    const suitableDetails: LootDetail[] = [];
    for (const detail of availableDetailsMap.values()) {
      if (!usedDetailIds.has(detail.id) && detail.type === requiredType) {
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

      this._generateLootDetailCombinations(remainingSockets, availableDetailsMap, currentCombination, usedDetailIds, allCombinations);

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
    const allLootDetailsMap = this.getLootDetailMap(); // Use LootDetails now
    const tempRTWidth = 512;
    const tempRTHeight = 512;

    for (const recipe of allRecipes) {
      console.log(`Processing recipe: ${recipe.id}`);

      // 1. Get all required detail sockets for the recipe
      const requiredDetailSockets: RecipeDetailSocket[] = [];
      recipe.sockets.forEach((partSocket: RecipePartSocket) => {
        const partDef = this.findPartDefinition(partSocket.acceptType);
        if (partDef) {
          requiredDetailSockets.push(...partDef.sockets);
        }
      });

      requiredDetailSockets.sort((a, b) => a.pinpoint.zIndex - b.pinpoint.zIndex);

      if (requiredDetailSockets.length === 0) {
        console.log(`Recipe ${recipe.id} has no detail sockets, skipping combination generation.`);
        continue;
      }

      // 2. Generate all valid combinations of LootDetailIds
      console.log(`Generating LootDetail combinations for ${recipe.id} with ${requiredDetailSockets.length} sockets...`);
      const detailCombinations = this._generateLootDetailCombinations(
        // Use the new function
        requiredDetailSockets,
        allLootDetailsMap, // Pass the map of LootDetails
        [],
        new Set(),
        []
      );
      console.log(`Found ${detailCombinations.length} valid LootDetail combinations for ${recipe.id}.`);

      // 3. Iterate through each combination and render
      if (detailCombinations.length === 0) {
        console.warn(`No valid LootDetail combinations found for recipe ${recipe.id}.`);
        continue;
      }

      let combinationIndex = 0;
      for (const combination of detailCombinations) {
        // 'combination' is now LootDetailId[]
        const tempLootItem: LootItem = {
          id: `temp_${recipe.id}_${combinationIndex}`,
          recipeId: recipe.id,
          details: combination, // Use the LootDetailId combination directly
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
          // The renderer now expects LootItem with LootDetailId[] in 'details'
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
            const link = document.createElement("a");
            link.href = imageDataUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
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
