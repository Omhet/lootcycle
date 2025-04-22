import { LootConfig } from "../craftModel";
import { generateLootConfig, validateLootConfig } from "./registry";

// Import all configuration files to register their items
// The order doesn't matter as each file self-registers its items

// Import chance tables
import "./chanceTables";

// Common parts
import "./recipe/bladeWeapon/parts";

// Short sword specific configurations
import "./recipe/bladeWeapon/shortSword/parts";
import "./recipe/bladeWeapon/shortSword/recipe";

// Junk
import "./junk/junk";

// Loot Details
import "./loot/shortSword/details";

// Validate the configuration
const validationIssues = validateLootConfig();
if (validationIssues.length > 0) {
  console.warn("Loot configuration validation issues:", validationIssues);
}

// Export the dynamically generated configuration
export const lootConfig: LootConfig = generateLootConfig();
