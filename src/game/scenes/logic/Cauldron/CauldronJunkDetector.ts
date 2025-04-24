import { Scene } from "phaser";
import { CollisionCategories, CollisionMasks } from "../../../physics/CollisionCategories";
import { DepthLayers } from "../../Game";
import { JunkPileItem, JunkPileManager } from "../JunkPileManager";

/**
 * Handles detection and tracking of junk pieces in the cauldron
 */
export class CauldronJunkDetector {
  private scene: Scene;
  private cauldronSprite: Phaser.Physics.Matter.Sprite;
  private thresholdY: number;
  private thresholdLine: Phaser.GameObjects.Graphics;

  // Single sensor for detecting junk in the cauldron
  private cauldronSensor: MatterJS.BodyType;

  // Track all junk pieces inside the cauldron
  private junkPiecesInside: JunkPileItem[] = [];

  // Debug text to display count
  private debugText: Phaser.GameObjects.Text;

  constructor(scene: Scene, cauldronSprite: Phaser.Physics.Matter.Sprite, thresholdY: number) {
    this.scene = scene;
    this.cauldronSprite = cauldronSprite;
    this.thresholdY = thresholdY;

    this.createSensor();
    this.createThresholdLine();
    this.createDebugText();

    // Setup collision detection
    this.scene.matter.world.on("collisionstart", this.handleCollisionStart, this);
    this.scene.matter.world.on("collisionend", this.handleCollisionEnd, this);
  }

  /**
   * Creates a debug text display to show the count of junk above threshold
   */
  private createDebugText(): void {
    this.debugText = this.scene.add.text(this.cauldronSprite.x - 80, this.thresholdY - 50, "Junk above threshold: 0", {
      fontSize: "16px",
      color: "#FFFFFF",
      strokeThickness: 2,
      stroke: "#000000",
      backgroundColor: "#00000080",
      padding: { x: 5, y: 3 },
    });
    this.debugText.setDepth(DepthLayers.UI);

    // Update the debug text periodically
    this.scene.time.addEvent({
      delay: 100, // Update 10 times per second
      callback: this.updateDebugText,
      callbackScope: this,
      loop: true,
    });
  }

  /**
   * Updates the debug text with current junk count
   */
  private updateDebugText(): void {
    const count = this.getJunkPiecesAboveThresholdCount();
    this.debugText.setText(`Junk above threshold: ${count}`);

    // Color the text based on whether there's enough junk for crafting
    const hasEnough = this.hasEnoughJunkForCrafting();
    this.debugText.setColor(hasEnough ? "#00FF00" : "#FFFFFF");
  }

  /**
   * Creates a sensor for detecting all junk in the cauldron
   */
  private createSensor(): void {
    const frame = this.scene.textures.get("cauldron").get();
    const xPos = this.cauldronSprite.x;
    const sensorWidth = frame.width * 0.75;
    const sensorHeight = frame.height * 0.8; // Cover most of the cauldron
    const sensorY = this.cauldronSprite.y;

    this.cauldronSensor = this.scene.matter.add.rectangle(xPos + 10, sensorY, sensorWidth, sensorHeight, {
      isSensor: true,
      isStatic: true,
      label: "cauldronSensor",
      collisionFilter: {
        category: CollisionCategories.ENVIRONMENT,
        mask: CollisionMasks.JUNK,
      },
    });
  }

  /**
   * Creates a visual threshold line in the cauldron
   */
  private createThresholdLine(): void {
    this.thresholdLine = this.scene.add.graphics();
    this.thresholdLine.setDepth(DepthLayers.Foreground - 1); // Make sure it's below the cauldron
    this.drawThresholdLine(0x454359);
  }

