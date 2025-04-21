// === Recipe Detail Variants for Basic Short Sword ===

import { Durability, Rarity, RecipeDetailType } from "../../../../craftModel";
import { registerJunkDetail } from "../../../registry";

registerJunkDetail("basic_short_sword_blade", {
    suitableForRecipeDetails: [RecipeDetailType.ShortSwordBlade],
    name: "Basic Short Sword Blade",
    rarity: Rarity.Common,
    durability: Durability.Medium,
    sellPriceCoefficient: 1,
    temperatureCoefficient: 1,
});

registerJunkDetail("curved_silver_short_sword_blade", {
    suitableForRecipeDetails: [RecipeDetailType.ShortSwordBlade],
    name: "Curved Silver Short Sword Blade",
    rarity: Rarity.Uncommon,
    durability: Durability.High,
    sellPriceCoefficient: 1.5,
    temperatureCoefficient: 1.5,
});

registerJunkDetail("basic_short_sword_guard", {
    suitableForRecipeDetails: [RecipeDetailType.Guard],
    name: "Basic Short Sword Guard",
    rarity: Rarity.Common,
    durability: Durability.Medium,
    sellPriceCoefficient: 1,
    temperatureCoefficient: 1,
});

registerJunkDetail("golden_short_sword_guard", {
    suitableForRecipeDetails: [RecipeDetailType.Guard],
    name: "Golden Short Sword Guard",
    rarity: Rarity.Rare,
    durability: Durability.High,
    sellPriceCoefficient: 2,
    temperatureCoefficient: 1.5,
});

registerJunkDetail("basic_short_sword_grip", {
    suitableForRecipeDetails: [RecipeDetailType.Grip],
    name: "Basic Short Sword Grip",
    rarity: Rarity.Common,
    durability: Durability.Low,
    sellPriceCoefficient: 1,
    temperatureCoefficient: 1,
});

registerJunkDetail("tree_short_sword_grip", {
    suitableForRecipeDetails: [RecipeDetailType.Grip],
    name: "Tree Short Sword Grip",
    rarity: Rarity.Uncommon,
    durability: Durability.Low,
    sellPriceCoefficient: 1.5,
    temperatureCoefficient: 0.5,
});

registerJunkDetail("basic_short_sword_pommel", {
    suitableForRecipeDetails: [RecipeDetailType.Pommel],
    name: "Basic Short Sword Pommel",
    rarity: Rarity.Common,
    durability: Durability.Medium,
    sellPriceCoefficient: 1,
    temperatureCoefficient: 1,
});

registerJunkDetail("golden_with_emerald_short_sword_pommel", {
    suitableForRecipeDetails: [RecipeDetailType.Pommel],
    name: "Golden With Emerald Short Sword Pommel",
    rarity: Rarity.Epic,
    durability: Durability.Low,
    sellPriceCoefficient: 2,
    temperatureCoefficient: 2,
});
