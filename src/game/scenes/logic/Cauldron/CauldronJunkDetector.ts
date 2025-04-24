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

  // Sensors for detecting junk in different areas
  private belowThresholdSensor: MatterJS.BodyType;
  private aboveThresholdSensor: MatterJS.BodyType;

  // Track junk pieces in different areas of the cauldron
  private junkPiecesBelowThreshold: JunkPileItem[] = [];
  private junkPiecesAboveThreshold: JunkPileItem[] = [];
  private junkPiecesInside: JunkPileItem[] = [];

  constructor(scene: Scene, cauldronSprite: Phaser.Physics.Matter.Sprite, thresholdY: number) {
    this.scene = scene;
    this.cauldronSprite = cauldronSprite;
    this.thresholdY = thresholdY;

    this.createSensors();
    this.createThresholdLine();

    // Setup collision detection for both sensors
    this.scene.matter.world.on("collisionstart", this.handleCollisionStart, this);
    this.scene.matter.world.on("collisionend", this.handleCollisionEnd, this);
  }

  /**
   * Creates sensors for detecting junk in different areas of the cauldron
   */
  private createSensors(): void {
    const frame = this.scene.textures.get("cauldron").get();
    const xPos = this.cauldronSprite.x;
    const sensorWidth = frame.width * 0.75;

    // 1. Below threshold sensor - from bottom of cauldron to threshold line
    const belowSensorHeight = frame.height * 0.6;
    const belowSensorY = this.thresholdY + belowSensorHeight / 2;

    this.belowThresholdSensor = this.scene.matter.add.rectangle(xPos + 10, belowSensorY, sensorWidth, belowSensorHeight, {
      isSensor: true,
      isStatic: true,
      label: "belowThresholdSensor",
      collisionFilter: {
        category: CollisionCategories.ENVIRONMENT,
        mask: CollisionMasks.JUNK,
      },
    });

    // 2. Above threshold sensor - from threshold line to top of cauldron
    const aboveSensorHeight = frame.height * 0.4;
    const aboveSensorY = this.thresholdY - aboveSensorHeight / 2;

    this.aboveThresholdSensor = this.scene.matter.add.rectangle(xPos + 10, aboveSensorY, sensorWidth, aboveSensorHeight, {
      isSensor: true,
      isStatic: true,
      label: "aboveThresholdSensor",
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
      const isSensorA = bodyA.label === "belowThresholdSensor" || bodyA.label === "aboveThresholdSensor";
      const isSensorB = bodyB.label === "belowThresholdSensor" || bodyB.label === "aboveThresholdSensor";

      if (isSensorA || isSensorB) {
        // Get sensor and junk body
        const sensorBody = isSensorA ? bodyA : bodyB;
        const junkBody = isSensorA ? bodyB : bodyA;

        // Determine which sensor was triggered
        const isAboveThreshold = sensorBody.label === "aboveThresholdSensor";

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
            // Add to the appropriate list based on which sensor was triggered
            if (isAboveThreshold) {
              if (!this.isJunkAlreadyInArea(junkPileItem, this.junkPiecesAboveThreshold)) {
                this.junkPiecesAboveThreshold.push(junkPileItem);
              }
            } else {
              if (!this.isJunkAlreadyInArea(junkPileItem, this.junkPiecesBelowThreshold)) {
                this.junkPiecesBelowThreshold.push(junkPileItem);
              }
            }

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
      const isSensorA = bodyA.label === "belowThresholdSensor" || bodyA.label === "aboveThresholdSensor";
      const isSensorB = bodyB.label === "belowThresholdSensor" || bodyB.label === "aboveThresholdSensor";

      if (isSensorA || isSensorB) {
        // Get sensor and junk body
        const sensorBody = isSensorA ? bodyA : bodyB;
        const junkBody = isSensorA ? bodyB : bodyA;

        // Determine which sensor was triggered
        const isAboveThreshold = sensorBody.label === "aboveThresholdSensor";

        // Get the unique ID from the body's label
        const uniqueJunkId = junkBody.label || junkBody.parent?.label;

        if (uniqueJunkId) {
          // Remove from the appropriate list based on which sensor was triggered
          if (isAboveThreshold) {
            const aboveIndex = this.junkPiecesAboveThreshold.findIndex((item) => item.uniqueId === uniqueJunkId);
            if (aboveIndex !== -1) {
              this.junkPiecesAboveThreshold.splice(aboveIndex, 1);
            }
          } else {
            const belowIndex = this.junkPiecesBelowThreshold.findIndex((item) => item.uniqueId === uniqueJunkId);
            if (belowIndex !== -1) {
              this.junkPiecesBelowThreshold.splice(belowIndex, 1);
            }
          }

          // Check if junk is still in any zone before removing from overall list
          const isStillInAbove = this.junkPiecesAboveThreshold.some((item) => item.uniqueId === uniqueJunkId);
          const isStillInBelow = this.junkPiecesBelowThreshold.some((item) => item.uniqueId === uniqueJunkId);

          if (!isStillInAbove && !isStillInBelow) {
            // If not in any zone, remove from overall list
            const insideIndex = this.junkPiecesInside.findIndex((item) => item.uniqueId === uniqueJunkId);
            if (insideIndex !== -1) {
              this.junkPiecesInside.splice(insideIndex, 1);
            }
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
   * Checks if a junk piece is already registered in a specific area
   */
  private isJunkAlreadyInArea(junkItem: JunkPileItem, areaList: JunkPileItem[]): boolean {
    return areaList.some((item) => item.uniqueId === junkItem.uniqueId);
  }

  /**
   * Checks if enough junk has crossed the threshold line for crafting
   */
  public hasEnoughJunkForCrafting(): boolean {
    return this.getJunkPiecesAboveThresholdCount() >= 2;
  }

  /**
   * Gets the count of junk pieces above the threshold line
   */
  public getJunkPiecesAboveThresholdCount(): number {
    let piecesAboveThresholdCount = 0;

    for (const junkItem of this.junkPiecesBelowThreshold) {
      const junkId = junkItem.uniqueId;

      // Find the matching game object
      const junkItems = this.scene.children.list.filter(
        (obj) => obj instanceof Phaser.Physics.Matter.Sprite || obj instanceof Phaser.Physics.Matter.Image
      ) as Array<Phaser.Physics.Matter.Sprite | Phaser.Physics.Matter.Image>;

      // @ts-ignore
      const matchingJunkObject = junkItems.find((item) => item.body?.label === junkId || item.body?.parent?.label === junkId);

      if (matchingJunkObject && matchingJunkObject.y < this.thresholdY) {
        piecesAboveThresholdCount++;
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
    this.junkPiecesAboveThreshold = [];
    this.junkPiecesBelowThreshold = [];
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

    // Destroy the sensors
    if (this.belowThresholdSensor) {
      this.scene.matter.world?.remove(this.belowThresholdSensor);
    }

    if (this.aboveThresholdSensor) {
      this.scene.matter.world?.remove(this.aboveThresholdSensor);
    }

    // Clear references
    this.junkPiecesInside = [];
    this.junkPiecesAboveThreshold = [];
    this.junkPiecesBelowThreshold = [];
  }
}
