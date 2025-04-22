import { Scene } from "phaser";
import { craftLootItem } from "../../lib/craft/craftLootItem";
import { EventBus } from "../EventBus";
import { CollisionCategories, CollisionMasks } from "../physics/CollisionCategories";
// Import all managers
import { lootConfig } from "../../lib/craft/config";
import { BackgroundManager } from "./logic/BackgroundManager";
import { CauldronManager } from "./logic/CauldronManager";
import { ClawManager } from "./logic/ClawManager";
import { ContainerManager } from "./logic/ContainerManager";
import { CraftedItemManager } from "./logic/CraftedItemManager";
import { FurnaceManager } from "./logic/FurnaceManager";
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
  BackgroundDecor = 42,
  Claw = 45,
  BackgroundFrame = 50,
  Ground = 70,
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
  private clawManager: ClawManager; // Add ClawManager property

  // Physics bodies (Scene specific)
  private groundHeight = 38;
  // @ts-ignore
  private groundCollider: MatterJS.BodyType;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  leftWall: MatterJS.BodyType;
  rightWall: MatterJS.BodyType;
  ceiling: MatterJS.BodyType;

  constructor() {
    super("Game");
  }

  create() {
    this.camera = this.cameras.main;
    this.cursors = this.input.keyboard?.createCursorKeys();

    // Instantiate Managers (Order might matter for dependencies or visual layering setup)
    this.backgroundManager = new BackgroundManager(this);
    this.pipeManager = new PipeManager(this);
    this.containerManager = new ContainerManager(this);
    this.furnaceManager = new FurnaceManager(this);
    // Initialize junkPileManager before cauldronManager since cauldron needs it
    this.junkPileManager = new JunkPileManager(this);
    // Pass junkPileManager reference to cauldronManager
    this.cauldronManager = new CauldronManager(this);
    this.intakeManager = new IntakeManager(this);
    this.craftedItemManager = new CraftedItemManager(this);
    this.clawManager = new ClawManager(this); // Instantiate ClawManager

    // Store junkPileManager in registry for easy access (not needed for cauldron but may be useful elsewhere)
    this.registry.set("junkPileManager", this.junkPileManager);

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

    // Setup input listener
    this.input.keyboard?.on("keydown-ENTER", () => {
      this.junkPileManager.generateNextPortion();
      this.craftAndRenderItem();
    });

    // Add the space key for toggling claw open/closed
    this.input.keyboard?.on("keydown-SPACE", () => {
      this.clawManager.toggleClaw();
    });

    // Generate the initial junk portion
    this.junkPileManager.generateJunkPortion();

    // Add shutdown listener for cleanup
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.shutdown();
    });

    EventBus.emit("current-scene-ready", this);
  }

  /**
   * Crafts a new item and tells the manager to display it
   */
  private craftAndRenderItem(): void {
    this.craftedItemManager.clearDisplay();

    // Get junk pieces currently in the cauldron
    const junkItemsInCauldron = this.cauldronManager.getJunkPiecesInside();
    const junkPieces = junkItemsInCauldron.map((item) => item.junkPiece);

    // Get current temperature from the furnace (or use default value)
    // const temperature = this.furnaceManager.getCurrentTemperature() || 50;
    const temperature = 50;

    // Check if we have junk pieces to craft with
    if (junkPieces.length === 0) {
      console.log("No junk pieces found in cauldron - cannot craft item");
      EventBus.emit("crafting-failure", { reason: "No materials in cauldron" });
      return;
    }

    console.log(`Attempting to craft with ${junkPieces.length} junk pieces at ${temperature} temperature`);

    const craftResult = craftLootItem({
      lootItemRecipeId: "short_sword", // In the future, this could be determined by the junk pieces
      junkPieces: junkPieces,
      temperature: temperature,
      config: lootConfig,
    });

    if (craftResult.success && craftResult.item) {
      this.craftedItemManager.displayItem(craftResult.item);

      // Clear the junk pieces from the cauldron tracking (they're consumed in crafting)
      // Note: We're not physically removing the objects here, that would be a separate feature
      // potentially with an animation showing them being consumed
      this.cauldronManager.clearJunkPieces();

      // Emit an event for successful crafting
      EventBus.emit("crafting-success", craftResult.item);
    } else if (craftResult.failure) {
      // Emit an event when crafting fails
      EventBus.emit("crafting-failure", craftResult.failure);
    }
  }

  update() {
    // Update claw manager
    this.clawManager.update();

    // Claw anchor control
    if (this.cursors?.left.isDown) {
      this.clawManager.moveHorizontal(-1);
    } else if (this.cursors?.right.isDown) {
      this.clawManager.moveHorizontal(1);
    } else {
      this.clawManager.moveHorizontal(0);
    }
  }

  /**
   * Scene shutdown cleanup
   */
  private shutdown(): void {
    console.log("Game scene shutting down...");

    // Clean up managers
    this.backgroundManager?.destroy();
    this.pipeManager?.destroy();
    this.craftedItemManager?.destroy();
    this.containerManager?.destroy();
    this.cauldronManager?.destroy();
    this.intakeManager?.destroy();
    this.furnaceManager?.destroy();
    this.clawManager?.destroy(); // Destroy ClawManager

    // Remove specific listeners
    this.input.keyboard?.off("keydown-ENTER");
    this.input.keyboard?.off("keydown-SPACE"); // Remove space key listener
  }
}
