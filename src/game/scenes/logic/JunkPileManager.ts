import { Scene } from "phaser";
import { lootConfig } from "../../../lib/craft/config";
import {
    JunkDetail,
    RecipeItemId,
    RecipeItemType,
} from "../../../lib/craft/craftModel";
import { getJunkPortion } from "../../../lib/craft/getJunkPortion";
import { DepthLayers } from "../Game";

// Interface to store both junk detail and its physics body
export interface JunkPileItem {
    junkDetail: JunkDetail;
    body: Phaser.Physics.Matter.Image | Phaser.Physics.Matter.Sprite;
}

export class JunkPileManager {
    private scene: Scene;
    private portionNumber: number = 1;
    private junkPile: JunkPileItem[] = []; // Total accumulated junk collection
    private spawnTimers: Phaser.Time.TimerEvent[] = [];

    // Spawn point coordinates
    private spawnX: number;
    private spawnY: number;

    constructor(scene: Scene) {
        this.scene = scene;

        // Set default spawn point to top right corner with margin
        this.spawnX = this.scene.cameras.main.width - 200;
        this.spawnY = 100;
    }

    /**
     * Sets the spawn point for junk items
     * @param x The X coordinate of the spawn point
     * @param y The Y coordinate of the spawn point
     */
    public setSpawnPoint(x: number, y: number): void {
        this.spawnX = x;
        this.spawnY = y;
        console.log(`Junk pile spawn point set to: (${x}, ${y})`);
    }

    /**
     * Creates and spawns a physics body representing a junk detail
     * @param junkDetail The junk detail to visualize
     * @returns The created junk pile item with physics body
     */
    private spawnJunkItem(junkDetail: JunkDetail): JunkPileItem {
        // Use the configurable spawn point
        const spawnX = this.spawnX;
        const spawnY = this.spawnY;

        // Get the correct sprite frame name based on junk detail id
        const frameName = `${junkDetail.id}.png`;

        // Get physics shapes data
        const shapesData = this.scene.cache.json.get("details-shapes");

        // Check if we have a matching physics shape for this junk detail
        const physicsKey = junkDetail.id;
        const hasPhysicsShape = shapesData && shapesData[physicsKey];

        // Apply a small random angle for the initial velocity direction
        // This creates the effect of items coming out of a bent pipe
        const angle = Phaser.Math.Between(-45, -15);
        const speed = Phaser.Math.Between(-6, -3);
        const velocityX = Math.cos(Phaser.Math.DegToRad(angle)) * speed;
        const velocityY = Math.sin(Phaser.Math.DegToRad(angle)) * speed;

        let physicsBody: Phaser.Physics.Matter.Sprite;

        if (hasPhysicsShape) {
            // Create a sprite with the correct physics shape
            physicsBody = this.scene.matter.add.sprite(
                spawnX,
                spawnY,
                "details-sprites",
                frameName,
                {
                    shape: shapesData[physicsKey],
                }
            );

            // Set the label through body.parts[0] which is the main body part
            if (
                physicsBody.body &&
                (physicsBody.body as any).parts &&
                (physicsBody.body as any).parts.length > 0
            ) {
                (physicsBody.body as any).parts[0].label = junkDetail.id;
            }

            // Apply initial velocity and rotation
            physicsBody.setVelocity(velocityX, velocityY);
            physicsBody.setAngularVelocity(
                Phaser.Math.FloatBetween(-0.05, 0.05)
            );

            physicsBody.setDepth(DepthLayers.JunkPile);

            // Return the complete junk pile item
            return {
                junkDetail,
                body: physicsBody,
            };
        } else {
            throw new Error(
                `No physics shape found for junk detail: ${junkDetail.id}`
            );
        }
    }

    /**
     * Generates a new junk portion based on current game state and adds it to junkPile
     */
    public generateJunkPortion(): void {
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
            const timer = this.scene.time.addEvent({
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

    /**
     * Increments the portion number and generates a new junk portion
     */
    public generateNextPortion(): void {
        this.portionNumber++;
        this.generateJunkPortion();
    }

    /**
     * Gets the current junk pile
     * @returns The current junk pile items
     */
    public getJunkPile(): JunkPileItem[] {
        return this.junkPile;
    }
}
