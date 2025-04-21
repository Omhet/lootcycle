import { Scene } from "phaser";
import { DepthLayers } from "../Game";

// Define interfaces using Phaser's Matter types
interface ClawParts {
    chain: Phaser.Physics.Matter.Sprite[];
    center: Phaser.Physics.Matter.Sprite;
    leftShoulder: Phaser.Physics.Matter.Sprite;
    leftHand: Phaser.Physics.Matter.Sprite;
    rightShoulder: Phaser.Physics.Matter.Sprite;
    rightHand: Phaser.Physics.Matter.Sprite;
}

interface ClawConstraints {
    chainConstraints: MatterJS.ConstraintType[];
    centerConstraint: MatterJS.ConstraintType | null;
    leftShoulderConstraint: MatterJS.ConstraintType | null;
    leftHandConstraint: MatterJS.ConstraintType | null;
    rightShoulderConstraint: MatterJS.ConstraintType | null;
    rightHandConstraint: MatterJS.ConstraintType | null;
}

export class ClawManager {
    private scene: Scene;
    private parts: ClawParts | null = null;
    private constraints: ClawConstraints | null = null;

    // Constants for configuration
    private readonly CHAIN_LINKS = 4;
    private readonly CHAIN_LINK_LENGTH = 45; // Approximate visual length
    private readonly ANCHOR_X_OFFSET = 0; // Relative to screen center
    private readonly ANCHOR_Y = 50; // Fixed Y position for the top anchor
    private readonly ARM_SHOULDER_OFFSET_X = 15; // Horizontal offset from center for shoulder joint
    private readonly ARM_SHOULDER_OFFSET_Y = 10; // Vertical offset from center for shoulder joint
    private readonly ARM_HAND_OFFSET_Y = 85; // Vertical offset from shoulder joint for hand joint

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

        // Collision group to prevent self-collision
        const group = this.scene.matter.world.nextGroup(true);

        const collisionProps = {
            collisionFilter: { group: group },
            friction: 0.1,
            frictionAir: 0.05, // Add some air friction for stability
            restitution: 0.1,
        };

        this.parts = {
            chain: [],
            center: null!, // Initialize later
            leftShoulder: null!,
            leftHand: null!,
            rightShoulder: null!,
            rightHand: null!,
        };

        this.constraints = {
            chainConstraints: [],
            centerConstraint: null,
            leftShoulderConstraint: null,
            leftHandConstraint: null,
            rightShoulderConstraint: null,
            rightHandConstraint: null,
        };

        // --- Create Chain ---
        let prevLinkBody: MatterJS.BodyType | null = null;
        let lastLinkY = anchorY;

        for (let i = 0; i < this.CHAIN_LINKS; i++) {
            const isFront = i % 2 === 0;
            const textureKey = isFront
                ? "claw_chain_front.png"
                : "claw_chain_side.png";
            const shapeKey = isFront ? "claw_chain_front" : "claw_chain_side";
            const linkY = lastLinkY + (i > 0 ? this.CHAIN_LINK_LENGTH / 2 : 0); // Position below previous

            const link = this.scene.matter.add.sprite(
                anchorX,
                linkY,
                "clawParts",
                textureKey,
                {
                    shape: clawPhysicsShapes[shapeKey],
                    ...collisionProps,
                }
            );
            link.setOrigin(0.5, 0); // Pivot at top-center
            link.setDepth(DepthLayers.Claw);
            link.setName(`chain_link_${i}`);
            this.parts.chain.push(link);

            const linkBody = link.body as MatterJS.BodyType;

            // Constraint length slightly less than visual to keep tension
            const constraintLength = this.CHAIN_LINK_LENGTH * 0.9;

            if (prevLinkBody) {
                // Connect to previous link's bottom
                const constraint = this.scene.matter.add.constraint(
                    prevLinkBody,
                    linkBody,
                    constraintLength,
                    0.9,
                    {
                        pointA: { x: 0, y: this.CHAIN_LINK_LENGTH / 2 }, // Bottom center of previous link
                        pointB: { x: 0, y: -this.CHAIN_LINK_LENGTH / 2 }, // Top center of current link
                    }
                );
                this.constraints.chainConstraints.push(constraint);
            } else {
                // Connect first link to anchor point
                const constraint = this.scene.matter.add.worldConstraint(
                    linkBody,
                    0,
                    0.9,
                    {
                        pointA: { x: anchorX, y: anchorY }, // Fixed world point
                        pointB: { x: 0, y: -this.CHAIN_LINK_LENGTH / 2 }, // Top center of first link
                    }
                );
                this.constraints.chainConstraints.push(constraint);
            }

            prevLinkBody = linkBody;
            lastLinkY = link.y + this.CHAIN_LINK_LENGTH / 2; // Update Y for next link placement
        }

