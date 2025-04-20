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

        // Set up the pipe in the top right corner
        this.setupPipe();

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
        // Starting from the bottom: bg, bg_walls, bg_frame, bg_decor

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
        const pipeX = this.cameras.main.width; // Right edge with small margin
        const pipeY = 64; // Top edge with small margin

        // Add the back layer of the pipe
        const pipeBack = this.add.image(0, 0, "pipe_back");

        // Add the front layer of the pipe
        const pipeFront = this.add.image(0, 0, "pipe_front");

        // Get the dimensions of the pipe sprite
        const pipeWidth = pipeBack.width;
        const pipeHeight = pipeBack.height;

        // Create a container for the pipe layers
        // Containers don't have origin/pivot like Images, so we need to position the elements inside
        this.pipeContainer = this.add.container(pipeX, pipeY);

        // Adjust the images' positions within the container
        // For top-right pivot, position both images with their top-right corner at (0,0)
        // This means shifting them to the left by their width
        pipeBack.setOrigin(1, 0); // Set origin to top-right for both images
        pipeFront.setOrigin(1, 0);

        // Add both layers to the container
        this.pipeContainer.add(pipeBack);
        this.pipeContainer.add(pipeFront);

        // Debug visualization to confirm pipe position
        // Uncomment if needed
        const marker = this.add.rectangle(0, 0, 5, 5, 0xff0000);
        this.pipeContainer.add(marker);

        // Set the spawn point to be at the lower left corner of the pipe
        // Since our pivot is at the container's position (top-right of the pipe),
        // the lower left corner is at:
        // X = -pipeWidth (full width to the left)
        // Y = pipeHeight (full height down)
        const spawnOffsetX = -pipeWidth;
        const spawnOffsetY = pipeHeight;

        // Create the spawn point vector
        this.pipeSpawnPoint = new Phaser.Math.Vector2(
            spawnOffsetX + 80,
            spawnOffsetY - 80
        );

        // Optional: Add a debug marker at the spawn point
        const spawnMarker = this.add.circle(
            this.pipeSpawnPoint.x,
            this.pipeSpawnPoint.y,
            5,
            0x00ff00
        );
        this.pipeContainer.add(spawnMarker);
    }
}
