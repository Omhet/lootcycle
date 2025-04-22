import { Scene } from "phaser";
import { CollisionCategories, CollisionMasks } from "../../physics/CollisionCategories";
import { DepthLayers } from "../Game";

// Define claw states for state machine
enum ClawState {
  IDLE,
  DESCENDING,
  GRABBING,
  ASCENDING,
}

// Define interfaces using Phaser's Matter types
export class ClawManager {
  private scene: Scene;

  private anchor: Phaser.Physics.Matter.Image | null = null;
  private leftPincer: Phaser.Physics.Matter.Sprite | null = null;
  private rightPincer: Phaser.Physics.Matter.Sprite | null = null;
  private isOpen: boolean = true;
  private targetAngle: number = 20;
  private readonly OPEN_ANGLE: number = 20;
  private readonly CLOSED_ANGLE: number = -50;
  private angleAnimationTween: Phaser.Tweens.Tween | null = null;

  // State machine for claw behavior
  private state: ClawState = ClawState.IDLE;
  private autoMoveSpeed: number = 2; // Speed for automated movement
  private grabDelay: number = 500; // Delay in ms before ascending after grab
  private grabTimer: Phaser.Time.TimerEvent | null = null;

  // Constants for configuration
  private readonly CLAW_MOVEMENT_HORIZONTAL_ZONE_START = 275;
  private readonly CLAW_MOVEMENT_HORIZONTAL_ZONE_END = 275;

