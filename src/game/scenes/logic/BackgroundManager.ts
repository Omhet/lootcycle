import { Scene } from "phaser";
import { DepthLayers } from "../Game";

export class BackgroundManager {
    private scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
        this.setupBackgroundLayers();
    }

    /**
     * Sets up the background layers in the correct order
     */
    private setupBackgroundLayers(): void {
        // Base background layer (lowest depth)
        const bg = this.scene.add.image(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            "bg"
        );
        bg.setDepth(DepthLayers.Background);

        // Walls layer
        const bgWalls = this.scene.add.image(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            "bg_walls"
        );
        bgWalls.setDepth(DepthLayers.BackgroundWalls);

        // Frame layer - Note: Pipe setup is handled separately now
        const bgFrame = this.scene.add.image(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            "bg_frame"
        );
        bgFrame.setDepth(DepthLayers.BackgroundFrame);

        // Decoration layer (highest depth)
        const bgDecor = this.scene.add.image(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            "bg_decor"
        );
        bgDecor.setDepth(DepthLayers.BackgroundDecor);
    }

    // No specific cleanup needed for background images unless dynamically added/removed
    public destroy(): void {
        // If we added dynamic elements, destroy them here
        console.log("BackgroundManager destroyed");
    }
}

