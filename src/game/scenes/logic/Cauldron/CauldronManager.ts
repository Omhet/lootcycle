import { Scene } from "phaser";
import { TemperatureRange } from "../../../../lib/craft/craftModel";
import { CollisionCategories, CollisionMasks } from "../../../physics/CollisionCategories";
import { DepthLayers } from "../../Game";
import { JunkPileItem } from "../JunkPileManager";
import { CauldronCookingManager } from "./CauldronCookingManager";
import { CauldronJunkDetector } from "./CauldronJunkDetector";

/**
 * Manages the cauldron, combining cooking and junk detection functionality
 */
export class CauldronManager {
  private scene: Scene;
  private cauldronSprite: Phaser.Physics.Matter.Sprite;
  private thresholdY: number;

  // Component managers
  private junkDetector: CauldronJunkDetector;
  private cookingManager: CauldronCookingManager;

  constructor(scene: Scene) {
    this.scene = scene;
    this.createCauldron();

    // Initialize component managers
    this.junkDetector = new CauldronJunkDetector(scene, this.cauldronSprite, this.thresholdY);
    this.cookingManager = new CauldronCookingManager(scene, this.cauldronSprite);
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
    this.cauldronSprite.setDepth(DepthLayers.Ground);

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
  public getJunkPiecesInside(): JunkPileItem[] {
    return this.junkDetector.getJunkPiecesInside();
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

  // === Delegated CookingManager methods ===

  /**
   * Starts the cooking process, increasing temperature over time
   */
  public startCooking(tempRange: TemperatureRange | null = null): void {
    this.cookingManager.startCooking(tempRange);
  }

  /**
   * Stops the cooking process
   */
  public stopCooking(): number {
    return this.cookingManager.stopCooking();
  }

  /**
   * Returns whether cooking is currently in progress
   */
  public isCookingInProgress(): boolean {
    return this.cookingManager.isCookingInProgress();
  }

  /**
   * Gets the current temperature
   */
  public getCurrentTemperature(): number {
    return this.cookingManager.getCurrentTemperature();
  }

  /**
   * Gets the current temperature range for crafting
   */
  public getTemperatureRange(): TemperatureRange | null {
    return this.cookingManager.getTemperatureRange();
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
    this.cookingManager.destroy();

    // Destroy the sprite
    if (this.cauldronSprite) {
      this.cauldronSprite.destroy();
    }
  }
}
