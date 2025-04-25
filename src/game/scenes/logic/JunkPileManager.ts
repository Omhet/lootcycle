import { Scene } from "phaser";
import { lootConfig } from "../../../lib/craft/config";
import { JunkPiece } from "../../../lib/craft/craftModel";
import { getJunkPortion } from "../../../lib/craft/getJunkPortion";
import { JUNK_PIPE_UPGRADES, JunkPipeUpgradeType } from "../../../lib/shop/config";
import { usePlayerProgressStore } from "../../../store/usePlayerProgressStore";
import { EventBus } from "../../EventBus";
import { CollisionCategories, CollisionMasks } from "../../physics/CollisionCategories";
import { DepthLayers } from "../Game";

// Interface to store both junk piece and its physics body
export interface JunkPileItem {
  junkPiece: JunkPiece;
  body: Phaser.Physics.Matter.Image | Phaser.Physics.Matter.Sprite;
  uniqueId: string; // Unique identifier for each junk piece instance
}

export class JunkPileManager {
  private scene: Scene;
  private portionNumber: number = 1;
  private junkPile: JunkPileItem[] = []; // Total accumulated junk collection
  private spawnTimers: Phaser.Time.TimerEvent[] = [];
  private junkIdCounter: number = 0; // Counter for generating unique IDs

  // Spawn point coordinates
  private spawnX: number;
  private spawnY: number;

  constructor(scene: Scene) {
    this.scene = scene;

    // Set default spawn point to top right corner with margin
    this.spawnX = this.scene.cameras.main.width - 200;
    this.spawnY = 100;
  }

  /**
   * Sets the spawn point for junk items
   * @param x The X coordinate of the spawn point
   * @param y The Y coordinate of the spawn point
   */
  public setSpawnPoint(x: number, y: number): void {
    this.spawnX = x;
    this.spawnY = y;
    console.log(`Junk pile spawn point set to: (${x}, ${y})`);
  }

  /**
   * Generates a unique ID for each junk piece
   * @param junkPiece The junk piece to create an ID for
   * @returns A unique identifier string
   */
  private generateUniqueJunkId(junkPiece: JunkPiece): string {
    this.junkIdCounter++;
    return `${junkPiece.id}_${this.junkIdCounter}`;
  }

  /**
   * Creates and spawns a physics body representing a junk piece
   * @param junkPiece The junk piece to visualize
   * @returns The created junk pile item with physics body
   */
  private spawnJunkItem(junkPiece: JunkPiece): JunkPileItem {
    // Generate a unique ID for this junk piece instance
    const uniqueId = this.generateUniqueJunkId(junkPiece);

    // Create a spawn zone with random offsets to prevent overlapping
    const spawnOffsetX = Phaser.Math.Between(-10, 10);
    const spawnOffsetY = Phaser.Math.Between(-10, 10);

    // Use the configurable spawn point with the random offset
    const spawnX = this.spawnX + spawnOffsetX;
    const spawnY = this.spawnY + spawnOffsetY;

    // Get the correct sprite frame name based on junk piece id
    const frameName = `${junkPiece.id}.png`;

    // Get physics shapes data
    const shapesData = this.scene.cache.json.get("junk-details-shapes");

    // Check if we have a matching physics shape for this junk piece
    const physicsKey = junkPiece.id;
    const hasPhysicsShape = shapesData && shapesData[physicsKey];

    // Apply a small random angle for the initial velocity direction
    // This creates the effect of items coming out of a bent pipe
    const angle = Phaser.Math.Between(-45, -15);
    const speed = Phaser.Math.Between(-6, -3);
    const velocityX = Math.cos(Phaser.Math.DegToRad(angle)) * speed;
    const velocityY = Math.sin(Phaser.Math.DegToRad(angle)) * speed;

    let physicsBody: Phaser.Physics.Matter.Sprite;

    if (hasPhysicsShape) {
      // Create a sprite with the correct physics shape
      physicsBody = this.scene.matter.add.sprite(spawnX, spawnY, "junk-details-sprites", frameName, {
        shape: shapesData[physicsKey],
        restitution: 0.01, // Bounciness
        frictionAir: 0.001, // Air friction
        friction: 0.01, // Surface friction
        mass: 0.2, // Mass
        inverseMass: 5,
        collisionFilter: {
          category: CollisionCategories.JUNK,
          mask: CollisionMasks.JUNK,
        },
      });

      // Make junk items slightly random sized between 0.7 and 0.9
      physicsBody.setScale(Phaser.Math.FloatBetween(0.7, 0.9));

      // Set the unique ID as the label through body.parts[0] which is the main body part
      if (physicsBody.body && (physicsBody.body as any).parts && (physicsBody.body as any).parts.length > 0) {
        (physicsBody.body as any).parts[0].label = uniqueId;
      } else {
        // If no parts array exists, set the label directly on the body
        if (physicsBody.body) {
          (physicsBody.body as any).label = uniqueId;
        }
      }

      // Store the uniqueId as a property on the physics body for easy access
      (physicsBody as any).uniqueJunkId = uniqueId;

      // Apply initial velocity with slight randomization to further prevent clumping
      const velocityVariance = 0.5;
      physicsBody.setVelocity(
        velocityX + Phaser.Math.FloatBetween(-velocityVariance, velocityVariance),
        velocityY + Phaser.Math.FloatBetween(-velocityVariance, velocityVariance)
      );
      physicsBody.setAngularVelocity(Phaser.Math.FloatBetween(-0.05, 0.05));

      physicsBody.setDepth(DepthLayers.JunkPile);

      // Return the complete junk pile item with the unique ID
      return {
        junkPiece,
        body: physicsBody,
        uniqueId,
      };
    } else {
      throw new Error(`No physics shape found for junk piece: ${junkPiece.id}`);
    }
  }