        // --- Create Center ---
        const lastChainLink = this.parts.chain[this.CHAIN_LINKS - 1];
        const centerStartY = lastChainLink.y + this.CHAIN_LINK_LENGTH / 2; // Position below last chain link

        this.parts.center = this.scene.matter.add.sprite(
            anchorX,
            centerStartY,
            "clawParts",
            "claw_center.png",
            {
                shape: clawPhysicsShapes.claw_center,
                ...collisionProps,
            }
        );
        this.parts.center.setOrigin(0.5, 0);
        this.parts.center.setDepth(DepthLayers.Claw + 1); // Slightly above chain
        this.parts.center.setName("claw_center");

        // Connect center to last chain link
        this.constraints.centerConstraint = this.scene.matter.add.constraint(
            lastChainLink.body as MatterJS.BodyType,
            this.parts.center.body as MatterJS.BodyType,
            0, // Constraint length (0 for weld-like)
            1, // Stiffness
            {
                pointA: { x: 0, y: this.CHAIN_LINK_LENGTH / 2 }, // Bottom of last link (relative to its 0.5,0 origin)
                pointB: { x: 0, y: 0 }, // Top of center (relative to its 0.5,0 origin)
            }
        );

        // --- Create Arms ---
        const centerBody = this.parts.center.body as MatterJS.BodyType;

        // Left Arm
        this.parts.leftShoulder = this.scene.matter.add.sprite(
            anchorX - this.ARM_SHOULDER_OFFSET_X,
            this.parts.center.y + this.ARM_SHOULDER_OFFSET_Y, // Position relative to center's visual Y
            "clawParts",
            "claw_shoulder.png",
            { shape: clawPhysicsShapes.claw_shoulder, ...collisionProps }
        );
        this.parts.leftShoulder.setOrigin(0.5, 0);
        this.parts.leftShoulder.setDepth(DepthLayers.Claw);
        this.parts.leftShoulder.setName("claw_left_shoulder");

        this.constraints.leftShoulderConstraint =
            this.scene.matter.add.constraint(
                centerBody,
                this.parts.leftShoulder.body as MatterJS.BodyType,
                0,
                0.8,
                {
                    // Point relative to center sprite's origin (0.5, 0)
                    pointA: {
                        x: -this.ARM_SHOULDER_OFFSET_X,
                        y: this.ARM_SHOULDER_OFFSET_Y,
                    },
                    // Point relative to shoulder sprite's origin (0.5, 0)
                    pointB: { x: 0, y: 0 },
                }
            );

        const handY = this.parts.leftShoulder.y + this.ARM_HAND_OFFSET_Y; // Position relative to shoulder's visual Y
        this.parts.leftHand = this.scene.matter.add.sprite(
            this.parts.leftShoulder.x,
            handY,
            "clawParts",
            "claw_hand.png",
            { shape: clawPhysicsShapes.claw_hand, ...collisionProps }
        );
        this.parts.leftHand.setOrigin(0.5, 0);
        this.parts.leftHand.setDepth(DepthLayers.Claw);
        this.parts.leftHand.setName("claw_left_hand");

