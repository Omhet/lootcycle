import { Scene } from "phaser";
import { TemperatureRange } from "../../../../lib/craft/craftModel";
import { DepthLayers } from "../../Game";

/**
 * Handles the crafting process, temperature management and related UI/effects
 */
export class CauldronCraftingManager {
  private scene: Scene;
  private cauldronSprite: Phaser.Physics.Matter.Sprite;

  // Temperature tracking properties
  private currentTemperature: number = 0;
  private defaultMaxTemperature: number = 200;
  private temperatureIncreaseRate: number = 0.5;
  private isCrafting: boolean = false;
  private temperatureRange: TemperatureRange | null = null;

  // Temperature display
  private temperatureBar: Phaser.GameObjects.Graphics;
  private temperatureText: Phaser.GameObjects.Text;

  // Smoke particles
  private smokeParticles: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

  constructor(scene: Scene, cauldronSprite: Phaser.Physics.Matter.Sprite) {
    this.scene = scene;
    this.cauldronSprite = cauldronSprite;
    this.createTemperatureBar();
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
    // Position above the cauldron
    const emitterX = this.cauldronSprite.x + 10;
    const emitterY = this.cauldronSprite.y - 50;

    // Create smoke emitter using the Phaser 3.87.0 API
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

    this.smokeParticles.setDepth(DepthLayers.Foreground + 1);
  }

  /**
   * Starts emitting smoke particles from the cauldron
   */
  private startSmokeEmission(): void {
    if (this.smokeParticles) {
      this.smokeParticles.start();
      return;
    }
    this.setupSmokeParticles();
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
   * Starts the crafting process, increasing temperature over time
   */
  public startCrafting(tempRange: TemperatureRange | null = null): void {
    if (this.isCrafting) return;

    this.isCrafting = true;
    this.temperatureRange = tempRange;

    // Reset temperature to starting point
    this.currentTemperature = 0;

    // Start update loop
    this.scene.events.on("update", this.updateTemperature, this);
  }

  /**
   * Stops the crafting process
   */
  public stopCrafting(): number {
    if (!this.isCrafting) return this.currentTemperature;

    this.isCrafting = false;

    // Stop update loop
    this.scene.events.off("update", this.updateTemperature, this);

    // Stop smoke
    this.stopSmokeEmission();

    return this.currentTemperature;
  }

  /**
   * Updates temperature during crafting
   */
  private updateTemperature = (): void => {
    if (!this.isCrafting) return;

    // Increase temperature
    this.currentTemperature += this.temperatureIncreaseRate;

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
  };

  /**
   * Returns whether crafting is currently in progress
   */
  public isCraftingInProgress(): boolean {
    return this.isCrafting;
  }

  /**
   * Gets the current temperature
   */
  public getCurrentTemperature(): number {
    return this.currentTemperature;
  }

  /**
   * Gets the current temperature range for crafting
   */
  public getTemperatureRange(): TemperatureRange | null {
    return this.temperatureRange;
  }

  /**
   * Cleanup resources when destroying this object
   */
  public destroy(): void {
    // Remove update listener
    this.scene.events.off("update", this.updateTemperature, this);

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
  }
}
