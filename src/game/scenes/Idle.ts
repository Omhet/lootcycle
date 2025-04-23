import { Scene } from "phaser";

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
    // Add a simple background
    const { width, height } = this.cameras.main;
    this.add.rectangle(width / 2, height / 2, width, height, 0x222222, 0.8);

    // Add some simple text to indicate the state
    this.add
      .text(width / 2, height / 2, "Game paused", {
        fontSize: "24px",
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);
  }
}
