import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { JunkPileManager } from "./logic/JunkPileManager";

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
    UI = 100,
}

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    gameText: Phaser.GameObjects.Text;

    // Game managers
    private junkPileManager: JunkPileManager;

    // Physics bodies
    private groundHeight = 38;
    // @ts-ignore
    private groundCollider: MatterJS.BodyType;
    private containerSprite: Phaser.Physics.Matter.Sprite;
    private cauldronSprite: Phaser.Physics.Matter.Sprite;
    private intakeSprite: Phaser.Physics.Matter.Sprite;
    private furnaceSprite: Phaser.GameObjects.Sprite; // New furnace sprite without physics

    // Pipe related objects
    private pipeSpawnPoint: Phaser.Math.Vector2;
    private pipePosition: Phaser.Math.Vector2;

    constructor() {
        super("Game");
    }

    create() {
        this.camera = this.cameras.main;

        // Setup background layers with proper depth ordering
        this.setupBackgroundLayers();

        // Set up physics world
        this.matter.world.setBounds(
            0,
            0,
            this.cameras.main.width,
            this.cameras.main.height
        );
        this.matter.world.setGravity(0, 1); // Standard downward gravity

        // Create ground collider - invisible rectangle at the bottom of the screen
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

        // Create the container sprite with physics from the PhysicsEditor JSON data
        this.createContainer();

        // Create the furnace sprite (no physics)
        this.createFurnace();

        // Create the cauldron sprite with physics from the PhysicsEditor JSON data
        this.createCauldron();

        // Create the intake sprite with physics from the PhysicsEditor JSON data
        this.createIntake();

        // Initialize JunkPileManager
        this.junkPileManager = new JunkPileManager(this);

        // Pass the pipe spawn point to the JunkPileManager
        this.junkPileManager.setSpawnPoint(
            this.pipePosition.x + this.pipeSpawnPoint.x,
            this.pipePosition.y + this.pipeSpawnPoint.y
        );

        this.input.keyboard?.on("keydown-ENTER", () => {
            // Generate next junk portion
            this.junkPileManager.generateNextPortion();
        });

        // Generate the initial junk portion
        this.junkPileManager.generateJunkPortion();

        EventBus.emit("current-scene-ready", this);
    }

    /**
     * Sets up the background layers in the correct order
     */
    private setupBackgroundLayers(): void {
        // Base background layer (lowest depth)
        const bg = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            "bg"
        );
        bg.setDepth(DepthLayers.Background);

        // Walls layer
        const bgWalls = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            "bg_walls"
        );
        bgWalls.setDepth(DepthLayers.BackgroundWalls);

        // Set up the pipe - between walls and frame
        this.setupPipe();

        // Frame layer
        const bgFrame = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            "bg_frame"
        );
        bgFrame.setDepth(DepthLayers.BackgroundFrame);

        // Decoration layer (highest depth)
        const bgDecor = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            "bg_decor"
        );
        bgDecor.setDepth(DepthLayers.BackgroundDecor);
    }

    /**
     * Creates the container sprite with physics using the PhysicsEditor JSON data
     */
    private createContainer(): void {
        // Get the physics data from the loaded JSON
        const containerPhysics = this.cache.json.get("containerPhysics");

        // Get the container texture dimensions from the texture manager
        const containerTexture = this.textures.get("container");
        const frame = containerTexture.get();

        // Calculate position in the bottom right corner
        const horizontalMargin = 154; // Margin from the right edge of the screen
        const xPos =
            this.cameras.main.width - frame.width / 2 - horizontalMargin;
        const yPos =
            this.cameras.main.height -
            frame.height / 2 +
            (this.groundHeight / 2 + 2);

        // Create the container sprite with physics directly at the correct position
        this.containerSprite = this.matter.add.sprite(
            xPos,
            yPos,
            "container",
            undefined,
            { shape: containerPhysics.container }
        );

        // Set the sprite properties
        this.containerSprite.setStatic(true);
        this.containerSprite.setName("container");
        this.containerSprite.setDepth(DepthLayers.Ground);
    }

    /**
     * Creates the cauldron sprite with physics using the PhysicsEditor JSON data
     */
    private createCauldron(): void {
        // Get the physics data from the loaded JSON
        const cauldronPhysics = this.cache.json.get("cauldronPhysics");

        // Get the cauldron texture dimensions from the texture manager
        const cauldronTexture = this.textures.get("cauldron");
        const frame = cauldronTexture.get();

        // Position cauldron above the furnace
        const xPos = this.cameras.main.width / 2;

        // Calculate vertical position to place cauldron above furnace
        // Use the furnace bounds to position the cauldron properly
        const furnaceHeight = this.furnaceSprite.height;
        const furnaceTop = this.furnaceSprite.y - furnaceHeight / 2;

        // Position the cauldron so its bottom aligns with the top of the furnace
        const yPos = furnaceTop - frame.height / 2 + 10; // +10 to slightly overlap with furnace

        // Create the cauldron sprite with physics directly at the correct position
        this.cauldronSprite = this.matter.add.sprite(
            xPos,
            yPos,
            "cauldron",
            undefined,
            { shape: cauldronPhysics.cauldron }
        );

        // Set the sprite properties
        this.cauldronSprite.setStatic(true);
        this.cauldronSprite.setName("cauldron");
        this.cauldronSprite.setDepth(DepthLayers.Ground);
    }

    /**
     * Creates the intake sprite with physics using the PhysicsEditor JSON data
     */
    private createIntake(): void {
        // Get the physics data from the loaded JSON
        const intakePhysics = this.cache.json.get("intakePhysics");

        // Get the intake texture dimensions from the texture manager
        const intakeTexture = this.textures.get("intake");
        const frame = intakeTexture.get();

        // Calculate position to the left of the cauldron
        const horizontalOffset = 150; // Distance to the left of the cauldron
        const xPos = this.cameras.main.width / 2 - horizontalOffset;
        const yPos =
            this.cameras.main.height -
            frame.height / 2 +
            (this.groundHeight / 2 + 2);

        // Create the intake sprite with physics directly at the correct position
        this.intakeSprite = this.matter.add.sprite(
            xPos,
            yPos,
            "intake",
            undefined,
            { shape: intakePhysics.intake }
        );

        // Set the sprite properties
        this.intakeSprite.setStatic(true);
        this.intakeSprite.setName("intake");
        this.intakeSprite.setDepth(DepthLayers.Ground);
    }

    /**
     * Creates the furnace sprite (without physics)
     */
    private createFurnace(): void {
        // Get the furnace texture dimensions from the texture manager
        const furnaceTexture = this.textures.get("furnace");
        const frame = furnaceTexture.get();

        // Position furnace in the middle of the screen at the bottom
        const xPos = this.cameras.main.width / 2;
        const yPos =
            this.cameras.main.height -
            frame.height / 2 +
            (this.groundHeight / 2 + 2);

        // Create the furnace sprite (no physics)
        this.furnaceSprite = this.add.sprite(xPos, yPos, "furnace");

        // Set the sprite properties
        this.furnaceSprite.setName("furnace");
        this.furnaceSprite.setDepth(DepthLayers.Ground);
    }

    /**
     * Sets up the pipe in the top right corner with front and back layers
     */
    private setupPipe(): void {
        // Position in the top right corner with some margin
        const pipeX = this.cameras.main.width; // Right edge
        const pipeY = 64; // Top edge with small margin

        // Store pipe position for later reference
        this.pipePosition = new Phaser.Math.Vector2(pipeX, pipeY);

        // Add the back layer of the pipe directly to the scene
        const pipeBack = this.add.image(pipeX, pipeY, "pipe_back");
        pipeBack.setOrigin(1, 0); // Set origin to top-right
        pipeBack.setDepth(DepthLayers.PipeBack);

        // Add the front layer of the pipe directly to the scene
        const pipeFront = this.add.image(pipeX, pipeY, "pipe_front");
        pipeFront.setOrigin(1, 0); // Set origin to top-right
        pipeFront.setDepth(DepthLayers.PipeFront);

        // Get the dimensions of the pipe sprite
        const pipeWidth = pipeBack.width;
        const pipeHeight = pipeBack.height;

        // Set the spawn point to be at the lower left corner of the pipe
        // X = -pipeWidth (full width to the left from the right edge)
        // Y = pipeHeight (full height down from top edge)
        const spawnOffsetX = -pipeWidth + 80;
        const spawnOffsetY = pipeHeight - 80;

        // Create the spawn point vector relative to top-right corner
        this.pipeSpawnPoint = new Phaser.Math.Vector2(
            spawnOffsetX,
            spawnOffsetY
        );

        // Optional: Add a debug marker at the spawn point
        const spawnMarker = this.add.circle(
            pipeX + spawnOffsetX,
            pipeY + spawnOffsetY,
            5,
            0x00ff00
        );
        spawnMarker.setDepth(DepthLayers.UI); // Above everything for visibility
    }
}
