import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { CollisionCategories, CollisionMasks } from "../physics/CollisionCategories";
// Import all managers
import { CraftingFailureReason } from "../../lib/craft/craftModel";
import { BackgroundManager } from "./logic/BackgroundManager";
import { CauldronManager } from "./logic/Cauldron/CauldronManager";
import { ClawManager } from "./logic/ClawManager";
import { ContainerManager } from "./logic/ContainerManager";
import { CraftedItemManager } from "./logic/CraftedItemManager";
import { FurnaceManager } from "./logic/FurnaceManager";
import { InputManager } from "./logic/InputManager";
import { IntakeManager } from "./logic/Intake/IntakeManager";
import { JunkPileManager } from "./logic/JunkPileManager";
import { PipeManager } from "./logic/PipeManager";

/**
 * Enum for managing consistent depth layers throughout the game
 * Lower numbers are rendered behind higher numbers
 */
export enum DepthLayers {
  Background = 0,
  BackgroundWalls = 10,
  PipeBack = 20,
  SpawnedObjects = 30,
  JunkPile = 30, // Same depth as SpawnedObjects for consistency
  PipeFront = 40,
  BackgroundDecor = 50,
  Claw = 60,
  BackgroundFrame = 70,
  Foreground = 80,
  ForegroundDecor = 90,
  UI = 100,
}

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  gameText: Phaser.GameObjects.Text;

  // Background music
  private backgroundMusic: Phaser.Sound.BaseSound;

  // Game managers
  private backgroundManager: BackgroundManager;
  private pipeManager: PipeManager;
  private junkPileManager: JunkPileManager;
  private craftedItemManager: CraftedItemManager;
  private containerManager: ContainerManager;
  private cauldronManager: CauldronManager;
  private intakeManager: IntakeManager;
  private furnaceManager: FurnaceManager;
  private clawManager: ClawManager;
  private inputManager: InputManager; // Add InputManager

  // Particle effects
  private spotlightParticles: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private spotlightBackground: Phaser.GameObjects.Graphics | null = null;

  // Physics bodies (Scene specific)
  private groundHeight = 38;
  // @ts-ignore
  private groundCollider: MatterJS.BodyType;
  leftWall: MatterJS.BodyType;
  rightWall: MatterJS.BodyType;
  ceiling: MatterJS.BodyType;

  constructor() {
    super("Game");
  }

  create() {
    this.camera = this.cameras.main;

    // Initialize background music
    this.backgroundMusic = this.sound.add("main_ost", {
      volume: 0.06,
      loop: true,
    });
    this.backgroundMusic.play();

    // Instantiate Managers (Order might matter for dependencies or visual layering setup)
    this.backgroundManager = new BackgroundManager(this);
    this.pipeManager = new PipeManager(this);
    this.containerManager = new ContainerManager(this);
    this.furnaceManager = new FurnaceManager(this);
    this.junkPileManager = new JunkPileManager(this);
    this.cauldronManager = new CauldronManager(this);
    this.intakeManager = new IntakeManager(this);
    this.craftedItemManager = new CraftedItemManager(this);
    this.clawManager = new ClawManager(this);
    this.inputManager = new InputManager(this);

    // Store managers in registry for easy access
    this.registry.set("junkPileManager", this.junkPileManager);
    this.registry.set("cauldronManager", this.cauldronManager);

    // Set up physics world (Remains in Scene)
    this.matter.world.setBounds(0, 0, this.cameras.main.width, this.cameras.main.height);
    this.matter.world.setGravity(0, 1); // Standard downward gravity

    // Create ground collider (Remains in Scene)
    this.groundCollider = this.matter.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height - this.groundHeight / 2,
      this.cameras.main.width,
      this.groundHeight,
      {
        isStatic: true,
        label: "ground",
        collisionFilter: {
          category: CollisionCategories.ENVIRONMENT,
          mask: CollisionMasks.ENVIRONMENT,
        },
      }
    );

    this.ceiling = this.matter.add.rectangle(this.cameras.main.width / 2, 0, this.cameras.main.width, 200, {
      isStatic: true,
      label: "ceiling",
      collisionFilter: {
        category: CollisionCategories.ENVIRONMENT,
        mask: CollisionMasks.ENVIRONMENT,
      },
    });

    this.leftWall = this.matter.add.rectangle(0, this.cameras.main.height / 2, 450, this.cameras.main.height, {
      isStatic: true,
      label: "leftWall",
      collisionFilter: {
        category: CollisionCategories.ENVIRONMENT,
        mask: CollisionMasks.ENVIRONMENT,
      },
    });

    this.rightWall = this.matter.add.rectangle(this.cameras.main.width, this.cameras.main.height / 2, 450, this.cameras.main.height, {
      isStatic: true,
      label: "rightWall",
      collisionFilter: {
        category: CollisionCategories.ENVIRONMENT,
        mask: CollisionMasks.ENVIRONMENT,
      },
    });

    // Pass the pipe spawn point from PipeManager to JunkPileManager
    this.junkPileManager.setSpawnPoint(this.pipeManager.getSpawnPoint().x, this.pipeManager.getSpawnPoint().y);

    // Setup event listeners
    EventBus.on("toggle-crafting", this.toggleCrafting, this);
    EventBus.on("toggle-claw", () => this.clawManager.toggleClaw());
    EventBus.on("claw-move-horizontal", this.moveClaw, this);
    EventBus.on("crafting-success-inspect-finish", this.craftingSuccessInspectFinish, this);
    EventBus.on("temperature-exceeded", this.handleTemperatureExceeded, this);
    // Generate the initial junk portion
    this.junkPileManager.generateJunkPortion();

    // Add shutdown listener for cleanup
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.shutdown();
    });

    // Create the spotlight particle effect behind the item
    this.setupSpotlightEffect();

    EventBus.emit("current-scene-ready", this);
  }

  changeScene(sceneName: string = "Idle") {
    console.log(`Game: Changing scene to ${sceneName}`);
    this.scene.start(sceneName);
  }

  private moveClaw(moveFactor: number): void {
    if (!this.cauldronManager.isCraftingInProgress()) {
      this.clawManager.moveHorizontal(moveFactor);
    }
  }

  private toggleCrafting(): void {
    if (this.cauldronManager.isCraftingInProgress()) {
      this.stopCrafting();
    } else {
      this.startCrafting();
    }
  }

  private startCrafting(): void {
    if (!this.cauldronManager.hasEnoughJunkForCrafting()) {
      console.log("Not enough junk pieces in cauldron above the threshold line - cannot craft item");
      EventBus.emit("crafting-failure", { reason: CraftingFailureReason.NotEnoughJunk, message: "Not enough materials in cauldron" });
      return;
    }

    if (!this.intakeManager.hasEnoughJunkForCrafting()) {
      console.log("Not enough junk pieces in intake above the threshold line - cannot craft item");
      EventBus.emit("crafting-failure", { reason: CraftingFailureReason.NotEnoughJunk, message: "Not enough materials in intake" });
      return;
    }

    this.intakeManager?.startCrafting();
    this.cauldronManager?.startCrafting();
    this.furnaceManager?.startCrafting(); // Start the furnace fire animation
  }

  private stopCrafting(): void {
    this.intakeManager.stopCrafting();
    this.furnaceManager.stopCrafting(); // Stop the furnace fire animation

    const result = this.cauldronManager.stopCrafting();

    if (!result.item && result.failure) {
      EventBus.emit("crafting-failure", { reason: result.failure.reason, message: result.failure.message });
      return;
    }

    if (result.item) {
      const craftedLootItem = result.item;

      this.spotlightParticles?.setVisible(true);
      this.spotlightParticles!.emitting = true;
      // Show the background rectangle
      this.spotlightBackground?.setVisible(true);

      // Display the crafted item
      this.craftedItemManager.displayItem(craftedLootItem);

      // Emit event with crafting result
      EventBus.emit("crafting-success", craftedLootItem);
      EventBus.emit("add-crafted-item", craftedLootItem);
    }
  }

  craftingSuccessInspectFinish() {
    this.craftedItemManager.clearDisplay();
    this.junkPileManager.generateNextPortion();
    this.spotlightParticles!.emitting = false;
    this.spotlightParticles?.setVisible(false);
    // Hide the background rectangle
    this.spotlightBackground?.setVisible(false);
  }

  update() {
    // Update managers that need per-frame updates
    this.clawManager.update();
    this.inputManager.update();
  }

  /**
   * Scene shutdown cleanup
   */
  private shutdown(): void {
    console.log("Game scene shutting down...");

    // Stop background music
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
    }

    // Remove event listeners
    EventBus.off("toggle-crafting", this.toggleCrafting, this);
    EventBus.off("toggle-claw");
    EventBus.off("claw-move-horizontal", this.moveClaw, this);

    // Clean up managers
    this.backgroundManager?.destroy();
    this.pipeManager?.destroy();
    this.craftedItemManager?.destroy();
    this.containerManager?.destroy();
    this.cauldronManager?.destroy();
    this.intakeManager?.destroy();
    this.furnaceManager?.destroy();
    this.clawManager?.destroy();
    this.inputManager?.destroy();
  }

  /**
   * Handles temperature exceeded event from the cauldron manager
   */
  private handleTemperatureExceeded(): void {
    console.log("Game: Temperature exceeded, stopping all crafting");
    this.intakeManager.stopCrafting();
    this.furnaceManager.stopCrafting();
    EventBus.emit("crafting-failure", { reason: CraftingFailureReason.TooHighTemperature, message: "Temperature in cauldron exceeded" });
  }

  /**
   * Create particle effects using spotlight_circle image that fades in and moves around
   * This is displayed behind the crafted item for visual flair
   */
  private setupSpotlightEffect(): void {
    // Get the position of where the crafted item will be displayed
    const x = this.cameras.main.width / 2;
    const y = this.cameras.main.height / 2;

    // Clean up previous particles if they exist
    if (this.spotlightParticles) {
      this.spotlightParticles.destroy();
    }

    // Clean up previous background if it exists
    if (this.spotlightBackground) {
      this.spotlightBackground.destroy();
    }

    // Create the background rectangle with rounded corners using Graphics
    this.spotlightBackground = this.add.graphics();
    this.spotlightBackground.setDepth(DepthLayers.UI - 2);

    // Draw a rounded rectangle
    const rectWidth = 1080;
    const rectHeight = 1000;
    const cornerRadius = 40;

    this.spotlightBackground.fillStyle(0x574436, 1);
    this.spotlightBackground.fillRoundedRect(x - rectWidth / 2, y - rectHeight / 2, rectWidth, rectHeight, cornerRadius);

    this.spotlightBackground.setVisible(false);

    // Create new particle emitter for the spotlights
    this.spotlightParticles = this.add.particles(0, 0, "spotlight_circle", {
      x: x,
      y: y,
      lifespan: { min: 3000, max: 5000 },
      scale: { start: 0.1, end: 0.6 },
      alpha: { start: 1, end: 0 },
      speed: { min: 20, max: 40 },
      angle: { min: 0, max: 360 },
      frequency: 200,
      quantity: 1,
      rotate: { min: -10, max: 10 },
      // Let the particles move slightly in a circular pattern
      moveToX: { min: x - 20, max: x + 20 },
      moveToY: { min: y - 20, max: y + 20 },
    });

    // Set the depth to be just below the crafted item
    this.spotlightParticles.setDepth(DepthLayers.UI - 1);

    this.spotlightParticles.emitting = false;
  }
}
