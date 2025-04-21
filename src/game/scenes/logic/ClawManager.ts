import { Scene } from "phaser";
import { DepthLayers } from "../Game";

// Define interfaces using Phaser's Matter types
export class ClawManager {
    private scene: Scene;

    private anchor: Phaser.Physics.Matter.Image | null = null;

    // Constants for configuration
    private readonly ANCHOR_X_OFFSET = 0; // Relative to screen center
    private readonly ANCHOR_Y = 50; // Fixed Y position for the top anchor

    constructor(scene: Scene) {
        this.scene = scene;
        this.createClaw();
    }

    /**
     * Creates the composite claw with physics.
     */
    private createClaw(): void {
        const centerX = this.scene.cameras.main.width / 2;
        const anchorX = centerX + this.ANCHOR_X_OFFSET;
        const anchorY = this.ANCHOR_Y;

        const clawPhysicsShapes = this.scene.cache.json.get("clawPhysics");
        if (!clawPhysicsShapes) {
            console.error("Claw physics shapes not loaded!");
            return;
        }

        const clawPhysics = this.scene.cache.json.get("clawPhysics");

        this.anchor = this.scene.matter.add.sprite(
            anchorX,
            anchorY,
            "claw_anchor",
            undefined,
            { ignoreGravity: true, isStatic: true }
        );
        this.anchor.setDepth(DepthLayers.Claw);

        let prev = this.anchor;
        let y = anchorY;

        for (let i = 0; i < 4; i++) {
            let link = this.scene.matter.add.sprite(
                anchorX,
                y,
                "clawParts",
                "claw_chain_front.png",
                { shape: clawPhysics.claw_chain_front, mass: 0.1 }
            );
            link.setDepth(DepthLayers.Claw);

            const isFirst = i === 0;

            this.scene.matter.add.joint(
                prev.body as MatterJS.BodyType,
                link.body as MatterJS.BodyType,
                isFirst ? 90 : 35,
                0.1,
                {
                    pointA: { x: 0, y: isFirst ? 100 : 0 },
                }
            );

            prev = link;

            y += 18;
        }
    }

    public destroy(): void {
        console.log("ClawManager destroyed");
    }
}