  private readonly CLAW_MOVEMENT_VERTICAL_ZONE_START = 200;
  private readonly CLAW_MOVEMENT_VERTICAL_ZONE_END = 350;

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
    const anchorX = centerX;
    const anchorY = this.CLAW_MOVEMENT_VERTICAL_ZONE_START;

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
      isStatic: true,
      collisionFilter: { group, category: CollisionCategories.PLAYER },
    });
    this.anchor.setDepth(DepthLayers.Claw - 1);
    this.anchor.setOrigin(0.5, 1);

    let prev = this.anchor;
    let y = anchorY;
    const linkHeight = 50; // Approximate height of the chain link sprite

    for (let i = 0; i < 4; i++) {
      const isEven = i % 2 === 0;

      let link = this.scene.matter.add.sprite(anchorX, y, "clawParts", isEven ? "claw_chain_front.png" : "claw_chain_side.png", {
        shape: isEven ? clawPhysics.claw_chain_front : clawPhysics.claw_chain_side,
        mass: 0.1, // Increase mass slightly for more stability
        inverseMass: 10,
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

      if (isFirst) {
        this.scene.matter.add.joint(prev.body as MatterJS.BodyType, link.body as MatterJS.BodyType, jointLength, stiffness, {
          pointA: { x: 0, y: isFirst ? 0 : linkHeight / 4 },
          pointB: { x: 0, y: -linkHeight / 4 },
          damping,
        });
      } else {
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
      frictionAir: 0.01,
      friction: 0.2,
      restitution: 0.1,
      collisionFilter: { group },
    });
    clawCenter.setDepth(DepthLayers.Claw + 2);
    this.scene.matter.add.joint(prev.body as MatterJS.BodyType, clawCenter.body as MatterJS.BodyType, 0, 1, {
      pointA: { x: 0, y: linkHeight / 4 },
      pointB: { x: 0, y: -linkHeight / 4 },
      angleA: 0,
      angleB: 0,
      damping: 0.5,
    });

    this.scene.matter.body.setInertia(clawCenter.body as MatterJS.BodyType, Infinity);

    const pincersAngle = this.OPEN_ANGLE;
    // Claw Pincers
    // Claw Pincer Left
    this.leftPincer = this.scene.matter.add.sprite(anchorX - 50, y, "clawParts", "claw_pincer_left.png", {
      shape: clawPhysics.claw_pincer_left,
      frictionAir: 0.01,
      friction: 0.2,
      restitution: 0.1,
      collisionFilter: {
        group,
        category: CollisionCategories.CLAW,
        mask: CollisionMasks.CLAW,
      },
    });
    this.leftPincer.setDepth(DepthLayers.Claw + 1);
    this.scene.matter.add.constraint(clawCenter.body as MatterJS.BodyType, this.leftPincer.body as MatterJS.BodyType, 0, 1, {
      pointA: { x: 0, y: 10 },
      pointB: { x: this.leftPincer.width / 2, y: 0 },
      damping: 0.5,
    });
    this.scene.matter.body.setAngle(this.leftPincer.body as MatterJS.BodyType, Phaser.Math.DegToRad(pincersAngle));
    this.scene.matter.body.setInertia(this.leftPincer.body as MatterJS.BodyType, Infinity);

    // Claw Pincer Right
    this.rightPincer = this.scene.matter.add.sprite(anchorX + 50, y, "clawParts", "claw_pincer_right.png", {
      shape: clawPhysics.claw_pincer_right,
      frictionAir: 0.01,
      friction: 0.2,
      restitution: 0.1,
      collisionFilter: {
        group,
        category: CollisionCategories.CLAW,
        mask: CollisionMasks.CLAW,
      },
    });
    this.rightPincer.setDepth(DepthLayers.Claw + 1);
    this.scene.matter.add.constraint(clawCenter.body as MatterJS.BodyType, this.rightPincer.body as MatterJS.BodyType, 0, 1, {
      pointA: { x: 0, y: 10 },
      pointB: { x: -this.rightPincer.width / 2, y: 0 },
      damping: 0.5,
    });
    this.scene.matter.body.setAngle(this.rightPincer.body as MatterJS.BodyType, Phaser.Math.DegToRad(-pincersAngle));
    this.scene.matter.body.setInertia(this.rightPincer.body as MatterJS.BodyType, Infinity);
  }

  /**
   * Initiates the automated claw grab sequence
   */
  public toggleClaw(): void {
    // If in IDLE state, toggle between opening and closing the claw
    if (this.state === ClawState.IDLE) {
      if (this.isOpen) {
        // Start the descent and grab sequence
        this.state = ClawState.DESCENDING;

        // Set up collision detection for the claw parts
        this.setupCollisionDetection();

        console.log("Claw grab sequence started - descending");
      } else {
        // Open the claw to release any caught items
        this.openClaw();
        console.log("Opening claw to release items");
      }
    }
  }

  /**
   * Sets up collision detection between claw and junk items
   */
  private setupCollisionDetection(): void {
    if (!this.leftPincer || !this.rightPincer) return;

    // Set up Matter.js collision event
    this.scene.matter.world.on("collisionstart", (event: MatterJS.IEventCollision<MatterJS.Engine>) => {
      if (this.state !== ClawState.DESCENDING) return;

      const pairs = event.pairs;

      for (let i = 0; i < pairs.length; i++) {
        const bodyA = pairs[i].bodyA as MatterJS.BodyType;
        const bodyB = pairs[i].bodyB as MatterJS.BodyType;

        // Check if collision is between claw and junk using collision categories
        const clawParts = [this.leftPincer?.body as MatterJS.BodyType, this.rightPincer?.body as MatterJS.BodyType];

        // Check if one body is a claw part and the other is a junk item using collision categories
        if (
          (clawParts.includes(bodyA) && bodyB.collisionFilter.category & CollisionCategories.JUNK) ||
          (clawParts.includes(bodyB) && bodyA.collisionFilter.category & CollisionCategories.JUNK)
        ) {
          this.onJunkCollision();
          break;
        }
      }
    });
  }

  /**
   * Called when the claw collides with a junk item
   */
  private onJunkCollision(): void {
    if (this.state !== ClawState.DESCENDING) return;

    // Change state to grabbing
    this.state = ClawState.GRABBING;
    console.log("Claw collided with junk - grabbing");

    // Close the claw
    this.closeClaw();

    // Set a timer before ascending
    this.grabTimer = this.scene.time.delayedCall(this.grabDelay, () => {
      this.state = ClawState.ASCENDING;
      console.log("Grab complete - ascending");
    });
  }

  /**
   * Closes the claw without changing its state
   */
  private closeClaw(): void {
    // Don't change isOpen state, just close the claw visually
    if (this.angleAnimationTween) {
      this.angleAnimationTween.stop();
    }

    this.isOpen = false;
    this.targetAngle = this.CLOSED_ANGLE;

    // Create a virtual object to tween and use its value to set the pincer angles
    const animationObject = { angle: this.OPEN_ANGLE };

    this.angleAnimationTween = this.scene.tweens.add({
      targets: animationObject,
      angle: this.targetAngle,
      duration: 500, // Animation duration in ms
      ease: "Power2",
      onUpdate: () => {
        if (this.leftPincer && this.rightPincer) {
          // Update the left pincer angle
          this.scene.matter.body.setAngle(this.leftPincer.body as MatterJS.BodyType, Phaser.Math.DegToRad(animationObject.angle));

          // Update the right pincer angle (opposite direction)
          this.scene.matter.body.setAngle(this.rightPincer.body as MatterJS.BodyType, Phaser.Math.DegToRad(-animationObject.angle));
        }
      },
      onComplete: () => {
        this.angleAnimationTween = null;
      },
    });
  }

  /**
   * Opens the claw to release any caught items
   */
  private openClaw(): void {
    if (this.angleAnimationTween) {
      this.angleAnimationTween.stop();
    }

    this.isOpen = true;
    this.targetAngle = this.OPEN_ANGLE;

    // Create a virtual object to tween and use its value to set the pincer angles
    const animationObject = { angle: this.CLOSED_ANGLE };

    this.angleAnimationTween = this.scene.tweens.add({
      targets: animationObject,
      angle: this.targetAngle,
      duration: 500, // Animation duration in ms
      ease: "Power2",
      onUpdate: () => {
        if (this.leftPincer && this.rightPincer) {
          // Update the left pincer angle
          this.scene.matter.body.setAngle(this.leftPincer.body as MatterJS.BodyType, Phaser.Math.DegToRad(animationObject.angle));

          // Update the right pincer angle (opposite direction)
          this.scene.matter.body.setAngle(this.rightPincer.body as MatterJS.BodyType, Phaser.Math.DegToRad(-animationObject.angle));
        }
      },
      onComplete: () => {
        this.angleAnimationTween = null;
      },
    });
  }

  /**
   * Update method to be called from the scene's update loop
   */
  public update(): void {
    this.handleAutomatedMovement();
  }

  /**
   * Handles the automated vertical movement of the claw based on its state
   */
  private handleAutomatedMovement(): void {
    if (!this.anchor || !this.anchor.body) return;

    switch (this.state) {
      case ClawState.DESCENDING:
        // Move down automatically
        this.moveVerticalAuto(1);
        break;

      case ClawState.ASCENDING:
        // Move up automatically
        this.moveVerticalAuto(-1);

        // If we've reached the top, reset to IDLE state
        if (this.anchor.y <= this.CLAW_MOVEMENT_VERTICAL_ZONE_START) {
          this.state = ClawState.IDLE;
          console.log("Claw returned to top - reset to IDLE");
        }
        break;

      case ClawState.IDLE:
      case ClawState.GRABBING:
      default:
        // Do nothing when in these states
        break;
    }
  }

  /**
   * Handles automated vertical movement for the claw
   */
  private moveVerticalAuto(moveFactor: number): void {
    if (!this.anchor || !this.anchor.body) return;

    const newY = this.anchor.y + moveFactor * this.autoMoveSpeed;

    if (newY >= this.CLAW_MOVEMENT_VERTICAL_ZONE_START && newY <= this.scene.cameras.main.height - this.CLAW_MOVEMENT_VERTICAL_ZONE_END) {
      this.scene.matter.body.setPosition(this.anchor.body as MatterJS.BodyType, {
        x: this.anchor.x,
        y: newY,
      });
    } else if (this.state === ClawState.DESCENDING && newY >= this.scene.cameras.main.height - this.CLAW_MOVEMENT_VERTICAL_ZONE_END) {
      // We've hit the bottom, start returning
      this.state = ClawState.GRABBING;
      this.closeClaw();

      // Set a timer before ascending
      this.grabTimer = this.scene.time.delayedCall(this.grabDelay, () => {
        this.state = ClawState.ASCENDING;
        console.log("Reached bottom - ascending");
      });
    }
  }

  public moveHorizontal(moveFactor: number): void {
    // Only allow manual control in IDLE state
    if (this.state !== ClawState.IDLE) return;

    // Since the anchor is now static, we need to handle position changes directly
    if (this.anchor && this.anchor.body) {
      // For static bodies, we need to update position directly
      const newX = this.anchor.x + moveFactor * this.speed * (1 / 60); // Assuming 60fps

      if (newX >= this.CLAW_MOVEMENT_HORIZONTAL_ZONE_START && newX <= this.scene.cameras.main.width - this.CLAW_MOVEMENT_HORIZONTAL_ZONE_END) {
        this.scene.matter.body.setPosition(this.anchor.body as MatterJS.BodyType, {
          x: newX,
          y: this.anchor.y,
        });
      }
    }
  }

  public moveVertical(moveFactor: number): void {
    // Only allow manual control in IDLE state
    if (this.state !== ClawState.IDLE) return;

    // Since the anchor is now static, we need to handle position changes directly
    if (this.anchor && this.anchor.body) {
      const newY = this.anchor.y + moveFactor * this.speed * (1 / 60);

      if (newY >= this.CLAW_MOVEMENT_VERTICAL_ZONE_START && newY <= this.scene.cameras.main.height - this.CLAW_MOVEMENT_VERTICAL_ZONE_END) {
        this.scene.matter.body.setPosition(this.anchor.body as MatterJS.BodyType, {
          x: this.anchor.x,
          y: newY,
        });
      }
    }
  }

  public destroy(): void {
    // Clean up collision listener
    this.scene.matter.world.off("collisionstart");

    // Clean up timer
    if (this.grabTimer) {
      this.grabTimer.destroy();
    }

    // Stop any ongoing animations
    if (this.angleAnimationTween) {
      this.angleAnimationTween.stop();
      this.angleAnimationTween = null;
    }
    console.log("ClawManager destroyed");
  }
}
