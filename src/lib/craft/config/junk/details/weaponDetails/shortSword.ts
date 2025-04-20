// === Recipe Detail Variants for Basic Short Sword ===

import { Durability, Rarity, RecipeDetailType } from "../../../../craftModel";
import { registerJunkDetail } from "../../../registry";

// === Bad Variants ===

registerJunkDetail(RecipeDetailType.Pommel, {
    id: "wooden_basic_short_sword_pommel",
    suitableForRecipeDetails: [RecipeDetailType.Pommel],
    name: "Wooden Basic Short Sword Pommel",
    assetPath: "details/shortSword/pommel_wooden.png",
    rarity: Rarity.Common,
    durability: Durability.Low,
    sellPriceCoefficient: 0.5,
    temperatureCoefficient: 0.5,
});

registerJunkDetail(RecipeDetailType.Guard, {
    id: "wooden_basic_short_sword_guard",
    suitableForRecipeDetails: [RecipeDetailType.Guard],
    name: "Wooden Basic Short Sword Guard",
    assetPath: "details/shortSword/guard_wooden.png",
    rarity: Rarity.Common,
    durability: Durability.Low,
    sellPriceCoefficient: 0.5,
    temperatureCoefficient: 0.5,
});

registerJunkDetail(RecipeDetailType.ShortSwordBlade, {
    id: "wooden_basic_short_sword_blade",
    suitableForRecipeDetails: [RecipeDetailType.ShortSwordBlade],
    name: "Wooden Basic Short Sword Blade",
    assetPath: "details/shortSword/blade_wooden.png",
    rarity: Rarity.Common,
    durability: Durability.Low,
    sellPriceCoefficient: 0.5,
    temperatureCoefficient: 0.5,
});

// === Good Variants ===

registerJunkDetail(RecipeDetailType.Pommel, {
    id: "iron_basic_short_sword_pommel",
    suitableForRecipeDetails: [RecipeDetailType.Pommel],
    name: "Iron Basic Short Sword Pommel",
    assetPath: "details/shortSword/pommel_iron.png",
    rarity: Rarity.Common,
    durability: Durability.Medium,
    sellPriceCoefficient: 1,
    temperatureCoefficient: 1,
});

registerJunkDetail(RecipeDetailType.Grip, {
    id: "wooden_basic_short_sword_grip",
    suitableForRecipeDetails: [RecipeDetailType.Grip],
    name: "Wooden Basic Short Sword Grip",
    assetPath: "details/shortSword/grip_wooden.png",
    rarity: Rarity.Common,
    durability: Durability.Low,
    sellPriceCoefficient: 1,
    temperatureCoefficient: 0.5,
});

registerJunkDetail(RecipeDetailType.Guard, {
    id: "iron_basic_short_sword_guard",
    suitableForRecipeDetails: [RecipeDetailType.Guard],
    name: "Iron Basic Short Sword Guard",
    assetPath: "details/shortSword/guard_iron.png",
    rarity: Rarity.Common,
    durability: Durability.Medium,
    sellPriceCoefficient: 1,
    temperatureCoefficient: 1,
});

registerJunkDetail(RecipeDetailType.ShortSwordBlade, {
    id: "iron_basic_short_sword_blade",
    suitableForRecipeDetails: [RecipeDetailType.ShortSwordBlade],
    name: "Iron Basic Short Sword Blade",
    assetPath: "details/shortSword/blade_iron.png",
    rarity: Rarity.Common,
    durability: Durability.Medium,
    sellPriceCoefficient: 1,
    temperatureCoefficient: 1,
});

// === Best Variants ===

registerJunkDetail(RecipeDetailType.Pommel, {
    id: "golden_basic_short_sword_pommel",
    suitableForRecipeDetails: [RecipeDetailType.Pommel],
    name: "Golden Basic Short Sword Pommel",
    assetPath: "details/shortSword/pommel_golden.png",
    rarity: Rarity.Rare,
    durability: Durability.High,
    sellPriceCoefficient: 2.0,
    temperatureCoefficient: 1.5,
});

registerJunkDetail(RecipeDetailType.Grip, {
    id: "golden_basic_short_sword_grip",
    suitableForRecipeDetails: [RecipeDetailType.Grip],
    name: "Golden Basic Short Sword Grip",
    assetPath: "details/shortSword/grip_golden.png",
    rarity: Rarity.Rare,
    durability: Durability.High,
    sellPriceCoefficient: 2.0,
    temperatureCoefficient: 1.5,
});

registerJunkDetail(RecipeDetailType.Guard, {
    id: "golden_basic_short_sword_guard",
    suitableForRecipeDetails: [RecipeDetailType.Guard],
    name: "Golden Basic Short Sword Guard",
    assetPath: "details/shortSword/guard_golden.png",
    rarity: Rarity.Rare,
    durability: Durability.High,
    sellPriceCoefficient: 2.0,
    temperatureCoefficient: 1.5,
});

registerJunkDetail(RecipeDetailType.ShortSwordBlade, {
    id: "golden_basic_short_sword_blade",
    suitableForRecipeDetails: [RecipeDetailType.ShortSwordBlade],
    name: "Golden Basic Short Sword Blade",
    assetPath: "details/shortSword/blade_golden.png",
    rarity: Rarity.Rare,
    durability: Durability.High,
    sellPriceCoefficient: 2.0,
    temperatureCoefficient: 1.5,
});