  /**
   * Draws the threshold line with given color
   */
  private drawThresholdLine(color: number, thickness: number = 5): void {
    const frame = this.scene.textures.get("cauldron").get();
    const xPos = this.cauldronSprite.x + 10;
    const width = frame.width * 0.75;

    this.thresholdLine.clear();
    this.thresholdLine.lineStyle(thickness, color, 0.8);

    // Create a dashed line by drawing multiple short line segments
    const dashSize = 10;
    const gapSize = 5;
    const segments = Math.floor(width / (dashSize + gapSize));
    const startX = xPos - width / 2;

    this.thresholdLine.beginPath();
    for (let i = 0; i < segments; i++) {
      const segmentStartX = startX + i * (dashSize + gapSize);
      const segmentEndX = segmentStartX + dashSize;

      this.thresholdLine.moveTo(segmentStartX, this.thresholdY);
      this.thresholdLine.lineTo(segmentEndX, this.thresholdY);
    }
    this.thresholdLine.strokePath();
  }

  /**
   * Updates the threshold line color based on whether there are enough junk pieces above it
   */
  public updateThresholdLineColor(): void {
    // Color changes to BDB9DD when there are enough junk pieces
    const lineColor = this.hasEnoughJunkForCrafting() ? 0xbdb9dd : 0x454359;
    this.drawThresholdLine(lineColor);
  }

  /**
   * Handles collision start events for the cauldron sensors
   */
  private handleCollisionStart(event: Phaser.Physics.Matter.Events.CollisionStartEvent): void {
    const pairs = event.pairs;

    for (let i = 0; i < pairs.length; i++) {
      const bodyA = pairs[i].bodyA;
      const bodyB = pairs[i].bodyB;

      // Check if one of the bodies is one of our sensors
      const isSensorA = bodyA.label === "cauldronSensor";
      const isSensorB = bodyB.label === "cauldronSensor";

      if (isSensorA || isSensorB) {
        // Get sensor and junk body
        const junkBody = isSensorA ? bodyB : bodyA;

        // Find the junk item in the scene
        const junkItems = this.scene.children.list.filter(
          (obj) => obj instanceof Phaser.Physics.Matter.Sprite || obj instanceof Phaser.Physics.Matter.Image
        ) as Array<Phaser.Physics.Matter.Sprite | Phaser.Physics.Matter.Image>;

        const matchingJunkItem = junkItems.find((item) => item.body === junkBody.parent);

        if (matchingJunkItem) {
          // Get the unique ID from the body
          const uniqueJunkId = junkBody.label || junkBody.parent?.label;

          // Find the corresponding JunkPileItem
          const junkPile = (this.scene.registry.get("junkPileManager") as JunkPileManager)?.getJunkPile() || [];
          const junkPileItem = junkPile.find((item) => item.uniqueId === uniqueJunkId);

          if (junkPileItem) {
            // Add to overall junk inside if not already there
            if (!this.isJunkAlreadyInside(junkPileItem)) {
              this.junkPiecesInside.push(junkPileItem);
            }

            // Update threshold line color
            this.updateThresholdLineColor();
          }
        }
      }
    }
  }

  /**
   * Handles collision end events for the cauldron sensors
   */
  private handleCollisionEnd(event: Phaser.Physics.Matter.Events.CollisionEndEvent): void {
    const pairs = event.pairs;

    for (let i = 0; i < pairs.length; i++) {
      const bodyA = pairs[i].bodyA;
      const bodyB = pairs[i].bodyB;

      // Check if one of the bodies is one of our sensors
      const isSensorA = bodyA.label === "cauldronSensor";
      const isSensorB = bodyB.label === "cauldronSensor";

      if (isSensorA || isSensorB) {
        // Get sensor and junk body
        const junkBody = isSensorA ? bodyB : bodyA;

        // Get the unique ID from the body's label
        const uniqueJunkId = junkBody.label || junkBody.parent?.label;

        if (uniqueJunkId) {
          // Remove from overall list
          const insideIndex = this.junkPiecesInside.findIndex((item) => item.uniqueId === uniqueJunkId);
          if (insideIndex !== -1) {
            this.junkPiecesInside.splice(insideIndex, 1);
          }

          // Update threshold line color
          this.updateThresholdLineColor();
        }
      }
    }
  }

