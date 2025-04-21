import { Scene } from "phaser";
import { DepthLayers } from "../Game";

// Define interfaces using Phaser's Matter types
export class ClawManager {
  private scene: Scene;

  private anchor: Phaser.Physics.Matter.Image | null = null;
  private lastChainLink: Phaser.Physics.Matter.Sprite | null = null;
  private allClawSprites: Phaser.GameObjects.Sprite[] = []; // Renamed for clarity
  private centerBody: MatterJS.BodyType | null = null;
  private leftPincerComposite: MatterJS.BodyType | null = null;
  private rightPincerComposite: MatterJS.BodyType | null = null;
  private constraints: MatterJS.Constraint[] = []; // To store constraints for cleanup

  private linkHeight = 50; // Approximate height of the chain link sprite

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

    // Create a collision group for the claw parts to prevent self-collision initially if needed
    const group = this.scene.matter.world.nextGroup(true);
    // Create a category for the claw parts
    const clawCategory = this.scene.matter.world.nextCategory();

    // Chain
    this.anchor = this.scene.matter.add.sprite(anchorX, anchorY, "claw_anchor", undefined, {
      isStatic: true,
      collisionFilter: { group }, // Keep chain parts from colliding with each other initially
    });
    this.anchor.setDepth(DepthLayers.BackgroundFrame - 1);

    let prev = this.anchor;
    let y = anchorY;

    // Create chain links
    for (let i = 0; i < 4; i++) {
      const isEven = i % 2 === 0;
      const frame = isEven ? "claw_chain_front.png" : "claw_chain_side.png";
      const shape = isEven ? clawPhysicsShapes.claw_chain_front : clawPhysicsShapes.claw_chain_side;

      let link = this.scene.matter.add.sprite(anchorX, y, "clawParts", frame, {
        shape: shape,
        mass: 0.3,
        frictionAir: 0.01,
        friction: 0.2,
        restitution: 0.1,
        collisionFilter: {
          group: group, // Prevent self-collision within the chain/claw group
          category: clawCategory, // Assign to claw category
          mask: -1, // Collide with everything by default (can be refined)
        },
      });
      link.setDepth(isEven ? DepthLayers.Claw : DepthLayers.Claw + 1);
      this.allClawSprites.push(link); // Add chain links to sprite list

      const isFirst = i === 0;
      const jointLength = 0;
      const stiffness = 1;
      const damping = 0.5;

      // Create main joint connecting links
      const joint = this.scene.matter.add.joint(prev.body as MatterJS.BodyType, link.body as MatterJS.BodyType, jointLength, stiffness, {
        pointA: { x: 0, y: isFirst ? 100 : this.linkHeight / 4 }, // Adjust anchor point Y
        pointB: { x: 0, y: -this.linkHeight / 4 },
        damping,
      });
      this.constraints.push(joint); // Store constraint

      // Add angle constraint (optional, helps stabilize chain)
      if (!isFirst) {
        const angleConstraint = this.scene.matter.add.constraint(prev.body as MatterJS.BodyType, link.body as MatterJS.BodyType, 0, 0.9, {
          angleA: 0,
          angleB: 0,
          pointA: { x: 0, y: this.linkHeight / 4 },
          pointB: { x: 0, y: -this.linkHeight / 4 },
        });
        this.constraints.push(angleConstraint); // Store constraint
      }

      prev = link;
      if (i === 3) {
        this.lastChainLink = link;
      }

      y += this.linkHeight;
    }

    // --- Create Claw Parts ---
    // @ts-ignore - Access Matter directly
    const Matter = Phaser.Physics.Matter.Matter;

    // --- Center Part ---
    const centerStartX = anchorX;
    const centerStartY = y + 20; // Position below the last link
    const centerSprite = this.scene.matter.add.sprite(centerStartX, centerStartY, "clawParts", "claw_center.png", {
      shape: clawPhysicsShapes.claw_center,
      label: "clawCenterSprite",
      collisionFilter: { category: clawCategory, mask: -1, group },
      friction: 0.2,
      frictionAir: 0.01,
      restitution: 0.1,
    });
    centerSprite.setDepth(DepthLayers.Claw + 2);
    this.allClawSprites.push(centerSprite);
    this.centerBody = centerSprite.body as MatterJS.BodyType; // Store reference to the body

    // --- Left Pincer ---
    const shoulderLeftSprite = this.scene.matter.add.sprite(centerStartX - 30, centerStartY - 15, "clawParts", "claw_shoulder.png", {
      shape: clawPhysicsShapes.claw_shoulder,
      label: "clawShoulderLeftSprite",
      collisionFilter: { category: clawCategory, mask: -1, group }, // Add to group
    });
    shoulderLeftSprite.setDepth(DepthLayers.Claw + 3);
    shoulderLeftSprite.setAngle(-30);
    this.allClawSprites.push(shoulderLeftSprite);

    const handLeftSprite = this.scene.matter.add.sprite(centerStartX - 60, centerStartY, "clawParts", "claw_hand.png", {
      shape: clawPhysicsShapes.claw_hand,
      label: "clawHandLeftSprite",
      collisionFilter: { category: clawCategory, mask: -1, group }, // Add to group
    });
    handLeftSprite.setDepth(DepthLayers.Claw + 4);
    handLeftSprite.setAngle(-45);
    this.allClawSprites.push(handLeftSprite);

    const shoulderLeftBody = shoulderLeftSprite.body as MatterJS.BodyType;
    const handLeftBody = handLeftSprite.body as MatterJS.BodyType;

    // Remove individual bodies before creating composite
    this.scene.matter.world.remove([shoulderLeftBody, handLeftBody]);

