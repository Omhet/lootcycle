import { Scene } from "phaser";
import { craftLootItem } from "../../lib/craft/craftLootItem";
import { LootConfig } from "../../lib/craft/craftModel";
import { EventBus } from "../EventBus";
// Import all managers
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
    BackgroundFrame = 50,
    BackgroundDecor = 60,
    Ground = 70,
    Claw = 80,
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
        this.cauldronManager = new CauldronManager(this);
        this.intakeManager = new IntakeManager(this);
        this.junkPileManager = new JunkPileManager(this);
        this.craftedItemManager = new CraftedItemManager(this);
        this.clawManager = new ClawManager(this); // Instantiate ClawManager

        // Set up physics world (Remains in Scene)
        this.matter.world.setBounds(
            0,
            0,
            this.cameras.main.width,
            this.cameras.main.height
        );
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
            }
        );

        // Pass the pipe spawn point from PipeManager to JunkPileManager
        this.junkPileManager.setSpawnPoint(
            this.pipeManager.getSpawnPoint().x,
            this.pipeManager.getSpawnPoint().y
        );

        // Setup input listener
        this.input.keyboard?.on("keydown-ENTER", () => {
            // this.junkPileManager.generateNextPortion();
            this.craftAndRenderItem();
        });

        // Generate the initial junk portion
        // this.junkPileManager.generateJunkPortion();

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

        const mockJunkPieces: any[] = [];
        const mockTemperature = 50;
        const mockConfig = {} as LootConfig;

        const craftResult = craftLootItem({
            lootItemRecipeId: "short_sword",
            junkPieces: mockJunkPieces,
            temperature: mockTemperature,
            config: mockConfig,
        });

        if (craftResult.success && craftResult.item) {
            this.craftedItemManager.displayItem(craftResult.item);
        }
    }

    update() {
        // Claw anchor control
        if (this.cursors?.left.isDown) {
            this.clawManager.move(-1);
        } else if (this.cursors?.right.isDown) {
            this.clawManager.move(1);
        } else {
            this.clawManager.move(0);
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
    }
}
