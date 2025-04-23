import { GameObjects, Math as PhaserMath, Scene } from "phaser";
import { DepthLayers } from "../Game";

export class PipeManager {
  private scene: Scene;
  private pipePosition: PhaserMath.Vector2;
  private pipeSpawnPoint: PhaserMath.Vector2;
  private pipeBack: GameObjects.Image;
  private pipeFront: GameObjects.Image;
  private spawnMarker: GameObjects.Arc; // Optional debug marker

  constructor(scene: Scene) {
    this.scene = scene;
    this.setupPipe();
  }

  /**
   * Sets up the pipe in the top right corner with front and back layers
   */
  private setupPipe(): void {
    const pipeX = this.scene.cameras.main.width;
    const pipeY = 64;

    this.pipePosition = new PhaserMath.Vector2(pipeX, pipeY);

    this.pipeBack = this.scene.add.image(pipeX, pipeY, "pipe_back");
    this.pipeBack.setOrigin(1, 0);
    this.pipeBack.setDepth(DepthLayers.PipeBack);

    this.pipeFront = this.scene.add.image(pipeX, pipeY, "pipe_front");
    this.pipeFront.setOrigin(1, 0);
    this.pipeFront.setDepth(DepthLayers.PipeFront);

    const pipeWidth = this.pipeBack.width;
    const pipeHeight = this.pipeBack.height;

    const spawnOffsetX = -pipeWidth + 50;
    const spawnOffsetY = pipeHeight - 50;

    this.pipeSpawnPoint = new PhaserMath.Vector2(spawnOffsetX, spawnOffsetY);

    // Optional: Add a debug marker at the spawn point
    // this.spawnMarker = this.scene.add.circle(pipeX + spawnOffsetX, pipeY + spawnOffsetY, 5, 0x00ff00);
    // this.spawnMarker.setDepth(DepthLayers.UI);
  }

  /**
   * Gets the absolute world coordinates of the junk spawn point.
   */
  public getSpawnPoint(): PhaserMath.Vector2 {
    // Return a new vector to prevent external modification
    return new PhaserMath.Vector2(this.pipePosition.x + this.pipeSpawnPoint.x, this.pipePosition.y + this.pipeSpawnPoint.y);
  }

  public destroy(): void {
    if (this.pipeBack) {
      this.pipeBack.destroy();
    }
    if (this.pipeFront) {
      this.pipeFront.destroy();
    }
    if (this.spawnMarker) {
      this.spawnMarker.destroy();
    }
    console.log("PipeManager destroyed");
  }
}
