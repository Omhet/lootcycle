import { Scene } from "phaser";
import { TemperatureRange } from "../../../../lib/craft/craftModel";
import { DepthLayers } from "../../Game";

/**
 * Callback type for temperature exceeded events
 */
export type OnTemperatureExceededCallback = () => void;

/**
 * Handles the crafting process, temperature management and related UI/effects
 */
export class CauldronCraftingManager {
  private scene: Scene;
  private cauldronSprite: Phaser.Physics.Matter.Sprite;

  // Temperature tracking properties
  private currentTemperature: number = 0;
  private temperatureIncreaseRate: number = 0.5;
  private isCrafting: boolean = false;
  private temperatureRange: TemperatureRange | null = null;
  private onTemperatureExceeded: OnTemperatureExceededCallback | null = null;

  // Temperature display
  private temperatureBar: Phaser.GameObjects.Graphics;
  private temperatureText: Phaser.GameObjects.Text;

  // Smoke particles
  private smokeParticles: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  bubbleParticles: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Scene, cauldronSprite: Phaser.Physics.Matter.Sprite) {
    this.scene = scene;
    this.cauldronSprite = cauldronSprite;
    this.setupSmokeParticles();
    this.setupBubblesParticles();
  }

  /**
   * Sets up the smoke particle system
   */
  private setupSmokeParticles(): void {
    // Position above the cauldron
    const emitterX = this.cauldronSprite.x + 10;
    const emitterY = this.cauldronSprite.y - 130;

    this.smokeParticles = this.scene.add.particles(emitterX, emitterY, "smoke", {
      frame: ["smoke_1.png", "smoke_2.png", "smoke_3.png"],
      lifespan: { min: 2000, max: 4000 },
      speed: { min: 20, max: 40 },
      scale: { start: 0.3, end: 1.5 },
      quantity: 1,
      frequency: -1, // explode mode
      alpha: { start: 1, end: 0 },
      angle: { min: 250, max: 290 },
      rotate: { min: -10, max: 10 },
      tint: 0xffffff,
    });

    this.smokeParticles.setDepth(DepthLayers.Foreground + 1);
  }

  private setupBubblesParticles(): void {
    // Calculate positioning based on cauldron sprite
    const cauldronX = this.cauldronSprite.x;
    const cauldronY = this.cauldronSprite.y;
    const cauldronWidth = this.cauldronSprite.width * 0.6; // Use 60% of width for emission zone

    // Create an emission zone at the bottom of the cauldron
    const emissionZone = new Phaser.Geom.Rectangle(
      cauldronX - cauldronWidth / 2,
      cauldronY - 145, // Slightly below the visual top of liquid
      cauldronWidth,
      20 // Height of emission zone
    );

    this.bubbleParticles = this.scene.add.particles(0, 0, "bubbles", {
      frame: ["bubble_1.png", "bubble_2.png", "bubble_3.png"],
      lifespan: { min: 500, max: 1800 },
      speed: { min: 10, max: 30 },
      scale: { start: 0.2, end: 0.9 },
      quantity: 2,
      frequency: 300,
      alpha: { start: 0.8, end: 0 },
      gravityY: -50, // Negative gravity to make bubbles rise
      maxVelocityX: 50,
      maxVelocityY: 100,
      rotate: { min: -10, max: 10 },
      tint: 0xffffff,
      emitZone: {
        type: "random",
        source: emissionZone,
        quantity: 8,
        stepRate: 0,
      },
    });

    // Create a subtle gravity well above the cauldron to make bubbles gather
    this.bubbleParticles.createGravityWell({
      x: cauldronX,
      y: cauldronY - 220, // Well positioned above the cauldron
      power: 0.8, // Subtle pull
      epsilon: 100, // Radius of influence
      gravity: 50, // Strength of the well
    });

    this.bubbleParticles.setDepth(DepthLayers.Foreground + 1);
    this.bubbleParticles.emitting = false; // Start with no emission
  }

  private changeSmokeEmission(intensity: number = 1): void {
    const scale = Phaser.Math.Linear(0.3, 5, intensity);

    // Tint: Go from white (0xffffff) to dark gray/black (0x333333) as intensity increases
    // Using RGB interpolation for smooth transition
    const tintColor = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(0xffffff),
      Phaser.Display.Color.ValueToColor(0x333333),
      100,
      Math.floor(intensity * 100)
    );
    const finalTint = Phaser.Display.Color.GetColor(tintColor.r, tintColor.g, tintColor.b);

    // Apply all changes to the particle emitter
    this.smokeParticles!.setParticleScale(scale);
    this.smokeParticles!.setParticleTint(finalTint);
  }

  /**
   * Starts the crafting process, increasing temperature over time
   */
  public startCrafting(temperatureRange: TemperatureRange, onTemperatureExceeded?: OnTemperatureExceededCallback): void {
    if (this.isCrafting) return;

    this.isCrafting = true;
    this.temperatureRange = temperatureRange;
    this.onTemperatureExceeded = onTemperatureExceeded || null;

    // Reset temperature to starting point
    this.currentTemperature = 0;

    this.bubbleParticles.emitting = true;

    // Start update loop
    this.scene.events.on("update", this.updateTemperature, this);
  }

  /**
   * Stops the crafting process
   */
  public stopCrafting(): number {
    if (!this.isCrafting) return this.currentTemperature;

    this.isCrafting = false;

    const finalTemperature = this.currentTemperature;
    this.currentTemperature = 0; // Reset temperature for next crafting session

    this.bubbleParticles.emitting = false;

    // Stop update loop
    this.scene.events.off("update", this.updateTemperature, this);

    return finalTemperature;
  }

  /**
   * Updates temperature during crafting
   */
  private updateTemperature = (): void => {
    if (!this.isCrafting) return;

    // Increase temperature
    this.currentTemperature += this.temperatureIncreaseRate;

    // Check if in ideal temperature range for smoke
    if (this.temperatureRange) {
      if (this.currentTemperature > this.temperatureRange.max) {
        // Notify the parent manager that temperature exceeded maximum
        if (this.onTemperatureExceeded) {
          this.onTemperatureExceeded();
        }
        return;
      }

      if (this.currentTemperature >= this.temperatureRange.min) {
        const intensity = this.calculateSmokeIntensity();
        this.changeSmokeEmission(intensity);
        this.smokeParticles!.explode(1, Phaser.Math.Between(-50, 50));
      }
    }
  };

  /**
   * Calculates the smoke intensity based on how close the temperature is to the maximum range
   * Returns a value between 0 (min temperature) and 1 (max temperature)
   */
  private calculateSmokeIntensity(): number {
    if (!this.temperatureRange) return 0;

    // Calculate how far we are in the range from min to max
    const rangeSize = this.temperatureRange.max - this.temperatureRange.min;
    const progressInRange = this.currentTemperature - this.temperatureRange.min;

    // Normalize to get a value between 0 and 1
    const normalizedIntensity = Math.min(Math.max(progressInRange / rangeSize, 0), 1);

    return normalizedIntensity;
  }

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
