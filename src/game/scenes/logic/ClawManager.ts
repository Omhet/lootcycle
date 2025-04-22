import { Scene } from "phaser";
import { DepthLayers } from "../Game";

// Define interfaces using Phaser's Matter types
export class ClawManager {
  private scene: Scene;

  private anchor: Phaser.Physics.Matter.Image | null = null;

  // Constants for configuration
  private readonly ANCHOR_X_OFFSET = 350; // Relative to screen center
  private readonly ANCHOR_Y = 100; // Fixed Y position for the top anchor

  private speed = 150;

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
    this.anchor = this.scene.matter.add.sprite(anchorX, anchorY, "claw_anchor", undefined, {
      isStatic: true, // Make the anchor completely static instead of just ignoring gravity
      collisionFilter: { group },
    });
    this.anchor.setDepth(DepthLayers.BackgroundFrame - 1);

    let prev = this.anchor;
    let y = anchorY;
    const linkHeight = 50; // Approximate height of the chain link sprite

    for (let i = 0; i < 4; i++) {
      const isEven = i % 2 === 0;

      let link = this.scene.matter.add.sprite(anchorX, y, "clawParts", isEven ? "claw_chain_front.png" : "claw_chain_side.png", {
        shape: isEven ? clawPhysics.claw_chain_front : clawPhysics.claw_chain_side,
        mass: 0.1, // Increase mass slightly for more stability
        frictionAir: 0.05, // Increase air friction to reduce movement
        friction: 0.2, // Increase surface friction
        restitution: 0.1, // Low restitution (bounciness)
        collisionFilter: { group },
      });
      link.setDepth(isEven ? DepthLayers.Claw : DepthLayers.Claw + 1);

      const isFirst = i === 0;
      const jointLength = 0;
      const stiffness = 1;
      const damping = 0.5; // Increased from 0.1 to reduce oscillation

      // Create main joint
      this.scene.matter.add.joint(prev.body as MatterJS.BodyType, link.body as MatterJS.BodyType, jointLength, stiffness, {
        pointA: { x: 0, y: isFirst ? 100 : linkHeight / 4 },
        pointB: { x: 0, y: -linkHeight / 4 },
        damping,
      });

      // Add an angle constraint to prevent excessive rotation
      if (!isFirst) {
        this.scene.matter.add.constraint(
          prev.body as MatterJS.BodyType,
          link.body as MatterJS.BodyType,
          0, // Length
          0.9, // Stiffness
          {
            angleA: 0,
            angleB: 0,
            pointA: { x: 0, y: linkHeight / 4 },
            pointB: { x: 0, y: -linkHeight / 4 },
          }
        );
      }

      prev = link;

      y += linkHeight; // Use linkHeight for positioning
    }

    // Claw Center
    const clawCenter = this.scene.matter.add.sprite(anchorX, y, "clawParts", "claw_center.png", {
      shape: clawPhysics.claw_center,
      mass: 0.2,
      frictionAir: 0.01,
      friction: 0.2,
      restitution: 0.1,
      collisionFilter: { group },
    });
    clawCenter.setDepth(DepthLayers.Claw + 2);
    this.scene.matter.add.joint(prev.body as MatterJS.BodyType, clawCenter.body as MatterJS.BodyType, 0, 1, {
      pointA: { x: 0, y: linkHeight / 4 },
      pointB: { x: 0, y: -linkHeight / 4 },
      damping: 0.5,
    });

    this.scene.matter.body.setInertia(clawCenter.body as MatterJS.BodyType, Infinity);

    const centerHeight = clawCenter.height;

    // Claw Shoulders
    // Claw Shoulder Left
    const clawShoulderLeft = this.scene.matter.add.sprite(anchorX - 50, y, "clawParts", "claw_shoulder_left.png", {
      shape: clawPhysics.claw_shoulder_left,
      mass: 0.3,
      frictionAir: 0.01,
      friction: 0.2,
      restitution: 0.1,
      collisionFilter: { group },
    });
    clawShoulderLeft.setDepth(DepthLayers.Claw + 1);
    this.scene.matter.add.constraint(clawCenter.body as MatterJS.BodyType, clawShoulderLeft.body as MatterJS.BodyType, 0, 1, {
      pointA: { x: 0, y: -centerHeight / 2 + clawShoulderLeft.width / 2 }, // Attach point on the claw center (adjust as needed)
      pointB: { x: 0, y: -clawShoulderLeft.height / 2 }, // Top middle point of the shoulder
      damping: 0.5,
    });
    // Set angle using Phaser's Matter interface
    this.scene.matter.body.setAngle(clawShoulderLeft.body as MatterJS.BodyType, Phaser.Math.DegToRad(100));
    // Lock rotation initially
    this.scene.matter.body.setInertia(clawShoulderLeft.body as MatterJS.BodyType, Infinity);