        this.constraints.leftHandConstraint = this.scene.matter.add.constraint(
            this.parts.leftShoulder.body as MatterJS.BodyType,
            this.parts.leftHand.body as MatterJS.BodyType,
            0,
            0.9,
            {
                // Point relative to shoulder sprite's origin (0.5, 0)
                pointA: { x: 0, y: this.ARM_HAND_OFFSET_Y },
                // Point relative to hand sprite's origin (0.5, 0)
                pointB: { x: 0, y: 0 },
            }
        );

        // Right Arm (mirrored)
        this.parts.rightShoulder = this.scene.matter.add.sprite(
            anchorX + this.ARM_SHOULDER_OFFSET_X,
            this.parts.center.y + this.ARM_SHOULDER_OFFSET_Y, // Position relative to center's visual Y
            "clawParts",
            "claw_shoulder.png",
            { shape: clawPhysicsShapes.claw_shoulder, ...collisionProps }
        );
        this.parts.rightShoulder.setOrigin(0.5, 0);
        this.parts.rightShoulder.setFlipX(true); // Mirror
        this.parts.rightShoulder.setDepth(DepthLayers.Claw);
        this.parts.rightShoulder.setName("claw_right_shoulder");

        this.constraints.rightShoulderConstraint =
            this.scene.matter.add.constraint(
                centerBody,
                this.parts.rightShoulder.body as MatterJS.BodyType,
                0,
                0.8,
                {
                    // Point relative to center sprite's origin (0.5, 0)
                    pointA: {
                        x: this.ARM_SHOULDER_OFFSET_X,
                        y: this.ARM_SHOULDER_OFFSET_Y,
                    },
                    // Point relative to shoulder sprite's origin (0.5, 0)
                    pointB: { x: 0, y: 0 },
                }
            );

        this.parts.rightHand = this.scene.matter.add.sprite(
            this.parts.rightShoulder.x,
            handY, // Same Y as left hand initially, relative to shoulder's visual Y
            "clawParts",
            "claw_hand.png",
            { shape: clawPhysicsShapes.claw_hand, ...collisionProps }
        );
        this.parts.rightHand.setOrigin(0.5, 0);
        this.parts.rightHand.setFlipX(true); // Mirror
        this.parts.rightHand.setDepth(DepthLayers.Claw);
        this.parts.rightHand.setName("claw_right_hand");

        this.constraints.rightHandConstraint = this.scene.matter.add.constraint(
            this.parts.rightShoulder.body as MatterJS.BodyType,
            this.parts.rightHand.body as MatterJS.BodyType,
            0,
            0.9,
            {
                // Point relative to shoulder sprite's origin (0.5, 0)
                pointA: { x: 0, y: this.ARM_HAND_OFFSET_Y },
                // Point relative to hand sprite's origin (0.5, 0)
                pointB: { x: 0, y: 0 },
            }
        );

        console.log("Claw constructed using Phaser Matter types.");
    }

    // --- Claw Movement Logic ---
    // TODO: Implement functions to move the claw anchor point left/right
    // TODO: Implement function to adjust the length of the top chain constraint (lowering/raising)
    // TODO: Implement grab/release mechanism (e.g., using constraints, sensors, or changing collision filters)

    public update(time: number, delta: number): void {
        // No specific update logic needed for physics simulation itself
        // Movement controls will modify constraints or body properties
    }

    /**
     * Returns the central part of the claw, useful for positioning or reference.
     */
    public getCenterSprite(): Phaser.Physics.Matter.Sprite | null {
        return this.parts?.center ?? null;
    }

    public destroy(): void {
        if (this.parts) {
            // Destroy sprites (which also removes their Matter bodies)
            this.parts.chain.forEach((p) => p.destroy());
            this.parts.center.destroy();
            this.parts.leftShoulder.destroy();
            this.parts.leftHand.destroy();
            this.parts.rightShoulder.destroy();
            this.parts.rightHand.destroy();
            this.parts = null;
        }

        // Constraints are removed automatically when bodies are destroyed,
        // but explicit removal is safer if managing constraints separately.
        if (this.constraints) {
            this.constraints = null;
        }

        console.log("ClawManager destroyed");
    }
}
