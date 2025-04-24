import { Scene } from "phaser";
import { CollisionCategories, CollisionMasks } from "../../../physics/CollisionCategories";
import { DepthLayers } from "../../Game";
import { JunkPileItem, JunkPileManager } from "../JunkPileManager";

/**
 * Handles detection and tracking of junk pieces in the intake area
 */
export class IntakeJunkDetector {
  private scene: Scene;
  private intakeSprite: Phaser.Physics.Matter.Sprite;
  private thresholdY: number;
  private thresholdLine: Phaser.GameObjects.Graphics;

  // Sensor for detecting junk in the intake area
  private intakeSensor: MatterJS.BodyType;

  // Track all junk pieces inside the intake
  private junkPiecesInside: JunkPileItem[] = [];

  // Debug text to display count
  private debugText: Phaser.GameObjects.Text;

  constructor(scene: Scene, intakeSprite: Phaser.Physics.Matter.Sprite) {
    this.scene = scene;
    this.intakeSprite = intakeSprite;

    // Calculate threshold line position (around 40% from the top of the intake)
    const frame = this.scene.textures.get("intake").get();
    this.thresholdY = this.intakeSprite.y - frame.height * 0.1;

    this.createSensor();
    this.createThresholdLine();
    this.createDebugText();

    // Setup collision detection
    this.scene.matter.world.on("collisionstart", this.handleCollisionStart, this);
    this.scene.matter.world.on("collisionend", this.handleCollisionEnd, this);
  }

  /**
   * Creates a debug text display to show the count of junk in intake
   */
  private createDebugText(): void {
    this.debugText = this.scene.add.text(this.intakeSprite.x - 80, this.thresholdY - 50, "Junk in intake: 0", {
      fontSize: "16px",
      color: "#FFFFFF",
      strokeThickness: 2,
      stroke: "#000000",
      backgroundColor: "#00000080",
      padding: { x: 5, y: 3 },
    });
    this.debugText.setDepth(DepthLayers.UI);
    // this.debugText.setVisible(false); // Set to true if need to debug

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
    const count = this.getJunkPiecesCount();
    this.debugText.setText(`Junk in intake: ${count}`);

    // Color the text based on whether there's enough junk in the intake
    const hasEnough = this.hasEnoughJunk();
    this.debugText.setColor(hasEnough ? "#00FF00" : "#FFFFFF");
  }

  /**
   * Creates a visual threshold line in the intake
   */
  private createThresholdLine(): void {
    this.thresholdLine = this.scene.add.graphics();
    this.thresholdLine.setDepth(DepthLayers.Foreground - 1); // Make sure it's below the intake
    this.drawThresholdLine(0x454359);

    // Update the line periodically
    this.scene.time.addEvent({
      delay: 100, // Update 10 times per second
      callback: this.updateThresholdLineColor,
      callbackScope: this,
      loop: true,
    });
  }

  /**
   * Draws the threshold line with given color
   */
  private drawThresholdLine(color: number, thickness: number = 5): void {
    const frame = this.scene.textures.get("intake").get();
    const xPos = this.intakeSprite.x;
    const width = frame.width * 0.75;

    this.thresholdLine.clear();
    this.thresholdLine.lineStyle(thickness, color, 1);

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
   * Updates the threshold line color based on whether there are enough junk pieces in the intake
   */
  public updateThresholdLineColor(): void {
    const lineColor = this.hasEnoughJunk() ? 0x00ff00 : 0x454359;
    this.drawThresholdLine(lineColor);
  }

  /**
   * Creates a sensor for detecting all junk in the intake area
   */
  private createSensor(): void {
    const frame = this.scene.textures.get("intake").get();
    const xPos = this.intakeSprite.x;
    const yPos = this.intakeSprite.y;
    const sensorWidth = frame.width * 0.75;
    const sensorHeight = frame.height * 0.75; // Cover most of the intake

    this.intakeSensor = this.scene.matter.add.rectangle(xPos, yPos, sensorWidth, sensorHeight, {
      isSensor: true,
      isStatic: true,
      label: "intakeSensor",
      collisionFilter: {
        category: CollisionCategories.ENVIRONMENT,
        mask: CollisionMasks.JUNK,
      },
    });
  }

  /**
   * Handles collision start events for the intake sensor
   */
  private handleCollisionStart(event: Phaser.Physics.Matter.Events.CollisionStartEvent): void {
    const pairs = event.pairs;

    for (let i = 0; i < pairs.length; i++) {
      const bodyA = pairs[i].bodyA;
      const bodyB = pairs[i].bodyB;

      // Check if one of the bodies is our sensor
      const isSensorA = bodyA.label === "intakeSensor";
      const isSensorB = bodyB.label === "intakeSensor";

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
   * Handles collision end events for the intake sensor
   */
  private handleCollisionEnd(event: Phaser.Physics.Matter.Events.CollisionEndEvent): void {
    const pairs = event.pairs;

    for (let i = 0; i < pairs.length; i++) {
      const bodyA = pairs[i].bodyA;
      const bodyB = pairs[i].bodyB;

      // Check if one of the bodies is our sensor
      const isSensorA = bodyA.label === "intakeSensor";
      const isSensorB = bodyB.label === "intakeSensor";

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
   * Checks if a junk piece is already registered inside the intake
   */
  private isJunkAlreadyInside(junkItem: JunkPileItem): boolean {
    return this.junkPiecesInside.some((item) => item.uniqueId === junkItem.uniqueId);
  }

  /**
   * Checks if there are enough junk pieces in the intake for processing
   */
  public hasEnoughJunk(): boolean {
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

    // Check each junk piece in the intake
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
   * Returns the count of junk pieces inside the intake
   */
  public getJunkPiecesCount(): number {
    return this.junkPiecesInside.length;
  }

  /**
   * Returns all junk pieces currently inside the intake
   */
  public getJunkPiecesInside(): JunkPileItem[] {
    return [...this.junkPiecesInside];
  }

  /**
   * Clears all junk pieces from the intake tracking (doesn't physically remove them)
   */
  public clearJunkPieces(): void {
    this.junkPiecesInside = [];
    // Update threshold line color after clearing
    this.updateThresholdLineColor();
  }

  /**
   * Destroys junk pieces physically after processing
   */
  public destroyJunkPieces(): void {
    // Find and destroy all junk piece game objects in the intake
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

    // Clear tracking array
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
    if (this.intakeSensor) {
      this.scene.matter.world?.remove(this.intakeSensor);
    }

    // Clear references
    this.junkPiecesInside = [];
  }
}
