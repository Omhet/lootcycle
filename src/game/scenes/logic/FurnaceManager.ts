import { Scene } from "phaser";
import { DepthLayers } from "../Game";

export class FurnaceManager {
  private scene: Scene;
  private furnaceSprite: Phaser.GameObjects.Sprite;

  constructor(scene: Scene) {
    this.scene = scene;
    this.createFurnace();
  }

  /**
   * Creates the furnace sprite (without physics)
   */
  private createFurnace(): void {
    const furnaceTexture = this.scene.textures.get("furnace");
    const frame = furnaceTexture.get();

    const xPos = this.scene.cameras.main.width / 2 - 180;
    const yPos = this.scene.cameras.main.height - frame.height / 2 - 20;

    this.furnaceSprite = this.scene.add.sprite(xPos, yPos, "furnace");

    this.furnaceSprite.setName("furnace");
    this.furnaceSprite.setDepth(DepthLayers.Foreground);
  }

  public getSprite(): Phaser.GameObjects.Sprite {
    return this.furnaceSprite;
  }

  public destroy(): void {
    if (this.furnaceSprite) {
      this.furnaceSprite.destroy();
    }
    console.log("FurnaceManager destroyed");
  }
}