    // Claw Shoulder Right
    const clawShoulderRight = this.scene.matter.add.sprite(anchorX + 50, y, "clawParts", "claw_shoulder_right.png", {
      shape: clawPhysics.claw_shoulder_right,
      mass: 0.3,
      frictionAir: 0.01,
      friction: 0.2,
      restitution: 0.1,
      collisionFilter: { group },
    });
    clawShoulderRight.setDepth(DepthLayers.Claw + 1);
    this.scene.matter.add.constraint(clawCenter.body as MatterJS.BodyType, clawShoulderRight.body as MatterJS.BodyType, 0, 1, {
      pointA: { x: 0, y: -centerHeight / 2 + clawShoulderRight.width / 2 }, // Attach point on the claw center (adjust as needed)
      pointB: { x: 0, y: -clawShoulderRight.height / 2 }, // Top middle point of the shoulder
      damping: 0.5,
    });
    // Set angle using Phaser's Matter interface
    this.scene.matter.body.setAngle(clawShoulderRight.body as MatterJS.BodyType, Phaser.Math.DegToRad(-100));
    // Lock rotation initially
    this.scene.matter.body.setInertia(clawShoulderRight.body as MatterJS.BodyType, Infinity);

    // Claw Hands
    // Claw Hand Left
    const clawHandLeft = this.scene.matter.add.sprite(clawShoulderLeft.x, clawShoulderLeft.y, "clawParts", "claw_hand_left.png", {
      shape: clawPhysics.claw_hand_left,
      mass: 0.2,
      frictionAir: 0.01,
      friction: 0.2,
      restitution: 0.1,
      collisionFilter: { group },
    });
    clawHandLeft.setDepth(DepthLayers.Claw);
    this.scene.matter.add.constraint(clawShoulderLeft.body as MatterJS.BodyType, clawHandLeft.body as MatterJS.BodyType, 0, 1, {
      pointA: { x: -clawShoulderLeft.height / 2, y: 0 },
      pointB: { x: 0, y: -clawHandLeft.height / 2 + 20 },
      damping: 0.5,
    });
    // Set angle using Phaser's Matter interface
    this.scene.matter.body.setAngle(clawHandLeft.body as MatterJS.BodyType, Phaser.Math.DegToRad(0));
    // Lock rotation initially
    this.scene.matter.body.setInertia(clawHandLeft.body as MatterJS.BodyType, Infinity);

    // Claw Hand Right
    const clawHandRight = this.scene.matter.add.sprite(clawShoulderRight.x, clawShoulderRight.y, "clawParts", "claw_hand_right.png", {
      shape: clawPhysics.claw_hand_right,
      mass: 0.2,
      frictionAir: 0.01,
      friction: 0.2,
      restitution: 0.1,
      collisionFilter: { group },
    });
    clawHandRight.setDepth(DepthLayers.Claw);
    this.scene.matter.add.constraint(clawShoulderRight.body as MatterJS.BodyType, clawHandRight.body as MatterJS.BodyType, 0, 1, {
      pointA: { x: clawShoulderRight.height / 2, y: 0 },
      pointB: { x: 0, y: -clawShoulderRight.height / 2 + 20 },
      damping: 0.5,
    });
    // Set angle using Phaser's Matter interface
    this.scene.matter.body.setAngle(clawHandRight.body as MatterJS.BodyType, Phaser.Math.DegToRad(0));
    // Lock rotation initially
    this.scene.matter.body.setInertia(clawHandRight.body as MatterJS.BodyType, Infinity);
  }

  public move(moveFactor: number): void {
    // Since the anchor is now static, we need to handle position changes directly
    if (this.anchor && this.anchor.body) {
      // For static bodies, we need to update position directly
      const newX = this.anchor.x + moveFactor * this.speed * (1 / 60); // Assuming 60fps
      this.scene.matter.body.setPosition(this.anchor.body as MatterJS.BodyType, {
        x: newX,
        y: this.anchor.y,
      });
    }
  }

  public destroy(): void {
    console.log("ClawManager destroyed");
  }
}
