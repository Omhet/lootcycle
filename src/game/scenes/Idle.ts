import { Scene } from "phaser";
import { EventBus } from "../EventBus";

/**
 * A simple idle scene that is displayed when the game is in a UI-focused state
 * such as DayStart, DayEnd, or Shop. This scene doesn't contain any gameplay
 * elements and just serves as a visual background.
 */
export class Idle extends Scene {
  private backgroundMusic: Phaser.Sound.BaseSound;

  constructor() {
    super({ key: "Idle" });
  }

  create(): void {
    this.backgroundMusic = this.sound.add("menu", {
      volume: 0.4,
      loop: true,
    });
    this.backgroundMusic.play();

    EventBus.emit("current-scene-ready", this);
  }

  changeScene(sceneName: string = "Idle") {
    console.log(`Idle: Changing scene to ${sceneName}`);

    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
    }

    this.scene.start(sceneName);
  }

  // --- Scene Shutdown ---
  shutdown() {
    // Clean up any resources if needed
    // Stop background music
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
    }
  }
}