  /**
   * Checks if a junk piece is already registered inside the cauldron
   */
  private isJunkAlreadyInside(junkItem: JunkPileItem): boolean {
    return this.junkPiecesInside.some((item) => item.uniqueId === junkItem.uniqueId);
  }

  /**
   * Checks if enough junk has crossed the threshold line for crafting
   */
  public hasEnoughJunkForCrafting(): boolean {
    const MIN_JUNK_COUNT = 2;
    return this.getJunkPiecesAboveThresholdCount() >= MIN_JUNK_COUNT;
  }

  /**
   * Gets the count of junk pieces above the threshold line
   */
  public getJunkPiecesAboveThresholdCount(): number {
    let piecesAboveThresholdCount = 0;

    // Get all junk game objects in the scene
    const junkItems = this.scene.children.list.filter(
      (obj) => (obj instanceof Phaser.Physics.Matter.Sprite || obj instanceof Phaser.Physics.Matter.Image) && obj.active // Only consider active objects
    ) as Array<Phaser.Physics.Matter.Sprite | Phaser.Physics.Matter.Image>;

    // Check each junk piece in the cauldron
    for (const junkItem of this.junkPiecesInside) {
      const junkId = junkItem.uniqueId;

      // Find the matching game object
      const matchingJunkObject = junkItems.find((item) => {
        const itemBody = item.body as MatterJS.BodyType;
        return itemBody?.label === junkId || itemBody?.parent?.label === junkId;
      });

      // Check if the junk object exists and is above the threshold line
      if (matchingJunkObject && matchingJunkObject.body) {
        // Check if it's settled (low velocity) and above the threshold line
        const velocity = matchingJunkObject.body.velocity;
        const isSettled = Math.abs(velocity.x) < 0.5 && Math.abs(velocity.y) < 0.5;
        const isAboveThreshold = matchingJunkObject.y < this.thresholdY;

        if (isSettled && isAboveThreshold) {
          piecesAboveThresholdCount++;
        }
      }
    }

    return piecesAboveThresholdCount;
  }

  /**
   * Returns all junk pieces currently inside the cauldron
   */
  public getJunkPiecesInside(): JunkPileItem[] {
    return [...this.junkPiecesInside];
  }

  /**
   * Clears all junk pieces from the cauldron tracking (doesn't physically remove them)
   */
  public clearJunkPieces(): void {
    this.junkPiecesInside = [];
    // Update threshold line color after clearing
    this.updateThresholdLineColor();
  }

  /**
   * Destroys junk pieces physically after crafting
   */
  public destroyJunkPieces(): void {
    // Find and destroy all junk piece game objects in the cauldron
    this.junkPiecesInside.forEach((junkItem) => {
      const junkId = junkItem.uniqueId;

      // Find all game objects in the scene
      const junkObjects = this.scene.children.list.filter(
        (obj) => obj instanceof Phaser.Physics.Matter.Sprite || obj instanceof Phaser.Physics.Matter.Image
      ) as Array<Phaser.Physics.Matter.Sprite | Phaser.Physics.Matter.Image>;

      // Find the matching object
      const matchingObject = junkObjects.find((item) => {
        const itemBody = item.body as MatterJS.BodyType;
        return itemBody?.label === junkId || itemBody?.parent?.label === junkId;
      });

      // Destroy it if found
      if (matchingObject) {
        matchingObject.destroy();
      }
    });

    // Clear tracking arrays
    this.clearJunkPieces();
  }

  /**
   * Cleanup resources when destroying this object
   */
  public destroy(): void {
    // Remove collision listeners
    this.scene.matter.world?.off("collisionstart", this.handleCollisionStart, this);
    this.scene.matter.world?.off("collisionend", this.handleCollisionEnd, this);

    // Destroy the threshold line
    if (this.thresholdLine) {
      this.thresholdLine.destroy();
    }

    // Destroy debug text
    if (this.debugText) {
      this.debugText.destroy();
    }

    // Destroy the sensor
    if (this.cauldronSensor) {
      this.scene.matter.world?.remove(this.cauldronSensor);
    }

    // Clear references
    this.junkPiecesInside = [];
  }
}
