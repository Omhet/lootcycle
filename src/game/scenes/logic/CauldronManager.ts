import { Scene } from "phaser";
import { TemperatureRange } from "../../../lib/craft/craftModel";
import { EventBus } from "../../EventBus";
import { CollisionCategories, CollisionMasks } from "../../physics/CollisionCategories";
import { DepthLayers } from "../Game";
import { JunkPileItem, JunkPileManager } from "./JunkPileManager";

export class CauldronManager {
  private scene: Scene;
  private cauldronSprite: Phaser.Physics.Matter.Sprite;

  // Replace single sensor with two separate sensors
  private belowThresholdSensor: MatterJS.BodyType;
  private aboveThresholdSensor: MatterJS.BodyType;

  // Track junk pieces in different areas of the cauldron
  private junkPiecesBelowThreshold: JunkPileItem[] = [];
  private junkPiecesAboveThreshold: JunkPileItem[] = [];

  // Store all junk pieces inside the cauldron (combination of both areas)
  private junkPiecesInside: JunkPileItem[] = [];

  private thresholdLine: Phaser.GameObjects.Graphics;
  private thresholdY: number;

  // Temperature tracking properties
  private currentTemperature: number = 0;
  private defaultMaxTemperature: number = 200; // Default max for UI scaling when no recipe selected
  private temperatureIncreaseRate: number = 0.5; // Default temperature increase rate
  private isCooking: boolean = false;
  private temperatureRange: TemperatureRange | null = null;

  // Temperature display
  private temperatureBar: Phaser.GameObjects.Graphics;
  private temperatureText: Phaser.GameObjects.Text;

