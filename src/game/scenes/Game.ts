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
        const yPos = this.cameras.main.height - frame.height / 2;

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
}
