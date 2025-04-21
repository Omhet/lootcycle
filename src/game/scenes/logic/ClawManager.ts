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

        // Create a collision group for the claw parts
        const group = this.scene.matter.world.nextGroup(true);

        // Chain
        this.anchor = this.scene.matter.add.sprite(
            anchorX,
            anchorY,
            "claw_anchor",
            undefined,
            {
                ignoreGravity: true,
                isStatic: true,
                collisionFilter: { group },
            }
        );
        this.anchor.setDepth(DepthLayers.Claw);

        let prev = this.anchor;
        let y = anchorY;
        const linkHeight = 50; // Approximate height of the chain link sprite

        for (let i = 0; i < 4; i++) {
            let link = this.scene.matter.add.sprite(
                anchorX,
                y,
                "clawParts",
                "claw_chain_front.png",
                {
                    shape: clawPhysics.claw_chain_front,
                    mass: 0.1,
                    collisionFilter: { group },
                }
            );
            link.setDepth(DepthLayers.Claw);

            const isFirst = i === 0;
            const jointLength = 0;
            const stiffness = 1;
            const damping = 0.1;

            this.scene.matter.add.joint(
                prev.body as MatterJS.BodyType,
                link.body as MatterJS.BodyType,
                jointLength,
                stiffness,
                {
                    pointA: { x: 0, y: isFirst ? 100 : linkHeight / 3 },
                    pointB: { x: 0, y: -linkHeight / 3 },
                    damping,
                }
            );

            prev = link;

            y += linkHeight; // Use linkHeight for positioning
        }
    }

    public destroy(): void {
        console.log("ClawManager destroyed");
    }
}
