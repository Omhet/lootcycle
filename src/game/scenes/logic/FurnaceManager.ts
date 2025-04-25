import { Scene } from "phaser";
import { DepthLayers } from "../Game";

export class FurnaceManager {
  private scene: Scene;
  private furnaceSprite: Phaser.GameObjects.Sprite;
  private fireSprite: Phaser.GameObjects.Sprite;
  private fireAnimation: Phaser.Animations.Animation;

  constructor(scene: Scene) {
    this.scene = scene;
    this.createFurnace();
    this.setupFireAnimation();
  }

  /**
   * Creates the furnace sprite (without physics)
   */
  private createFurnace(): void {
    const furnaceTexture = this.scene.textures.get("furnace");
    const frame = furnaceTexture.get();

    const xPos = this.scene.cameras.main.width / 2 - 180;
    const yPos = this.scene.cameras.main.height - frame.height / 2 - 20;

    // Create the fire sprite first so it renders behind the furnace
    this.fireSprite = this.scene.add.sprite(xPos, yPos, "furnace_fire");
    this.fireSprite.setVisible(false);
    this.fireSprite.setDepth(DepthLayers.Foreground - 1);

    // Create the furnace sprite
    this.furnaceSprite = this.scene.add.sprite(xPos, yPos, "furnace");
    this.furnaceSprite.setName("furnace");
    this.furnaceSprite.setDepth(DepthLayers.Foreground);
  }

  /**
   * Sets up the fire animation
   */
  private setupFireAnimation(): void {
    // Check if animation exists already
    if (!this.scene.anims.exists("furnace-fire")) {
      this.fireAnimation = this.scene.anims.create({
        key: "furnace-fire",
        frames: this.scene.anims.generateFrameNames("furnace_fire", {
          prefix: "furnace_fire_",
          suffix: ".png",
          start: 1,
          end: 2,
        }),
        frameRate: 8,
        repeat: -1, // Loop indefinitely
      }) as Phaser.Animations.Animation;
    }
  }

  /**
   * Start the crafting process by showing and playing the fire animation
   */
  public startCrafting(): void {
    this.fireSprite.setVisible(true);
    this.fireSprite.play("furnace-fire");
  }

  /**
   * Stop the crafting process by hiding and stopping the fire animation
   */
  public stopCrafting(): void {
    this.fireSprite.stop();
    this.fireSprite.setVisible(false);
  }

  public getSprite(): Phaser.GameObjects.Sprite {
    return this.furnaceSprite;
  }

  public destroy(): void {
    if (this.fireSprite) {
      this.fireSprite.destroy();
    }
    if (this.furnaceSprite) {
      this.furnaceSprite.destroy();
    }
    console.log("FurnaceManager destroyed");
  }
}
