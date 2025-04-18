import { Scene } from "phaser";

export class Preloader extends Scene {
    container: Phaser.GameObjects.Container;

    constructor() {
        super("Preloader");
    }

    init() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Create a container centered on the screen
        this.container = this.add.container(centerX, centerY);

        // Progress bar elements relative to the container's center (0, 0)
        const barWidth = this.cameras.main.width * 0.8;
        const barHeight = 32;

        // Outline rectangle centered at (0, 0) within the container
        const progressBarOutline = this.add
            .rectangle(0, 0, barWidth + 4, barHeight + 4)
            .setStrokeStyle(1, 0xffffff);
        this.container.add(progressBarOutline);

        // Filling bar starting from the left edge relative to the container's center
        const bar = this.add.rectangle(
            -barWidth / 2, // Start from left edge relative to center
            0, // Center vertically
            4,
            barHeight,
            0xffffff
        );
        this.container.add(bar); // Add the bar itself to the container

        // Update bar width based on progress
        this.load.on("progress", (progress: number) => {
            bar.width = 4 + barWidth * progress;
        });
    }

    preload() {
        //  Load the assets for the game
        this.load.setPath("assets");
    }

    create() {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start("MainMenu");
    }
}
