import { Scene } from "phaser";
import { lootConfig } from "../../../../lib/craft/config";
import { craftLootItem, getTemperatureRangeForCrafting } from "../../../../lib/craft/craftLootItem";
import { CraftingFailureReason, JunkPiece, LootItem, TemperatureRange } from "../../../../lib/craft/craftModel";
import { CollisionCategories, CollisionMasks } from "../../../physics/CollisionCategories";
import { DepthLayers } from "../../Game";
import { CauldronCraftingManager } from "./CauldronCraftingManager";
import { CauldronJunkDetector } from "./CauldronJunkDetector";

export interface CraftingResult {
  success: boolean;
  item?: LootItem;
  failure?: {
    reason: CraftingFailureReason;
    message?: string;
  };
}

/**
 * Manages the cauldron, combining crafting and junk detection functionality
 */
export class CauldronManager {
  private scene: Scene;
  private cauldronSprite: Phaser.Physics.Matter.Sprite;
  private thresholdY: number;

  // Component managers
  private junkDetector: CauldronJunkDetector;
  private craftingManager: CauldronCraftingManager;
  craftedItemTemperatureRange: TemperatureRange;

  constructor(scene: Scene) {
    this.scene = scene;
    this.createCauldron();

    // Initialize component managers
    this.junkDetector = new CauldronJunkDetector(scene, this.cauldronSprite, this.thresholdY);
    this.craftingManager = new CauldronCraftingManager(scene, this.cauldronSprite);
  }

  /**
   * Creates the cauldron sprite with physics using the PhysicsEditor JSON data
   */
  private createCauldron(): void {
    const cauldronPhysics = this.scene.cache.json.get("cauldronPhysics");
    const cauldronTexture = this.scene.textures.get("cauldron");
    const frame = cauldronTexture.get();

    const xPos = this.scene.cameras.main.width / 2 - 180;
    const yPos = this.scene.cameras.main.height - frame.height / 2 - 250;

    this.cauldronSprite = this.scene.matter.add.sprite(xPos, yPos, "cauldron", undefined, {
      shape: cauldronPhysics.cauldron,
      collisionFilter: {
        category: CollisionCategories.ENVIRONMENT,
        mask: CollisionMasks.ENVIRONMENT,
      },
    });

    this.cauldronSprite.setStatic(true);
    this.cauldronSprite.setName("cauldron");
    this.cauldronSprite.setDepth(DepthLayers.Foreground);

    // Calculate threshold line position (around 60% from the bottom of the cauldron)
    this.thresholdY = yPos + frame.height * 0.2;
  }

  // === Delegated JunkDetector methods ===

  /**
   * Checks if enough junk has crossed the threshold line for crafting
   */
  public hasEnoughJunkForCrafting(): boolean {
    return this.junkDetector.hasEnoughJunkForCrafting();
  }

  /**
   * Gets the count of junk pieces above the threshold line
   */
  public getJunkPiecesAboveThresholdCount(): number {
    return this.junkDetector.getJunkPiecesAboveThresholdCount();
  }

  /**
   * Returns all junk pieces currently inside the cauldron
   */
  public getJunkPiecesInside(): JunkPiece[] {
    return this.junkDetector.getJunkPiecesInside().map((item) => item.junkPiece);
  }

  /**
   * Clears all junk pieces from the cauldron tracking (doesn't physically remove them)
   */
  public clearJunkPieces(): void {
    this.junkDetector.clearJunkPieces();
  }

  /**
   * Destroys junk pieces physically after crafting
   */
  public destroyJunkPieces(): void {
    this.junkDetector.destroyJunkPieces();
  }

  // === Delegated craftingManager methods ===

  /**
   * Starts the crafting process, increasing temperature over time
   */
  public startCrafting(): void {
    // Change cauldron sprite to filled version
    this.cauldronSprite.setTexture("cauldron_filled");

    // Currently fixed to short_sword for demonstration
    const temperatureRange = getTemperatureRangeForCrafting({
      recipeId: "short_sword",
      junkPieces: this.getJunkPiecesInside(),
      config: lootConfig,
    });

    this.craftedItemTemperatureRange = temperatureRange;

    // Pass the temperature exceeded handler to the crafting manager
    this.craftingManager.startCrafting(temperatureRange, this.handleTemperatureExceeded.bind(this));
  }

  /**
   * Stops the crafting process
   */
  public stopCrafting(): CraftingResult {
    // Change cauldron sprite back to empty version
    this.cauldronSprite.setTexture("cauldron");

    const temperature = this.craftingManager.stopCrafting();

    // Not successful crafting cases first
    if (temperature < this.craftedItemTemperatureRange.min) {
      return {
        success: false,
        failure: {
          reason: CraftingFailureReason.TooLowTemperature,
          message: "Temperature too low for crafting",
        },
      };
    } else if (temperature > this.craftedItemTemperatureRange.max) {
      this.destroyJunkPieces();

      return {
        success: false,
        failure: {
          reason: CraftingFailureReason.TooHighTemperature,
          message: "Temperature too high for crafting",
        },
      };
    }

    // Successful crafting

    const junkPieces = this.getJunkPiecesInside();

    const craftedLootItem = craftLootItem({
      lootItemRecipeId: "short_sword", // In the future, this could be determined by cauldron queue
      junkPieces,
      config: lootConfig,
    });

    this.destroyJunkPieces();

    return {
      success: true,
      item: craftedLootItem,
    };
  }

  /**
   * Handles when temperature exceeds the maximum allowed
   */
  private handleTemperatureExceeded(): void {
    // Change cauldron sprite back to empty version
    this.cauldronSprite.setTexture("cauldron");

    // Stop the crafting process
    this.craftingManager.stopCrafting();

    // Destroy junk pieces
    this.destroyJunkPieces();

    // You could add effects, sounds, or other feedback here
    console.log("Cauldron overheated! Junk pieces destroyed.");

    // TODO: Create explosion effect
  }

  /**
   * Returns whether crafting is currently in progress
   */
  public isCraftingInProgress(): boolean {
    return this.craftingManager.isCraftingInProgress();
  }

  /**
   * Gets the current temperature
   */
  public getCurrentTemperature(): number {
    return this.craftingManager.getCurrentTemperature();
  }

  /**
   * Gets the current temperature range for crafting
   */
  public getTemperatureRange(): TemperatureRange | null {
    return this.craftingManager.getTemperatureRange();
  }

  /**
   * Gets the cauldron sprite
   */
  public getSprite(): Phaser.Physics.Matter.Sprite {
    return this.cauldronSprite;
  }

  /**
   * Cleanup resources when destroying this object
   */
  public destroy(): void {
    // Destroy component managers
    this.junkDetector.destroy();
    this.craftingManager.destroy();

    // Destroy the sprite
    if (this.cauldronSprite) {
      this.cauldronSprite.destroy();
    }
  }
}
