import { Scene } from "phaser";
import { EventBus } from "../EventBus";

/**
 * A simple idle scene that is displayed when the game is in a UI-focused state
 * such as DayStart, DayEnd, or Shop. This scene doesn't contain any gameplay
 * elements and just serves as a visual background.
 */
export class Idle extends Scene {
  constructor() {
    super({ key: "Idle" });
  }

  create(): void {
    EventBus.emit("current-scene-ready", this);
  }

  changeScene(sceneName: string = "Idle") {
    console.log(`Idle: Changing scene to ${sceneName}`);
    this.scene.start(sceneName);
  }
}
