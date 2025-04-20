import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { JunkPileManager } from "./logic/JunkPileManager";

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    container: Phaser.GameObjects.Container;
    backgroundLayers: Phaser.GameObjects.Container;
    gameText: Phaser.GameObjects.Text;

    // Game managers
    private junkPileManager: JunkPileManager;

    // Physics bodies
    private groundHeight = 38;
    // @ts-ignore
    private groundCollider: MatterJS.BodyType;
    private containerSprite: Phaser.Physics.Matter.Sprite;

    // Pipe related objects
    private pipeContainer: Phaser.GameObjects.Container;
    private pipeSpawnPoint: Phaser.Math.Vector2;

    constructor() {
        super("Game");
    }

    create() {
        this.camera = this.cameras.main;

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Create a container centered on the screen
        this.container = this.add.container(centerX, centerY);

        // Create background layers container
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
        // Moved after groundHeight is defined so we can use it for positioning
        this.createContainer();

        // Initialize JunkPileManager
        this.junkPileManager = new JunkPileManager(this);

        // Pass the pipe spawn point to the JunkPileManager
        this.junkPileManager.setSpawnPoint(
            this.pipeContainer.x + this.pipeSpawnPoint.x,
            this.pipeContainer.y + this.pipeSpawnPoint.y
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
        // Create a container for background layers
        this.backgroundLayers = this.add.container(0, 0);

        // Add background layers in order from back to front
        // Starting from the bottom: bg, bg_walls, pipe, bg_frame, bg_decor

        // Base background layer
        const bg = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            "bg"
        );
        this.backgroundLayers.add(bg);

        // Walls layer
        const bgWalls = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            "bg_walls"
        );
        this.backgroundLayers.add(bgWalls);

        // Set up the pipe here - between walls and frame
        this.setupPipe();
        // Add the pipe container to the background layers
        this.backgroundLayers.add(this.pipeContainer);

        // Frame layer
        const bgFrame = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            "bg_frame"
        );
        this.backgroundLayers.add(bgFrame);

        // Decoration layer
        const bgDecor = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            "bg_decor"
        );
        this.backgroundLayers.add(bgDecor);
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
    }

    /**
     * Sets up the pipe in the top right corner with front and back layers
     */
    private setupPipe(): void {
        // Position in the top right corner with some margin
        const pipeX = this.cameras.main.width; // Right edge
        const pipeY = 64; // Top edge with small margin

        // Add the back layer of the pipe directly to the scene
        const pipeBack = this.add.image(pipeX, pipeY, "pipe_back");
        pipeBack.setOrigin(1, 0); // Set origin to top-right
        pipeBack.setDepth(10);

        // Add the front layer of the pipe directly to the scene
        const pipeFront = this.add.image(pipeX, pipeY, "pipe_front");
        pipeFront.setOrigin(1, 0); // Set origin to top-right
        pipeFront.setDepth(30);

        // Get the dimensions of the pipe sprite
        const pipeWidth = pipeBack.width;
        const pipeHeight = pipeBack.height;

        // Create a dummy container just to keep track of the position
        // We're not adding our pipe images to this container
        this.pipeContainer = this.add.container(pipeX, pipeY);

        // Optional: Add debug visualization markers
        const centerMarker = this.add.rectangle(pipeX, pipeY, 5, 5, 0xff0000);
        centerMarker.setDepth(40); // Above everything for visibility

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
        spawnMarker.setDepth(40); // Above everything for visibility
    }
}
