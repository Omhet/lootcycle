import { Scene } from "phaser";
import { CollisionCategories, CollisionMasks } from "../../../physics/CollisionCategories";
import { DepthLayers } from "../../Game";

export class IntakeManager {
  private scene: Scene;
  private intakeSprite: Phaser.Physics.Matter.Sprite;

  constructor(scene: Scene) {
    this.scene = scene;
    this.createIntake();
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

  public getSprite(): Phaser.Physics.Matter.Sprite {
    return this.intakeSprite;
  }

  public destroy(): void {
    if (this.intakeSprite) {
      this.intakeSprite.destroy();
    }
    console.log("IntakeManager destroyed");
  }
}
