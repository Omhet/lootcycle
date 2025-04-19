import { Rarity, RecipeDetailType } from "../../../craftModel.js";
import { registerRecipeDetailVariant } from "../../registry.js";

// === Recipe Detail Variants for Basic Short Sword ===

// === Bad Variants ===

// Register wooden pommel variant
registerRecipeDetailVariant(RecipeDetailType.Pommel, {
    id: "wooden_basic_short_sword_pommel",
    name: "Wooden Basic Short Sword Pommel",
    assetPath: "details/shortSword/pommel_wooden.png",
    type: RecipeDetailType.Pommel,
    rarity: Rarity.Common,
    sellPriceCoefficient: 0.5,
    temperatureCoefficient: 0.5,
    durabilityCoefficient: 0.5,
});

// Register wooden guard variant
registerRecipeDetailVariant(RecipeDetailType.Guard, {
    id: "wooden_basic_short_sword_guard",
    name: "Wooden Basic Short Sword Guard",
    assetPath: "details/shortSword/guard_wooden.png",
    type: RecipeDetailType.Guard,
    rarity: Rarity.Common,
    sellPriceCoefficient: 0.5,
    temperatureCoefficient: 0.5,
    durabilityCoefficient: 0.5,
});

// Register wooden blade variant
registerRecipeDetailVariant(RecipeDetailType.ShortSwordBlade, {
    id: "wooden_basic_short_sword_blade",
    name: "Wooden Basic Short Sword Blade",
    assetPath: "details/shortSword/blade_wooden.png",
    type: RecipeDetailType.ShortSwordBlade,
    rarity: Rarity.Common,
    sellPriceCoefficient: 0.5,
    temperatureCoefficient: 0.5,
    durabilityCoefficient: 0.5,
});

// === Good Variants ===

// Register iron pommel variant
registerRecipeDetailVariant(RecipeDetailType.Pommel, {
    id: "iron_basic_short_sword_pommel",
    name: "Iron Basic Short Sword Pommel",
    assetPath: "details/shortSword/pommel_iron.png",
    type: RecipeDetailType.Pommel,
    rarity: Rarity.Common,
    sellPriceCoefficient: 1,
    temperatureCoefficient: 1,
    durabilityCoefficient: 1,
});

// Register wooden grip variant
registerRecipeDetailVariant(RecipeDetailType.Grip, {
    id: "wooden_basic_short_sword_grip",
    name: "Wooden Basic Short Sword Grip",
    assetPath: "details/shortSword/grip_wooden.png",
    type: RecipeDetailType.Grip,
    rarity: Rarity.Common,
    sellPriceCoefficient: 1,
    temperatureCoefficient: 0.5,
    durabilityCoefficient: 0.5,
});

// Register iron guard variant
registerRecipeDetailVariant(RecipeDetailType.Guard, {
    id: "iron_basic_short_sword_guard",
    name: "Iron Basic Short Sword Guard",
    assetPath: "details/shortSword/guard_iron.png",
    type: RecipeDetailType.Guard,
    rarity: Rarity.Common,
    sellPriceCoefficient: 1,
    temperatureCoefficient: 1,
    durabilityCoefficient: 1,
});

// Register iron blade variant
registerRecipeDetailVariant(RecipeDetailType.ShortSwordBlade, {
    id: "iron_basic_short_sword_blade",
    name: "Iron Basic Short Sword Blade",
    assetPath: "details/shortSword/blade_iron.png",
    type: RecipeDetailType.ShortSwordBlade,
    rarity: Rarity.Common,
    sellPriceCoefficient: 1,
    temperatureCoefficient: 1,
    durabilityCoefficient: 1,
});

// === Best Variants ===

// Register golden pommel variant
registerRecipeDetailVariant(RecipeDetailType.Pommel, {
    id: "golden_basic_short_sword_pommel",
    name: "Golden Basic Short Sword Pommel",
    assetPath: "details/shortSword/pommel_golden.png",
    type: RecipeDetailType.Pommel,
    rarity: Rarity.Rare,
    sellPriceCoefficient: 2.0,
    temperatureCoefficient: 1.5,
    durabilityCoefficient: 1.5,
});

// Register golden grip variant
registerRecipeDetailVariant(RecipeDetailType.Grip, {
    id: "golden_basic_short_sword_grip",
    name: "Golden Basic Short Sword Grip",
    assetPath: "details/shortSword/grip_golden.png",
    type: RecipeDetailType.Grip,
    rarity: Rarity.Rare,
    sellPriceCoefficient: 2.0,
    temperatureCoefficient: 1.5,
    durabilityCoefficient: 1.5,
});

// Register golden guard variant
registerRecipeDetailVariant(RecipeDetailType.Guard, {
    id: "golden_basic_short_sword_guard",
    name: "Golden Basic Short Sword Guard",
    assetPath: "details/shortSword/guard_golden.png",
    type: RecipeDetailType.Guard,
    rarity: Rarity.Rare,
    sellPriceCoefficient: 2.0,
    temperatureCoefficient: 1.5,
    durabilityCoefficient: 1.5,
});

// Register golden blade variant
registerRecipeDetailVariant(RecipeDetailType.ShortSwordBlade, {
    id: "golden_basic_short_sword_blade",
    name: "Golden Basic Short Sword Blade",
    assetPath: "details/shortSword/blade_golden.png",
    type: RecipeDetailType.ShortSwordBlade,
    rarity: Rarity.Rare,
    sellPriceCoefficient: 2.0,
    temperatureCoefficient: 1.5,
    durabilityCoefficient: 1.5,
});
