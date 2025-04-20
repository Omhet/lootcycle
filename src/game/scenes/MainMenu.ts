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

        EventBus.emit("current-scene-ready", this);

        // Temporary start game right away to debug
        this.startGame();
    }

    // Method to change scene to Game
    startGame() {
        this.scene.start("Game");
    }
}
