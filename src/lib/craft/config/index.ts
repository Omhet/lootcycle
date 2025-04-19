import { LootConfig } from "../craftModel";
import { generateLootConfig, validateLootConfig } from "./registry";

// Import all configuration files to register their items
// The order doesn't matter as each file self-registers its items

// Common parts
import "./bladeWeapon/parts";

// Short sword specific configurations
import "./bladeWeapon/shortSword/basicShortSwordDetails";
import "./bladeWeapon/shortSword/parts";
import "./bladeWeapon/shortSword/recipe";

// Other details
import "./other/otherDetails";
import "./other/otherParts";

// Validate the configuration
const validationIssues = validateLootConfig();
if (validationIssues.length > 0) {
    console.warn("Loot configuration validation issues:", validationIssues);
}

// Export the dynamically generated configuration
export const lootConfig: LootConfig = generateLootConfig();
