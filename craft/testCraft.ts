import {
    craftLootItem,
    LootItem,
    LootItemTemplate,
    LootJunkItem,
} from "./craftModel.js"; // Added .js extension
import {
    formatMaterialComposition,
    getAtomReadableName,
    getMoleculeIdFromPartId,
    getMoleculeReadableName,
    getTemplateIdFromItemId,
    getTemplateReadableName,
} from "./craftUtils.js"; // Added .js extension

/**
 * Test the crafting system with different inputs
 * Assumes lootConfig.json is generated and available
 */
const testCraftingSystem = () => {
    console.log("=== CRAFTING SYSTEM TEST (using pre-generated config) ===");

    // NOTE: This test script now assumes `public/config/lootConfig.json` exists.
    // It does not generate the objects itself.
    // You would typically load the JSON in a real scenario.
    // For this standalone test, we might need to load it or mock it.

    // Placeholder: In a real test runner or environment, you'd load the JSON.
    // For simplicity here, we'll skip loading and focus on the craft function call.
    // If you run this via ts-node directly, it won't have the Phaser cache.
    console.log(
        "Skipping direct loading of lootConfig.json in this standalone test."
    );
    console.log("Run the game and press SPACE to test with loaded config.");

    // Example of how you *might* structure a test if loading the config:
    /*
    try {
        const configPath = path.join(__dirname, '../../public/config/lootConfig.json');
        const configData = fs.readFileSync(configPath, 'utf-8');
        const lootConfig = JSON.parse(configData);
        const { lootItems, lootParts, lootJunkItems } = lootConfig;

        // Get templates for testing (using static import is still fine)
        const swordTemplate = lootItemTemplateConfig[LootItemTemplateType.Sword][0];
        const availableJunkItems = Object.values(lootJunkItems);

        console.log("\n=== TEST CASE 1: SWORD WITH OPTIMAL TEMPERATURE ===");
        testCraftWithParams({
            template: swordTemplate,
            junkItems: getRandomJunkItems(availableJunkItems, 5, 10),
            temperature: 50,
            lootItems,
            lootParts,
        });

        // ... other test cases ...

    } catch (error) {
        console.error("Failed to load or parse lootConfig.json. Run `pnpm generate:loot` first.", error);
    }
    */
};

/**
 * Helper function to run a craft test with given parameters
 */
const testCraftWithParams = ({
    template,
    junkItems,
    temperature,
    lootItems,
    lootParts,
}: {
    template: LootItemTemplate;
    junkItems: LootJunkItem[];
    temperature: number;
    lootItems: Record<string, LootItem>;
    lootParts: Record<string, any>;
}) => {
    // Log inputs
    console.log("\nCrafting Inputs:");
    console.log(`- Template: ${template.name} (${template.id})`);
    console.log(`- Junk Items: ${junkItems.length} items`);
    if (junkItems.length > 0) {
        console.log("  Items:");
        // Log all junk items without slicing
        junkItems.forEach((item) => {
            const readableName = getAtomReadableName(item.atomId);
            console.log(
                `   - ${readableName} [${item.rarity}] (Degradation: ${
                    item.degradation
                }%) (Materials: ${formatMaterialComposition(
                    item.materialComposition
                )})`
            );
        });
    }
    console.log(`- Temperature: ${temperature}°C`);

    // Perform crafting
    console.log("\nCrafting...");
    const result = craftLootItem({
        lootItemTemplate: template,
        availableJunkItems: junkItems,
        temperature,
        config: { lootItems, lootParts },
    });

    // Log results
    console.log("\nCrafting Result:");
    console.log(`- Success: ${result.success}`);

    if (result.success && result.item) {
        // Show readable item name instead of just ID
        const templateId = getTemplateIdFromItemId(result.item.id);
        const templateName = getTemplateReadableName(templateId);

        console.log(`- Created Item: ${templateName} [${result.item.rarity}]`);

        // Show readable part names with their subparts and material composition
        if (result.item.subparts.length > 0) {
            console.log("  Parts:");
            result.item.subparts.forEach((partId) => {
                const part = lootParts[partId];
                const moleculeId = getMoleculeIdFromPartId(partId);
                const moleculeName = getMoleculeReadableName(moleculeId);

                // Add material composition for this part
                console.log(
                    `   - ${moleculeName} - Materials: ${formatMaterialComposition(
                        part.materialComposition
                    )}`
                );

                // List all subparts (atoms) in this part
                if (part && part.subparts && part.subparts.length > 0) {
                    console.log("     Details:");
                    part.subparts.forEach((atomId: string) => {
                        // Added type
                        const atomName = getAtomReadableName(atomId);
                        console.log(`       • ${atomName}`);
                    });
                }
            });
        }

        console.log(
            `- Overall Material Composition: ${formatMaterialComposition(
                result.item.materialComposition
            )}`
        );
        console.log(`- Quality: ${result.quality!.toFixed(2)}%`);
        console.log(`- Sell Price: ${result.sellPrice} coins`);
        console.log(
            `- Temperature Range: ${result.item.temperatureRange.min}°C - ${result.item.temperatureRange.max}°C`
        );
        console.log(
            `- Master Range: ${result.item.masterQualityTemperatureRange.min}°C - ${result.item.masterQualityTemperatureRange.max}°C`
        );
    } else if (!result.success && result.failure) {
        console.log(`- Failure Reason: ${result.failure.reason}`);
        console.log("  Try with different junk items or adjust temperature.");
    }
};

// Run the test (optional, as the main test is now in Game.ts)
// testCraftingSystem(); // Commented out to avoid running automatically