    this.leftPincerComposite = Matter.Body.create({
      parts: [shoulderLeftBody, handLeftBody],
      friction: 0.2,
      frictionAir: 0.01,
      restitution: 0.1,
      collisionFilter: { category: clawCategory, mask: -1, group }, // Apply filter to composite
      label: "leftPincerComposite",
    });
    // Position the composite based on its parts' initial relative positions
    Matter.Body.setPosition(this.leftPincerComposite, { x: centerStartX - 45, y: centerStartY - 7 }); // Fine-tune position
    // Add the composite body to the world *after* ensuring it's not null
    if (this.leftPincerComposite) {
      this.scene.matter.world.add(this.leftPincerComposite);
    }

    // --- Right Pincer ---
    const shoulderRightSprite = this.scene.matter.add.sprite(centerStartX + 30, centerStartY - 15, "clawParts", "claw_shoulder.png", {
      shape: clawPhysicsShapes.claw_shoulder,
      label: "clawShoulderRightSprite",
      collisionFilter: { category: clawCategory, mask: -1, group }, // Add to group
    });
    shoulderRightSprite.setDepth(DepthLayers.Claw + 3);
    shoulderRightSprite.setAngle(30);
    shoulderRightSprite.setFlipX(true);
    this.allClawSprites.push(shoulderRightSprite);

    const handRightSprite = this.scene.matter.add.sprite(centerStartX + 60, centerStartY, "clawParts", "claw_hand.png", {
      shape: clawPhysicsShapes.claw_hand,
      label: "clawHandRightSprite",
      collisionFilter: { category: clawCategory, mask: -1, group }, // Add to group
    });
    handRightSprite.setDepth(DepthLayers.Claw + 4);
    handRightSprite.setAngle(45);
    handRightSprite.setFlipX(true);
    this.allClawSprites.push(handRightSprite);

    const shoulderRightBody = shoulderRightSprite.body as MatterJS.BodyType;
    const handRightBody = handRightSprite.body as MatterJS.BodyType;

    // Remove individual bodies before creating composite
    this.scene.matter.world.remove([shoulderRightBody, handRightBody]);

    this.rightPincerComposite = Matter.Body.create({
      parts: [shoulderRightBody, handRightBody],
      friction: 0.2,
      frictionAir: 0.01,
      restitution: 0.1,
      collisionFilter: { category: clawCategory, mask: -1, group }, // Apply filter to composite
      label: "rightPincerComposite",
    });
    Matter.Body.setPosition(this.rightPincerComposite, { x: centerStartX + 45, y: centerStartY - 7 }); // Fine-tune position
    // Add the composite body to the world *after* ensuring it's not null
    if (this.rightPincerComposite) {
      this.scene.matter.world.add(this.rightPincerComposite);
    }

    // --- Connect Parts ---

    // Connect last chain link to the center body
    if (this.lastChainLink && this.lastChainLink.body && this.centerBody) {
      const chainToCenterJoint = this.scene.matter.add.joint(
        this.lastChainLink.body as MatterJS.BodyType,
        this.centerBody,
        0, // length
        1, // stiffness
        {
          pointA: { x: 0, y: this.linkHeight / 4 }, // Point on the link
          pointB: { x: 0, y: -20 }, // Point on the center body (adjust as needed)
          damping: 0.5,
        }
      );
      this.constraints.push(chainToCenterJoint);
    }

    // Connect left pincer to center body (Revolute Joint)
    if (this.centerBody && this.leftPincerComposite) {
      const leftPivot = this.scene.matter.add.constraint(
        this.centerBody,
        this.leftPincerComposite,
        0, // length (pin joint)
        0.8, // stiffness
        {
          // Point on center body (e.g., left side)
          pointA: { x: -25, y: -10 }, // Adjust x, y relative to centerBody's center
          // Point on the left pincer composite (e.g., near the shoulder pivot)
          pointB: { x: 15, y: -8 }, // Adjust x, y relative to leftPincerComposite's center
          damping: 0.1,
        }
      );
      this.constraints.push(leftPivot);
    }

    // Connect right pincer to center body (Revolute Joint)
    if (this.centerBody && this.rightPincerComposite) {
      const rightPivot = this.scene.matter.add.constraint(
        this.centerBody,
        this.rightPincerComposite,
        0, // length (pin joint)
        0.8, // stiffness
        {
          // Point on center body (e.g., right side)
          pointA: { x: 25, y: -10 }, // Adjust x, y relative to centerBody's center
          // Point on the right pincer composite (e.g., near the shoulder pivot)
          pointB: { x: -15, y: -8 }, // Adjust x, y relative to rightPincerComposite's center
          damping: 0.1,
        }
      );
      this.constraints.push(rightPivot);
    }

    // Sprites will automatically follow their associated bodies (or the composite they belong to)
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
    console.log("ClawManager destroying...");

    // Remove constraints first
    this.constraints.forEach((constraint) => this.scene.matter.world.remove(constraint));
    this.constraints = [];

    // Remove composite bodies and the center body
    if (this.leftPincerComposite) {
      this.scene.matter.world.remove(this.leftPincerComposite);
      this.leftPincerComposite = null;
    }
    if (this.rightPincerComposite) {
      this.scene.matter.world.remove(this.rightPincerComposite);
      this.rightPincerComposite = null;
    }
    // Note: The center body is tied to centerSprite, destroying the sprite handles the body.

    // Destroy all sprites (including chain links, center, shoulders, hands)
    this.allClawSprites.forEach((sprite) => sprite.destroy());
    this.allClawSprites = [];

    // Destroy the anchor
    if (this.anchor) {
      this.anchor.destroy();
      this.anchor = null;
    }

    this.centerBody = null; // Clear reference
    this.lastChainLink = null; // Clear reference

    console.log("ClawManager destroyed");
  }
}
