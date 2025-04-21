import { Scene } from "phaser";
import { DepthLayers } from "../Game";

// Define interfaces using Phaser's Matter types
export class ClawManager {
    private scene: Scene;

    private anchor: Phaser.Physics.Matter.Image | null = null;

    // Constants for configuration
    private readonly ANCHOR_X_OFFSET = 350; // Relative to screen center
    private readonly ANCHOR_Y = 100; // Fixed Y position for the top anchor

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
                collisionFilter: { group },
            }
        );
        this.anchor.setDepth(DepthLayers.BackgroundFrame - 1);

        let prev = this.anchor;
        let y = anchorY;
        const linkHeight = 50; // Approximate height of the chain link sprite

        for (let i = 0; i < 4; i++) {
            const isEven = i % 2 === 0;

            let link = this.scene.matter.add.sprite(
                anchorX,
                y,
                "clawParts",
                isEven ? "claw_chain_front.png" : "claw_chain_side.png",
                {
                    shape: isEven
                        ? clawPhysics.claw_chain_front
                        : clawPhysics.claw_chain_side,
                    mass: 0.1,
                    collisionFilter: { group },
                }
            );
            link.setDepth(isEven ? DepthLayers.Claw : DepthLayers.Claw + 1);

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
                    pointA: { x: 0, y: isFirst ? 100 : linkHeight / 4 },
                    pointB: { x: 0, y: -linkHeight / 4 },
                    damping,
                }
            );

            prev = link;

            y += linkHeight; // Use linkHeight for positioning
        }
    }

    public setAnchorVelocityX(velocityX: number): void {
        this.anchor?.setVelocityX(velocityX);
    }

    public destroy(): void {
        console.log("ClawManager destroyed");
    }
}
