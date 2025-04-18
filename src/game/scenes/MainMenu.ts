import { GameObjects, Scene } from "phaser";

import { EventBus } from "../EventBus";

export class MainMenu extends Scene {
    container: GameObjects.Container;
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;

    constructor() {
        super("MainMenu");
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Create a container centered on the screen
        this.container = this.add.container(centerX, centerY);

        // Add background to the container at its center (0, 0 relative to container)
        this.background = this.add.image(0, 0, "background");
        this.container.add(this.background);

        // Position logo slightly above center (relative to container)
        this.logo = this.add.image(0, -84, "logo").setDepth(100);
        this.container.add(this.logo);

        // Position title below center (relative to container)
        this.title = this.add
            .text(0, 76, "Main Menu", {
                fontFamily: "Arial Black",
                fontSize: 38,
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 8,
                align: "center",
            })
            .setOrigin(0.5) // Center the text block itself
            .setDepth(100);
        this.container.add(this.title);

        EventBus.emit("current-scene-ready", this);
    }

    // Method to change scene to Game
    startGame() {
        this.scene.start("Game");
    }
}
