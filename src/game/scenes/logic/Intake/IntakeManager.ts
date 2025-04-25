import { Scene } from "phaser";
import { EventBus } from "../../../EventBus";
import { CollisionCategories, CollisionMasks } from "../../../physics/CollisionCategories";
import { DepthLayers } from "../../Game";
import { JunkPileItem } from "../JunkPileManager";
import { IntakeJunkDetector } from "./IntakeJunkDetector";

export class IntakeManager {
  private scene: Scene;
  private intakeSprite: Phaser.Physics.Matter.Sprite;
  private junkDetector: IntakeJunkDetector;

  constructor(scene: Scene) {
    this.scene = scene;
    this.createIntake();

    // Initialize the junk detector
    this.junkDetector = new IntakeJunkDetector(scene, this.intakeSprite);
  }

  /**
   * Creates the intake sprite with physics using the PhysicsEditor JSON data
   */
  private createIntake(): void {
    const intakePhysics = this.scene.cache.json.get("intakePhysics");
    const intakeTexture = this.scene.textures.get("intake");
    const frame = intakeTexture.get();

    const xPos = this.scene.cameras.main.width / 2 - 535;
    const yPos = this.scene.cameras.main.height - frame.height / 2 - 40;

    this.intakeSprite = this.scene.matter.add.sprite(xPos, yPos, "intake", undefined, {
      shape: intakePhysics.intake,
      collisionFilter: {
        category: CollisionCategories.ENVIRONMENT,
        mask: CollisionMasks.ENVIRONMENT,
      },
    });

    this.intakeSprite.setStatic(true);
    this.intakeSprite.setName("intake");
    this.intakeSprite.setDepth(DepthLayers.Foreground);
  }

  public startCrafting(): void {
    this.intakeSprite.setTexture("intake_filled");
  }

  public stopCrafting(): void {
    this.intakeSprite.setTexture("intake");

    // When starting crafting, we're burning all junk pieces in the intake (the burning is visualised in Furnace, but actual logic is here)
    const junkCount = this.getJunkPiecesCount();
    if (junkCount > 0) {
      EventBus.emit("junk-burnt", junkCount);
    }

    this.destroyJunkPieces();
  }

  public hasEnoughJunkForCrafting(): boolean {
    return this.junkDetector.hasEnoughJunk();
  }

  /**
   * Gets the count of junk pieces currently in the intake
   */
  public getJunkPiecesCount(): number {
    return this.junkDetector.getJunkPiecesCount();
  }

  /**
   * Returns all junk pieces currently inside the intake
   */
  public getJunkPiecesInside(): JunkPileItem[] {
    return this.junkDetector.getJunkPiecesInside();
  }

  /**
   * Clears all junk pieces from the intake tracking (doesn't physically remove them)
   */
  public clearJunkPieces(): void {
    this.junkDetector.clearJunkPieces();
  }

  /**
   * Destroys junk pieces physically after processing
   */
  public destroyJunkPieces(): void {
    this.junkDetector.destroyJunkPieces();
  }

  /**
   * Gets the intake sprite
   */
  public getSprite(): Phaser.Physics.Matter.Sprite {
    return this.intakeSprite;
  }

  /**
   * Cleanup resources when destroying this object
   */
  public destroy(): void {
    // Destroy the junk detector
    this.junkDetector.destroy();

    if (this.intakeSprite) {
      this.intakeSprite.destroy();
    }
    console.log("IntakeManager destroyed");
  }
}
