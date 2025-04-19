import { LootConfig } from "../craftModel.js";
import { generateLootConfig, validateLootConfig } from "./registry.js";

// Import all configuration files to register their items
// The order doesn't matter as each file self-registers its items

// Common parts
import "./bladeWeapon/parts.js";

// Short sword specific configurations
import "./bladeWeapon/shortSword/basicShortSwordDetails.js";
import "./bladeWeapon/shortSword/parts.js";
import "./bladeWeapon/shortSword/recipe.js";

// Validate the configuration
const validationIssues = validateLootConfig();
if (validationIssues.length > 0) {
    console.warn("Loot configuration validation issues:", validationIssues);
}

// Export the dynamically generated configuration
export const lootConfig: LootConfig = generateLootConfig();