  // Smoke particles - updated to match Phaser 3.87.0 API
  private smokeParticles: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
    this.createCauldron();
    this.createTemperatureBar();
    this.setupSmokeParticles();
  }

  /**
   * Creates the cauldron sprite with physics using the PhysicsEditor JSON data
   */
  private createCauldron(): void {
    const cauldronPhysics = this.scene.cache.json.get("cauldronPhysics");
    const cauldronTexture = this.scene.textures.get("cauldron");
    const frame = cauldronTexture.get();

    const xPos = this.scene.cameras.main.width / 2 - 180;
    const yPos = this.scene.cameras.main.height - frame.height / 2 - 250;

    this.cauldronSprite = this.scene.matter.add.sprite(xPos, yPos, "cauldron", undefined, {
      shape: cauldronPhysics.cauldron,
      collisionFilter: {
        category: CollisionCategories.ENVIRONMENT,
        mask: CollisionMasks.ENVIRONMENT,
      },
    });

    this.cauldronSprite.setStatic(true);
    this.cauldronSprite.setName("cauldron");
    this.cauldronSprite.setDepth(DepthLayers.Ground);

    // Calculate threshold line position (around 60% from the bottom of the cauldron)
    this.thresholdY = yPos + frame.height * 0.2;

    // Create threshold line graphic
    this.createThresholdLine(xPos + 10, this.thresholdY, frame.width * 0.7);

    // Create two separate sensor areas inside the cauldron
    const sensorWidth = frame.width * 0.75;

    // 1. Below threshold sensor - from bottom of cauldron to threshold line
    const belowSensorHeight = frame.height * 0.6; // Adjust as needed
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
    const aboveSensorHeight = frame.height * 0.4; // Adjust as needed
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

    // Setup collision detection for both sensors
    this.scene.matter.world.on("collisionstart", this.handleCollisionStart, this);
    this.scene.matter.world.on("collisionend", this.handleCollisionEnd, this);

    // Update threshold line color initially
    this.updateThresholdLineColor();
  }

  /**
   * Creates a visual threshold line in the cauldron
   */
  private createThresholdLine(x: number, y: number, width: number): void {
    this.thresholdLine = this.scene.add.graphics();
    this.thresholdLine.setDepth(DepthLayers.Ground - 1); // Make sure it's below the cauldron
    this.drawDashedLine(this.thresholdLine, x, y, width, 0x454359, 5);
  }

  /**
   * Creates a dashed line at the specified position with given color
   */
  private drawDashedLine(graphics: Phaser.GameObjects.Graphics, x: number, y: number, width: number, color: number, thickness: number = 5): void {
    graphics.clear();
    graphics.lineStyle(thickness, color, 0.8);

    // Create a dashed line by drawing multiple short line segments
    const dashSize = 10;
    const gapSize = 5;
    const segments = Math.floor(width / (dashSize + gapSize));

    const startX = x - width / 2;

    graphics.beginPath();

    for (let i = 0; i < segments; i++) {
      const segmentStartX = startX + i * (dashSize + gapSize);
      const segmentEndX = segmentStartX + dashSize;

      graphics.moveTo(segmentStartX, y);
      graphics.lineTo(segmentEndX, y);
    }

    graphics.strokePath();
  }

  /**
   * Creates a temperature progress bar for visual feedback
   */
  private createTemperatureBar(): void {
    // Create a temperature bar at the bottom of the screen
    this.temperatureBar = this.scene.add.graphics();
    this.temperatureBar.setDepth(DepthLayers.UI);

    // Add temperature text display
    this.temperatureText = this.scene.add.text(20, this.scene.cameras.main.height - 50, "Temperature: 20°C", {
      fontFamily: "Arial",
      fontSize: "16px",
      color: "#ffffff",
    });
    this.temperatureText.setDepth(DepthLayers.UI);

    // Update the temperature bar initially
    this.updateTemperatureBar();
  }

  /**
   * Sets up the smoke particle system
   */
  private setupSmokeParticles(): void {
    // We'll create the emitter when needed, just prepare the position data
  }

  /**
   * Starts emitting smoke particles from the cauldron
   */
  private startSmokeEmission(): void {
    if (this.smokeParticles) {
      this.smokeParticles.start();
      return;
    }

    // Position above the cauldron
    const emitterX = this.cauldronSprite.x + 10;
    const emitterY = this.cauldronSprite.y - 50;

    // Create smoke emitter using the new Phaser 3.87.0 API
    this.smokeParticles = this.scene.add.particles(emitterX, emitterY, "smoke", {
      frame: ["smoke_1.png", "smoke_2.png", "smoke_3.png"],
      lifespan: { min: 2000, max: 3000 },
      speed: { min: 20, max: 40 },
      scale: { start: 0.3, end: 0.6 },
      quantity: 1,
      frequency: 500, // Emit a particle every 500ms
      alpha: { start: 0.5, end: 0 },
      angle: { min: 250, max: 290 },
      rotate: { min: -10, max: 10 },
      tint: 0xdddddd,
    });

    this.smokeParticles.setDepth(DepthLayers.Ground + 1);
  }

  /**
   * Stops emitting smoke particles
   */
  private stopSmokeEmission(): void {
    if (this.smokeParticles) {
      this.smokeParticles.stop();
    }
  }

  /**
   * Updates the temperature progress bar display
   */
  private updateTemperatureBar(): void {
    const barWidth = 200;
    const barHeight = 20;
    const x = 20;
    const y = this.scene.cameras.main.height - 30;

    this.temperatureBar.clear();

    // Background bar
    this.temperatureBar.fillStyle(0x333333);
    this.temperatureBar.fillRect(x, y, barWidth, barHeight);

    // Determine the max temperature to use for scaling the UI
    const maxTemp = this.temperatureRange ? Math.max(this.temperatureRange.max, this.defaultMaxTemperature) : this.defaultMaxTemperature;

    // Temperature fill
    const percentage = this.currentTemperature / maxTemp;
    const fillWidth = barWidth * percentage;

    // Choose color based on temperature range (if set)
    let fillColor = 0x3498db; // Default blue

    if (this.temperatureRange) {
      // Calculate if current temperature is in the ideal range
      if (this.currentTemperature >= this.temperatureRange.min && this.currentTemperature <= this.temperatureRange.max) {
        fillColor = 0x2ecc71; // Green for good range
      } else if (this.currentTemperature < this.temperatureRange.min) {
        fillColor = 0x3498db; // Blue for too cold
      } else {
        fillColor = 0xe74c3c; // Red for too hot
      }

      // Draw range indicators on the bar
      const minX = x + barWidth * (this.temperatureRange.min / maxTemp);
      const maxX = x + barWidth * (this.temperatureRange.max / maxTemp);

      // Draw range markers
      this.temperatureBar.lineStyle(2, 0xf1c40f); // Yellow line
      this.temperatureBar.beginPath();
      this.temperatureBar.moveTo(minX, y - 5);
      this.temperatureBar.lineTo(minX, y + barHeight + 5);
      this.temperatureBar.moveTo(maxX, y - 5);
      this.temperatureBar.lineTo(maxX, y + barHeight + 5);
      this.temperatureBar.strokePath();
    }

    // Draw current fill
    this.temperatureBar.fillStyle(fillColor);
    this.temperatureBar.fillRect(x, y, fillWidth, barHeight);

    // Update temperature text
    if (this.temperatureRange) {
      this.temperatureText.setText(
        `Temperature: ${Math.floor(this.currentTemperature)}°C (Range: ${Math.floor(this.temperatureRange.min)}-${Math.floor(this.temperatureRange.max)}°C)`
      );
    } else {
      this.temperatureText.setText(`Temperature: ${Math.floor(this.currentTemperature)}°C`);
    }
  }

  /**
   * Updates the threshold line color based on whether there are enough junk pieces above it
   */
  private updateThresholdLineColor(): void {
    // Color changes to BDB9DD when there are enough junk pieces
    const lineColor = this.hasEnoughJunkForCrafting() ? 0xbdb9dd : 0x454359;

    // Draw the new line with updated color
    const frame = this.scene.textures.get("cauldron").get();
    const xPos = this.cauldronSprite.x + 10;
    const width = frame.width * 0.75;

    this.drawDashedLine(this.thresholdLine, xPos, this.thresholdY, width, lineColor, 5);
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
                // console.log(`Junk piece ${junkPileItem.uniqueId} entered above threshold area. Total above: ${this.junkPiecesAboveThreshold.length}`);
              }
            } else {
              if (!this.isJunkAlreadyInArea(junkPileItem, this.junkPiecesBelowThreshold)) {
                this.junkPiecesBelowThreshold.push(junkPileItem);
                // console.log(`Junk piece ${junkPileItem.uniqueId} entered below threshold area. Total below: ${this.junkPiecesBelowThreshold.length}`);
              }
            }

            // Add to overall junk inside if not already there
            if (!this.isJunkAlreadyInside(junkPileItem)) {
              this.junkPiecesInside.push(junkPileItem);
              //   console.log(`Junk piece ${junkPileItem.uniqueId} entered cauldron. Total pieces inside: ${this.junkPiecesInside.length}`);
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
              // console.log(`Junk piece left above threshold area. Remaining above: ${this.junkPiecesAboveThreshold.length}`);
            }
          } else {
            const belowIndex = this.junkPiecesBelowThreshold.findIndex((item) => item.uniqueId === uniqueJunkId);
            if (belowIndex !== -1) {
              this.junkPiecesBelowThreshold.splice(belowIndex, 1);
              // console.log(`Junk piece left below threshold area. Remaining below: ${this.junkPiecesBelowThreshold.length}`);
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
              // console.log(`Junk piece left cauldron. Remaining pieces: ${this.junkPiecesInside.length}`);
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
   * Looks at junk pieces in junkPiecesBelowThreshold that have y position above thresholdY
   */
  public hasEnoughJunkForCrafting(): boolean {
    // Check each piece in the below threshold area to see if any are actually above the line
    let piecesAboveThresholdCount = 0;

    for (const junkItem of this.junkPiecesBelowThreshold) {
      const junkId = junkItem.uniqueId;

      // Find the matching game object
      const junkItems = this.scene.children.list.filter(
        (obj) => obj instanceof Phaser.Physics.Matter.Sprite || obj instanceof Phaser.Physics.Matter.Image
      ) as Array<Phaser.Physics.Matter.Sprite | Phaser.Physics.Matter.Image>;

      // @ts-ignore
      const matchingJunkObject = junkItems.find((item) => item.body?.label === junkId || item.body?.parent?.label === junkId);

      if (matchingJunkObject) {
        // Check if the junk piece is actually above the threshold line, despite being in the below sensor
        if (matchingJunkObject.y < this.thresholdY) {
          piecesAboveThresholdCount++;
        }
      }
    }

    return piecesAboveThresholdCount >= 2;
  }

  /**
   * Gets the count of junk pieces above the threshold line
   * Counts only pieces from junkPiecesBelowThreshold that have y position above thresholdY
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
   * Starts the cooking process, increasing temperature over time
   */
  public startCooking(tempRange: TemperatureRange | null = null): void {
    if (this.isCooking) return;

    this.isCooking = true;
    this.temperatureRange = tempRange;

    // Reset temperature to starting point
    this.currentTemperature = 20;

    // Start update loop
    this.scene.events.on("update", this.updateTemperature, this);

    // Emit event that cooking has started
    EventBus.emit("cooking-started");
  }

  /**
   * Stops the cooking process
   */
  public stopCooking(): number {
    if (!this.isCooking) return this.currentTemperature;

    this.isCooking = false;

    // Stop update loop
    this.scene.events.off("update", this.updateTemperature, this);

    // Stop smoke
    this.stopSmokeEmission();

    // Emit event that cooking has stopped with final temperature
    EventBus.emit("cooking-stopped", this.currentTemperature);

    return this.currentTemperature;
  }

  /**
   * Updates temperature during cooking
   */
  private updateTemperature(): void {
    if (!this.isCooking) return;

    // Increase temperature
    this.currentTemperature += this.temperatureIncreaseRate;

    // No need to clamp to a max temperature - allow it to rise indefinitely
    // This gives players control over timing and makes it possible to overheat

    // Update visual elements
    this.updateTemperatureBar();

    // Check if in ideal temperature range for smoke
    if (this.temperatureRange) {
      const midPoint = (this.temperatureRange.min + this.temperatureRange.max) / 2;
      const margin = (this.temperatureRange.max - this.temperatureRange.min) / 4;

      // Smoke appears when we're near the middle of the ideal range
      if (this.currentTemperature >= midPoint - margin && this.currentTemperature <= midPoint + margin) {
        this.startSmokeEmission();
      } else {
        this.stopSmokeEmission();
      }
    }
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
   * Returns whether cooking is currently in progress
   */
  public isCookingInProgress(): boolean {
    return this.isCooking;
  }

  /**
   * Gets the current temperature
   */
  public getCurrentTemperature(): number {
    return this.currentTemperature;
  }

  public getSprite(): Phaser.Physics.Matter.Sprite {
    return this.cauldronSprite;
  }

  public destroy(): void {
    // Remove collision and update listeners
    this.scene.matter.world?.off("collisionstart", this.handleCollisionStart, this);
    this.scene.matter.world?.off("collisionend", this.handleCollisionEnd, this);
    this.scene.events.off("update", this.updateTemperature, this);

    // Destroy the threshold line
    if (this.thresholdLine) {
      this.thresholdLine.destroy();
    }

    // Destroy temperature UI
    if (this.temperatureBar) {
      this.temperatureBar.destroy();
    }

    if (this.temperatureText) {
      this.temperatureText.destroy();
    }

    // Destroy smoke particles
    if (this.smokeParticles) {
      this.smokeParticles.destroy();
      this.smokeParticles = null;
    }

    // Destroy the sensors
    if (this.belowThresholdSensor) {
      this.scene.matter.world?.remove(this.belowThresholdSensor);
    }

    if (this.aboveThresholdSensor) {
      this.scene.matter.world?.remove(this.aboveThresholdSensor);
    }

    // Destroy the sprite
    if (this.cauldronSprite) {
      this.cauldronSprite.destroy();
    }

    // Clear references
    this.junkPiecesInside = [];
    this.junkPiecesAboveThreshold = [];
    this.junkPiecesBelowThreshold = [];
    // console.log("CauldronManager destroyed");
  }
}
