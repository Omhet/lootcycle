import { Scene } from "phaser";
import { EventBus } from "../EventBus";

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    container: Phaser.GameObjects.Container;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;

    constructor() {
        super("Game");
    }

    create() {
        this.camera = this.cameras.main;

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Create a container centered on the screen
        this.container = this.add.container(centerX, centerY);

        // Add background to the container at its center (0, 0 relative to container)
        this.background = this.add.image(0, 0, "background");
        this.container.add(this.background);

        EventBus.emit("current-scene-ready", this);
    }
}
