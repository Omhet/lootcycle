import { Scene } from "phaser";
import { lootConfig } from "../../../../lib/craft/config";
import { craftLootItem, getTemperatureRangeForCrafting } from "../../../../lib/craft/craftLootItem";
import { CraftingFailureReason, JunkPiece, LootItem, TemperatureRange } from "../../../../lib/craft/craftModel";
import { usePlayerProgressStore } from "../../../../store/usePlayerProgressStore";
import { EventBus } from "../../../EventBus";
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
  private currentRecipeItemId: string;

  // Shake properties
  private shakeTimer: Phaser.Time.TimerEvent | null = null;
  private originalPosition: { x: number; y: number } = { x: 0, y: 0 };
  private maxShakeIntensity: number = 5; // Maximum shake in pixels
  private shakeIntensity: number = 0;

  constructor(scene: Scene) {
    this.scene = scene;
    this.createCauldron();

    // Initialize component managers
    this.junkDetector = new CauldronJunkDetector(scene, this.cauldronSprite, this.thresholdY);
    this.craftingManager = new CauldronCraftingManager(scene, this.cauldronSprite);

    // Select the first random recipe
    this.selectRandomRecipe();
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

    this.thresholdY = yPos + frame.height * 0.2;

    // Store original position for shake reference
    this.originalPosition = { x: xPos, y: yPos };
  }

  /**
   * Selects a random recipe from the player's purchased recipes
   */
  private selectRandomRecipe(): void {
    // Get purchased recipes from the player progress store
    const { purchasedRecipes } = usePlayerProgressStore.getState();

    // If there are no purchased recipes, default to axe (which should be available by default)
    if (purchasedRecipes.length === 0) {
      console.warn("No purchased recipes found. Defaulting to 'axe'.");
      this.currentRecipeItemId = "axe";
    } else {
      // Select a random recipe from the purchased ones
      const randomIndex = Math.floor(Math.random() * purchasedRecipes.length);
      this.currentRecipeItemId = purchasedRecipes[randomIndex];
    }

    console.log(`Selected recipe for next crafting: ${this.currentRecipeItemId}`);

    // Emit an event to notify the craft store about the recipe selection
    EventBus.emit("recipe-selected", this.currentRecipeItemId);
  }

  /**
   * Returns the ID of the currently selected recipe
   */
  public getCurrentRecipeId(): string {
    return this.currentRecipeItemId;
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

    const temperatureRange = getTemperatureRangeForCrafting({
      recipeItemId: this.currentRecipeItemId,
      junkPieces: this.getJunkPiecesInside(),
      config: lootConfig,
    });

    this.craftedItemTemperatureRange = temperatureRange;

    // Start shaking the cauldron
    this.startShaking();

    // Pass the temperature exceeded handler to the crafting manager
    this.craftingManager.startCrafting(temperatureRange, this.handleTemperatureExceeded.bind(this));
  }

  /**
   * Stops the crafting process
   */
  public stopCrafting(): CraftingResult {
    // Stop shaking the cauldron
    this.stopShaking();

    // Change cauldron sprite back to empty version
    this.cauldronSprite.setTexture("cauldron");

    const temperature = this.craftingManager.stopCrafting();

    // Select a new random recipe for next crafting
    this.selectRandomRecipe();

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
      EventBus.emit("loot-screwed-up", 1);

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

    EventBus.emit("junk-recycled", junkPieces.length);

    const craftedLootItem = craftLootItem({
      recipeItemId: this.currentRecipeItemId,
      junkPieces,
      config: lootConfig,
    });

    this.destroyJunkPieces();

    EventBus.emit("loot-crafted", 1);

    return {
      success: true,
      item: craftedLootItem,
    };
  }

  /**
   * Handles when temperature exceeds the maximum allowed
   */
  private handleTemperatureExceeded(): void {
    // Stop shaking
    this.stopShaking();

    // Change cauldron sprite back to empty version
    this.cauldronSprite.setTexture("cauldron");

    // Stop the crafting process
    this.craftingManager.stopCrafting();

    // Destroy junk pieces
    this.destroyJunkPieces();

    // You could add effects, sounds, or other feedback here
    console.log("Cauldron overheated! Junk pieces destroyed.");

    EventBus.emit("loot-screwed-up", 1);

    // Select a new random recipe for next crafting
    this.selectRandomRecipe();

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
    // Stop shaking
    this.stopShaking();

    // Destroy component managers
    this.junkDetector.destroy();
    this.craftingManager.destroy();

    // Destroy the sprite
    if (this.cauldronSprite) {
      this.cauldronSprite.destroy();
    }
  }

  /**
   * Starts shaking the cauldron
   */
  private startShaking(): void {
    // Stop any existing shake
    this.stopShaking();

    // Set up timer to shake the cauldron every 50ms
    this.shakeTimer = this.scene.time.addEvent({
      delay: 50,
      callback: this.shakeUpdate,
      callbackScope: this,
      loop: true,
    });
  }

  /**
   * Updates the shake effect based on current temperature
   */
  private shakeUpdate(): void {
    if (!this.isCraftingInProgress()) return;

    // Update shake intensity based on current temperature
    this.updateShakeIntensity();

    // Apply shake effect
    if (this.shakeIntensity > 0) {
      const randX = (Math.random() * 2 - 1) * this.shakeIntensity;
      const randY = (Math.random() * 2 - 1) * this.shakeIntensity;

      this.cauldronSprite.setPosition(this.originalPosition.x + randX, this.originalPosition.y + randY);
    }
  }

  /**
   * Updates the shake intensity based on current temperature and range
   */
  private updateShakeIntensity(): void {
    const range = this.getTemperatureRange();
    if (!range) return;

    const currentTemp = this.getCurrentTemperature();
    const tempRange = range.max - range.min;
    const currentProgress = (currentTemp - range.min) / tempRange;

    // Shake intensity increases with temperature but is limited
    this.shakeIntensity = Math.min(this.maxShakeIntensity, currentProgress * this.maxShakeIntensity);
  }

  /**
   * Stops the cauldron from shaking
   */
  private stopShaking(): void {
    if (this.shakeTimer) {
      this.shakeTimer.destroy();
      this.shakeTimer = null;
    }

    // Reset position to original
    if (this.cauldronSprite && this.cauldronSprite.active) {
      this.cauldronSprite.setPosition(this.originalPosition.x, this.originalPosition.y);
    }

    this.shakeIntensity = 0;
  }
}
