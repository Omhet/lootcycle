import { Scene } from "phaser";
import { DepthLayers } from "../Game";

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

  // Constants for configuration
  private readonly CONTAINER_ZONE_START_X = 100;
  private readonly CONTAINER_ZONE_END_X = 300;

  private readonly CLAW_MOVEMENT_VERTICAL_ZONE_START = 100;
  private readonly CLAW_MOVEMENT_VERTICAL_ZONE_END = 400;

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
    const anchorX =
      centerX + this.CONTAINER_ZONE_START_X + (this.scene.cameras.main.width - this.CONTAINER_ZONE_END_X - (centerX + this.CONTAINER_ZONE_START_X)) / 2;
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
      mass: 0.3,
      frictionAir: 0.01,
      friction: 0.2,
      restitution: 0.1,
      collisionFilter: { group },
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
      mass: 0.3,
      frictionAir: 0.01,
      friction: 0.2,
      restitution: 0.1,
      collisionFilter: { group },
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
   * Toggles the claw between open and closed states with smooth animation
   */
  public toggleOpen(): void {
    // Stop any existing animation
    if (this.angleAnimationTween) {
      this.angleAnimationTween.stop();
    }

    this.isOpen = !this.isOpen;
    this.targetAngle = this.isOpen ? this.OPEN_ANGLE : this.CLOSED_ANGLE;

    // Create a virtual object to tween and use its value to set the pincer angles
    const animationObject = { angle: this.isOpen ? this.CLOSED_ANGLE : this.OPEN_ANGLE };
    
    this.angleAnimationTween = this.scene.tweens.add({
      targets: animationObject,
      angle: this.targetAngle,
      duration: 500, // Animation duration in ms
      ease: 'Power2',
      onUpdate: () => {
        if (this.leftPincer && this.rightPincer) {
          // Update the left pincer angle
          this.scene.matter.body.setAngle(
            this.leftPincer.body as MatterJS.BodyType, 
            Phaser.Math.DegToRad(animationObject.angle)
          );
          
          // Update the right pincer angle (opposite direction)
          this.scene.matter.body.setAngle(
            this.rightPincer.body as MatterJS.BodyType, 
            Phaser.Math.DegToRad(-animationObject.angle)
          );
        }
      },
      onComplete: () => {
        this.angleAnimationTween = null;
      }
    });
  }

  public moveHorizontal(moveFactor: number): void {
    // Since the anchor is now static, we need to handle position changes directly
    if (this.anchor && this.anchor.body) {
      // For static bodies, we need to update position directly
      const newX = this.anchor.x + moveFactor * this.speed * (1 / 60); // Assuming 60fps

      if (newX >= this.scene.cameras.main.width / 2 + this.CONTAINER_ZONE_START_X && newX <= this.scene.cameras.main.width - this.CONTAINER_ZONE_END_X) {
        this.scene.matter.body.setPosition(this.anchor.body as MatterJS.BodyType, {
          x: newX,
          y: this.anchor.y,
        });
      }
    }
  }

  public moveVertical(moveFactor: number): void {
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
    // Stop any ongoing animations
    if (this.angleAnimationTween) {
      this.angleAnimationTween.stop();
      this.angleAnimationTween = null;
    }
    console.log("ClawManager destroyed");
  }
}
