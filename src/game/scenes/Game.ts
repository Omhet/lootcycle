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
import { IntakeManager } from "./logic/IntakeManager";
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
    this.inputManager = new InputManager(this); // Initialize InputManager

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
    EventBus.on("claw-move-horizontal", (moveFactor: number) => this.clawManager.moveHorizontal(moveFactor));

    // Generate the initial junk portion
    this.junkPileManager.generateJunkPortion();

    // Add shutdown listener for cleanup
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.shutdown();
    });

    EventBus.emit("current-scene-ready", this);
  }

  changeScene(sceneName: string = "Idle") {
    console.log(`Game: Changing scene to ${sceneName}`);
    this.scene.start(sceneName);
  }

  private toggleCrafting(): void {
    if (this.cauldronManager.isCraftingInProgress()) {
      this.stopCrafting();
    } else {
      this.startCrafting();
    }
  }

  private startCrafting(): void {
    // Check if enough junk has crossed the threshold line
    if (!this.cauldronManager.hasEnoughJunkForCrafting()) {
      console.log("Not enough junk pieces above the threshold line - cannot craft item");
      EventBus.emit("crafting-failure", { reason: CraftingFailureReason.NotEnoughJunk, message: "Not enough materials in cauldron" });
      return;
    }

    this.cauldronManager?.startCrafting();
  }

  private stopCrafting(): void {
    const result = this.cauldronManager?.stopCrafting();

    if (!result.item && result.failure) {
      EventBus.emit("crafting-failure", { reason: result.failure.reason, message: result.failure.message });
      return;
    }

    if (result.item) {
      const craftedLootItem = result.item;
      this.craftedItemManager.displayItem(craftedLootItem);

      // Emit event with crafting result
      EventBus.emit("crafting-success", craftedLootItem); // TODO: Will be used for new loot screen
      EventBus.emit("add-crafted-item", craftedLootItem); // Is used to add crafted loot item in stall store
    }
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

    // Remove event listeners
    EventBus.off("toggle-crafting", this.toggleCrafting, this);
    EventBus.off("toggle-claw");
    EventBus.off("claw-move-horizontal");

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
}
