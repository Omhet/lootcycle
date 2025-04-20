import { Scene } from "phaser";
import { lootConfig } from "../../lib/craft/config";
import {
    JunkDetail,
    RecipeItemId,
    RecipeItemType,
} from "../../lib/craft/craftModel";
import { getJunkPortion } from "../../lib/craft/getJunkPortion";
import { EventBus } from "../EventBus";

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    container: Phaser.GameObjects.Container;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;

    // Game state
    private portionNumber: number = 1;
    private junkPile: JunkDetail[] = []; // Total accumulated junk collection

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

        // Add text to display junk portion info
        this.gameText = this.add.text(
            -this.cameras.main.width / 2 + 20,
            -this.cameras.main.height / 2 + 20,
            "",
            {
                font: "16px Arial",
                color: "#ffffff",
            }
        );
        this.gameText.setDepth(10);
        this.container.add(this.gameText);

        // Add keyboard input handling
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

        // Add new junk to the junkPile
        this.junkPile.push(...newJunkPortion);

        // Update the UI to show information about the current junkPile and latest portion
        this.displayJunkInfo(newJunkPortion);

        console.log(
            `Generated junk portion #${this.portionNumber}:`,
            newJunkPortion
        );
        console.log(`Total junk pile size: ${this.junkPile.length}`);
        console.log(`Using recipe IDs:`, recipeIds);
    }

    /**
     * Updates the UI to display information about the junk pile and latest portion
     * @param latestPortion The most recently generated junk portion
     */
    private displayJunkInfo(latestPortion: JunkDetail[]): void {
        if (!this.gameText) return;

        const portionSize = latestPortion.length;
        const pileSize = this.junkPile.length;

        // Group items by quality and rarity for display
        const qualityCount = new Map<string, number>();
        const rarityCount = new Map<string, number>();

        // Count stats for the latest portion only
        latestPortion.forEach((item) => {
            // Count by quality (based on sell price coefficient)
            let quality = "Unknown";
            const price = item.sellPriceCoefficient;

            if (price < 0.5) quality = "Worst";
            else if (price < 1.0) quality = "Bad";
            else if (price < 1.5) quality = "Good";
            else if (price < 2.0) quality = "Better";
            else quality = "Best";

            qualityCount.set(quality, (qualityCount.get(quality) || 0) + 1);

            // Count by rarity
            const rarity = item.rarity;
            rarityCount.set(rarity, (rarityCount.get(rarity) || 0) + 1);
        });

        // Build display text
        let displayText = `Junk Portion #${this.portionNumber}\n`;
        displayText += `Latest Portion Items: ${portionSize}\n`;
        displayText += `Total Junk Pile: ${pileSize} items\n\n`;

        displayText += `Latest Portion Quality:\n`;
        qualityCount.forEach((count, quality) => {
            displayText += `${quality}: ${count} (${Math.round(
                (count / portionSize) * 100
            )}%)\n`;
        });

        displayText += `\nLatest Portion Rarity:\n`;
        rarityCount.forEach((count, rarity) => {
            displayText += `${rarity}: ${count} (${Math.round(
                (count / portionSize) * 100
            )}%)\n`;
        });

        displayText += `\nPress ENTER to get next portion`;

        this.gameText.setText(displayText);
    }
}
