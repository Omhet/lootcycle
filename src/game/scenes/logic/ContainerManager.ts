import { Scene } from "phaser";
import { CollisionCategories, CollisionMasks } from "../../physics/CollisionCategories";
import { DepthLayers } from "../Game";

export class ContainerManager {
  private scene: Scene;
  private containerSprite: Phaser.Physics.Matter.Sprite;

  constructor(scene: Scene) {
    this.scene = scene;
    this.createContainer();
  }

  /**
   * Creates the container sprite with physics using the PhysicsEditor JSON data
   */
  private createContainer(): void {
    const containerPhysics = this.scene.cache.json.get("containerPhysics");
    const containerTexture = this.scene.textures.get("container");
    const frame = containerTexture.get();

    const horizontalMargin = 154;
    const xPos = this.scene.cameras.main.width - frame.width / 2 - horizontalMargin;
    const yPos = this.scene.cameras.main.height - frame.height / 2 + (38 / 2 + 2); // Assuming groundHeight is 38, replace if needed

    this.containerSprite = this.scene.matter.add.sprite(xPos, yPos, "container", undefined, {
      shape: containerPhysics.container,
      collisionFilter: {
        category: CollisionCategories.ENVIRONMENT,
        mask: CollisionMasks.ENVIRONMENT,
      },
    });

    this.containerSprite.setStatic(true);
    this.containerSprite.setName("container");
    this.containerSprite.setDepth(DepthLayers.Foreground);
  }

  public getSprite(): Phaser.Physics.Matter.Sprite {
    return this.containerSprite;
  }

  public destroy(): void {
    if (this.containerSprite) {
      this.containerSprite.destroy();
    }
    console.log("ContainerManager destroyed");
  }
}
