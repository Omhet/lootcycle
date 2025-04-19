import { Scene } from "phaser";
import { EventBus } from "../EventBus";

// Import crafting functions and types
import { lootConfig } from "../../lib/craft/config/index.js";
import {
    CraftingResult,
    craftLootItem,
    craftLootItemParams,
} from "../../lib/craft/craftLootItem.js";
import {
    LootAtomId,
    LootItemTemplateType,
    LootJunkItem,
    MaterialId,
    Rarity,
} from "../../lib/craft/craftModel.js";

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    container: Phaser.GameObjects.Container;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;

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
        this.container.add(this.background); // Add to container

        // --- Crafting Test Setup ---
        this.input.keyboard?.on("keydown-ENTER", () => {
            console.log("Enter key pressed, attempting to craft...");

            // 1. Get the template (assuming sword exists and has at least one entry)
            const swordTemplate =
                lootConfig.lootItemTemplates[LootItemTemplateType.Sword]?.[0];
            if (!swordTemplate) {
                console.error("Sword template not found in config!");
                return;
            }

            // 2. Create some sample junk items
            const sampleJunk: LootJunkItem[] = [
                {
                    id: "junk_1",
                    atomId: "basic_pommel" as LootAtomId, // Use an existing atom ID from config
                    materialComposition: [
                        { materialId: "copper" as MaterialId, percentage: 80 },
                        { materialId: "iron" as MaterialId, percentage: 20 },
                    ],
                    rarity: Rarity.Common,
                    degradation: 30,
                    durability: 50, // Example value
                },
                {
                    id: "junk_2",
                    atomId: "basic_grip" as LootAtomId, // Use an existing atom ID
                    materialComposition: [
                        { materialId: "pine" as MaterialId, percentage: 100 },
                    ],
                    rarity: Rarity.Uncommon,
                    degradation: 10,
                    durability: 70, // Example value
                },
                {
                    id: "junk_3",
                    atomId: "basic_guard" as LootAtomId, // Use an existing atom ID
                    materialComposition: [
                        { materialId: "iron" as MaterialId, percentage: 100 },
                    ],
                    rarity: Rarity.Common,
                    degradation: 50,
                    durability: 60, // Example value
                },
                {
                    id: "junk_4",
                    atomId: "basic_blade_atom" as LootAtomId, // Use an existing atom ID
                    materialComposition: [
                        { materialId: "iron" as MaterialId, percentage: 70 },
                        { materialId: "silver" as MaterialId, percentage: 30 },
                    ],
                    rarity: Rarity.Rare,
                    degradation: 5,
                    durability: 85, // Example value
                },
                {
                    id: "junk_5",
                    atomId: "basic_blade_atom" as LootAtomId, // Use an existing atom ID
                    materialComposition: [
                        { materialId: "iron" as MaterialId, percentage: 90 },
                        { materialId: "copper" as MaterialId, percentage: 10 },
                    ],
                    rarity: Rarity.Uncommon,
                    degradation: 25,
                    durability: 75, // Example value
                },
            ];

            // 3. Define a temperature
            const craftingTemperature = 75; // Example temperature

            // 4. Prepare parameters
            const params: craftLootItemParams = {
                lootItemTemplate: swordTemplate,
                junkItems: sampleJunk,
                temperature: craftingTemperature,
                config: lootConfig, // Pass the imported config
            };

            // 5. Call the crafting function
            const result: CraftingResult = craftLootItem(params);

            // 6. Log the result
            if (result.success) {
                console.log("Crafting Successful!", result.item);
            } else {
                console.error("Crafting Failed:", result.failure);
            }
        });
        // --- End Crafting Test Setup ---

        EventBus.emit("current-scene-ready", this);
    }
}