  /**
   * Generates a new junk portion based on current game state and adds it to junkPile
   */
  public generateJunkPortion(): void {
    // Get player progress store for upgrade values
    const playerProgress = usePlayerProgressStore.getState();

    // Get the current level for portion size
    const portionSizeLevel = playerProgress.getPipeUpgradeLevel(JunkPipeUpgradeType.PORTION_SIZE);

    // Get the portion size value from the config
    const portionSizeValue = JUNK_PIPE_UPGRADES[JunkPipeUpgradeType.PORTION_SIZE].levels[portionSizeLevel].value;

    // Get the fluff ratio value
    const fluffRatioLevel = playerProgress.getPipeUpgradeLevel(JunkPipeUpgradeType.FLUFF_RATIO);
    const fluffRatio = JUNK_PIPE_UPGRADES[JunkPipeUpgradeType.FLUFF_RATIO].levels[fluffRatioLevel].value;

    // Get the next portion percentage value
    const nextPortionPercentLevel = playerProgress.getPipeUpgradeLevel(JunkPipeUpgradeType.NEXT_PORTION_PERCENT);
    const nextPortionPercent = JUNK_PIPE_UPGRADES[JunkPipeUpgradeType.NEXT_PORTION_PERCENT].levels[nextPortionPercentLevel].value;

    // Generate the junk portion with the player's current upgrade values
    const newJunkPortion = getJunkPortion(lootConfig, this.portionNumber, portionSizeValue, fluffRatio, nextPortionPercent);

    // Emit the junk-received event with the count of junk pieces
    EventBus.emit("junk-received", newJunkPortion.length);

    // Clear any existing spawn timers
    this.spawnTimers.forEach((timer) => timer.destroy());
    this.spawnTimers = [];

    // Spawn junk items rapidly like a fire hose instead of one by one
    newJunkPortion.forEach((junkPiece, index) => {
      // Use a very small base delay with minimal delay between items
      const baseDelay = 20;
      // Group items into small bursts (every 3-5 items) by adding occasional larger gaps
      const burstDelay = index % Phaser.Math.Between(3, 5) === 0 ? Phaser.Math.Between(30, 50) : 0;
      // Calculate total delay - minimal base delay + tiny index multiplier + occasional burst delay
      const delay = baseDelay + index * 5 + burstDelay;

      // Create a timer for spawning this item
      const timer = this.scene.time.addEvent({
        delay: delay,
        callback: () => {
          const junkItem = this.spawnJunkItem(junkPiece);
          this.junkPile.push(junkItem);
        },
        callbackScope: this,
      });

      // Store the timer reference so we can clear it if needed
      this.spawnTimers.push(timer);
    });

    console.log(`Generated junk portion #${this.portionNumber}:`, newJunkPortion);
    console.log(`Total junk pile size will be: ${this.junkPile.length + newJunkPortion.length}`);
  }

  /**
   * Increments the portion number and generates a new junk portion
   */
  public generateNextPortion(): void {
    this.portionNumber++;
    this.generateJunkPortion();
  }

  /**
   * Gets the current junk pile
   * @returns The current junk pile items
   */
  public getJunkPile(): JunkPileItem[] {
    return this.junkPile;
  }
}
