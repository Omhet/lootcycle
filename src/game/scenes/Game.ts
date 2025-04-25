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

  // Recipe card UI elements
  private recipeCardBackground: Phaser.GameObjects.Rectangle;
  private recipeCardImage: Phaser.GameObjects.Image;
  private recipeCardText: Phaser.GameObjects.Text;

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

    // Create the recipe card display
    this.createRecipeCardDisplay();

    // Setup event listeners
    EventBus.on("toggle-crafting", this.toggleCrafting, this);
    EventBus.on("toggle-claw", () => this.clawManager.toggleClaw());
    EventBus.on("claw-move-horizontal", this.moveClaw, this);
    EventBus.on("crafting-success-inspect-finish", this.craftingSuccessInspectFinish, this);
    // Generate the initial junk portion
    this.junkPileManager.generateJunkPortion();

    // Add shutdown listener for cleanup
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.shutdown();
    });

    EventBus.emit("current-scene-ready", this);
  }

  /**
   * Creates a recipe card display in the bottom left corner to show the selected recipe
   */
  private createRecipeCardDisplay(): void {
    const cardSize = 128;
    const padding = 10;
    const cornerOffset = 20;

    // Create a background rectangle for the card
    this.recipeCardBackground = this.add.rectangle(
      cornerOffset + cardSize / 2,
      this.cameras.main.height - cornerOffset - cardSize / 2,
      cardSize + padding * 2,
      cardSize + padding * 2,
      0x574436, // Brown background color
      0.8 // Alpha
    );
    this.recipeCardBackground.setStrokeStyle(2, 0x7b6e65); // Border
    this.recipeCardBackground.setDepth(DepthLayers.UI);

    // Get the current recipe ID from the cauldron manager
    const recipeId = this.cauldronManager.getCurrentRecipeId();
    const recipeImageKey = `${recipeId}_recipe`;

    // Create an image for the recipe
    this.recipeCardImage = this.add.image(
      cornerOffset + cardSize / 2,
      this.cameras.main.height - cornerOffset - cardSize / 2 - 10, // Slight offset for the text below
      recipeImageKey
    );
    this.recipeCardImage.setDisplaySize(cardSize * 0.8, cardSize * 0.8); // 80% of the card size
    this.recipeCardImage.setDepth(DepthLayers.UI);

    // Add a text label below the image
    const recipeName = recipeId.charAt(0).toUpperCase() + recipeId.slice(1).replace("_", " ");
    this.recipeCardText = this.add.text(cornerOffset + cardSize / 2, this.cameras.main.height - cornerOffset - padding - 10, `${recipeName} Recipe`, {
      fontSize: "14px",
      color: "#ebe6e1", // Light text color
      align: "center",
    });
    this.recipeCardText.setOrigin(0.5, 0);
    this.recipeCardText.setDepth(DepthLayers.UI);

    // Update the recipe card whenever the recipe changes
    this.events.on("update", this.updateRecipeCard, this);
  }

  /**
   * Updates the recipe card with the currently selected recipe
   */
  private updateRecipeCard(): void {
    // Only update if the recipe has changed
    const currentRecipeId = this.cauldronManager.getCurrentRecipeId();
    if (this.recipeCardImage.texture.key !== `${currentRecipeId}_recipe`) {
      // Update the image
      const recipeImageKey = `${currentRecipeId}_recipe`;
      this.recipeCardImage.setTexture(recipeImageKey);

      // Update the text
      const recipeName = currentRecipeId.charAt(0).toUpperCase() + currentRecipeId.slice(1).replace("_", " ");
      this.recipeCardText.setText(`${recipeName} Recipe`);
    }
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
  }

  private stopCrafting(): void {
    this.intakeManager.stopCrafting();

    const result = this.cauldronManager.stopCrafting();

    if (!result.item && result.failure) {
      EventBus.emit("crafting-failure", { reason: result.failure.reason, message: result.failure.message });
      return;
    }

    if (result.item) {
      const craftedLootItem = result.item;
      this.craftedItemManager.displayItem(craftedLootItem);

      // Emit event with crafting result
      EventBus.emit("crafting-success", craftedLootItem);
      EventBus.emit("add-crafted-item", craftedLootItem);
    }
  }

  craftingSuccessInspectFinish() {
    this.craftedItemManager.clearDisplay();
    this.junkPileManager.generateNextPortion();
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
    EventBus.off("claw-move-horizontal", this.moveClaw, this);
    this.events.off("update", this.updateRecipeCard, this);

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

    // Clean up UI elements
    this.recipeCardBackground?.destroy();
    this.recipeCardImage?.destroy();
    this.recipeCardText?.destroy();
  }
}
