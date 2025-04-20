import { Scene } from "phaser";
import { lootConfig } from "../../lib/craft/config";
import {
    JunkDetail,
    RecipeItemId,
    RecipeItemType,
} from "../../lib/craft/craftModel";
import { getJunkPortion } from "../../lib/craft/getJunkPortion";
import { EventBus } from "../EventBus";

// Interface to store both junk detail and its physics body
interface JunkPileItem {
    junkDetail: JunkDetail;
    body: Phaser.Physics.Matter.Image | Phaser.Physics.Matter.Sprite;
}

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    container: Phaser.GameObjects.Container;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;

    // Game state
    private portionNumber: number = 1;
    private junkPile: JunkPileItem[] = []; // Total accumulated junk collection
    private spawnTimers: Phaser.Time.TimerEvent[] = [];
    private groundCollider: MatterJS.BodyType;

    constructor() {
        super("Game");
    }

    create() {
        this.camera = this.cameras.main;

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Create a container centered on the screen
        this.container = this.add.container(centerX, centerY);

        // Add background to the container at its center (0, 0 relative to container)
        this.background = this.add.image(0, 0, "background");
        this.container.add(this.background);

        // Set up physics world
        this.matter.world.setBounds(
            0,
            0,
            this.cameras.main.width,
            this.cameras.main.height
        );
        this.matter.world.setGravity(0, 1); // Standard downward gravity

        // Create ground collider - invisible rectangle at the bottom of the screen
        const groundHeight = 50;
        this.groundCollider = this.matter.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height - groundHeight / 2,
            this.cameras.main.width,
            groundHeight,
            {
                isStatic: true,
                label: "ground",
            }
        );

        this.input.keyboard?.on("keydown-ENTER", () => {
            // Increment portion number and generate new junk portion
            this.portionNumber++;
            this.generateJunkPortion();
        });

        // Generate the initial junk portion
        this.generateJunkPortion();

        EventBus.emit("current-scene-ready", this);
    }

    /**
     * Creates and spawns a physics body representing a junk detail
     * @param junkDetail The junk detail to visualize
     * @returns The created junk pile item with physics body
     */
    private spawnJunkItem(junkDetail: JunkDetail): JunkPileItem {
        // Define spawn point (top right corner with some margin)
        const spawnX = this.cameras.main.width - 200;
        const spawnY = 100;

        // Random parameters for the physics body
        const shapeSize = Phaser.Math.Between(30, 50);
        const shapeType = Phaser.Math.Between(0, 1); // 0: circle, 1: rectangle
        const colorValue = Phaser.Display.Color.GetColor(
            Phaser.Math.Between(100, 255),
            Phaser.Math.Between(100, 255),
            Phaser.Math.Between(100, 255)
        );

        // Apply a small random angle for the initial velocity direction
        // This creates the effect of items coming out of a bent pipe
        const angle = Phaser.Math.Between(-45, -15);
        const speed = Phaser.Math.Between(3, 6);
        const velocityX = Math.cos(Phaser.Math.DegToRad(angle)) * speed;
        const velocityY = Math.sin(Phaser.Math.DegToRad(angle)) * speed;

        let physicsBody: Phaser.Physics.Matter.Image;

        if (shapeType === 0) {
            // Circle
            const circle = this.add.circle(0, 0, shapeSize / 2, colorValue);
            physicsBody = this.matter.add.gameObject(circle, {
                shape: { type: "circle" },
                restitution: 0.5,
                friction: 0.1,
                label: junkDetail.id,
            }) as Phaser.Physics.Matter.Image;
            physicsBody.setPosition(spawnX, spawnY);
        } else {
            // Rectangle
            const width = shapeSize;
            const height = shapeSize * Phaser.Math.FloatBetween(0.5, 1.5);

            const rect = this.add.rectangle(0, 0, width, height, colorValue);
            physicsBody = this.matter.add.gameObject(rect, {
                restitution: 0.3,
                friction: 0.2,
                label: junkDetail.id,
            }) as Phaser.Physics.Matter.Image;
            physicsBody.setPosition(spawnX, spawnY);
        }

        // Apply initial velocity and rotation
        physicsBody.setVelocity(velocityX, velocityY);
        physicsBody.setAngularVelocity(Phaser.Math.FloatBetween(-0.05, 0.05));

        // Return the complete junk pile item
        return {
            junkDetail,
            body: physicsBody,
        };
    }

    /**
     * Generates a new junk portion based on current game state and adds it to junkPile
     */
    private generateJunkPortion(): void {
        // Find recipe IDs for testing
        // This finds the first recipe ID of a BladeWeapon type in the config
        let recipeIds: RecipeItemId[] = [];

        // Get the first available recipe from the config
        for (const recipeType in lootConfig.recipeItems) {
            const typedRecipeType = recipeType as RecipeItemType;
            const recipes = lootConfig.recipeItems[typedRecipeType];
            if (recipes && recipes.length > 0) {
                recipeIds = recipes.slice(0, 1).map((recipe) => recipe.id);
                break;
            }
        }

        // For demonstration, using hardcoded values with found recipe IDs
        const firstPortionSize = 10;
        const qualityChanceLevel = 1;
        const rarityChanceLevel = 1;

        // Generate the junk portion
        const newJunkPortion = getJunkPortion(
            lootConfig,
            recipeIds,
            this.portionNumber,
            firstPortionSize,
            qualityChanceLevel,
            rarityChanceLevel
        );

        // Clear any existing spawn timers
        this.spawnTimers.forEach((timer) => timer.destroy());
        this.spawnTimers = [];

        // Spawn each junk item with a delay to create a sequential dropping effect
        newJunkPortion.forEach((junkDetail, index) => {
            // Random delay between 300-500ms for each item
            const delay = 300 + Math.random() * 200;

            // Create a timer for spawning this item
            const timer = this.time.addEvent({
                delay: delay * index, // Multiply by index to create sequential spawning
                callback: () => {
                    const junkItem = this.spawnJunkItem(junkDetail);
                    this.junkPile.push(junkItem);
                },
                callbackScope: this,
            });

            // Store the timer reference so we can clear it if needed
            this.spawnTimers.push(timer);
        });

        console.log(
            `Generated junk portion #${this.portionNumber}:`,
            newJunkPortion
        );
        console.log(
            `Total junk pile size will be: ${
                this.junkPile.length + newJunkPortion.length
            }`
        );
        console.log(`Using recipe IDs:`, recipeIds);
    }
}
