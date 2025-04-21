import { Durability, Rarity, RecipeDetailType } from "../../craftModel";
import { registerJunkDetail } from "../registry";

registerJunkDetail("bone", {
    suitableForRecipeDetails: [RecipeDetailType.Grip, RecipeDetailType.Pommel],
    name: "Bone",
    rarity: Rarity.Common,
    durability: Durability.Medium,
    sellPriceCoefficient: 0.5,
    temperatureCoefficient: 0.5,
});

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

registerJunkDetail("basic_short_sword_grip", {
    suitableForRecipeDetails: [RecipeDetailType.Grip],
    name: "Basic Short Sword Grip",
    rarity: Rarity.Common,
    durability: Durability.Low,
    sellPriceCoefficient: 1,
    temperatureCoefficient: 1,
});

registerJunkDetail("tree", {
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

registerJunkDetail("golden_with_emerald_pommel", {
    suitableForRecipeDetails: [RecipeDetailType.Pommel],
    name: "Golden With Emerald Short Sword Pommel",
    rarity: Rarity.Epic,
    durability: Durability.Low,
    sellPriceCoefficient: 2,
    temperatureCoefficient: 2,
});

registerJunkDetail("iron_ore", {
    suitableForRecipeDetails: [RecipeDetailType.Guard],
    name: "Iron Ore",
    rarity: Rarity.Common,
    durability: Durability.Medium,
    sellPriceCoefficient: 1,
    temperatureCoefficient: 1,
});

registerJunkDetail("silver_ore", {
    suitableForRecipeDetails: [RecipeDetailType.Guard],
    name: "Silver Ore",
    rarity: Rarity.Uncommon,
    durability: Durability.Medium,
    sellPriceCoefficient: 1.5,
    temperatureCoefficient: 1.5,
});

registerJunkDetail("gold_ore", {
    suitableForRecipeDetails: [RecipeDetailType.Guard],
    name: "Gold Ore",
    rarity: Rarity.Rare,
    durability: Durability.Low,
    sellPriceCoefficient: 2,
    temperatureCoefficient: 1,
});

registerJunkDetail("fluff-yellow", {
    suitableForRecipeDetails: [RecipeDetailType.Guard],
    name: "Fluff",
    rarity: Rarity.Common,
    durability: Durability.Low,
    sellPriceCoefficient: 1,
    temperatureCoefficient: 1,
});

registerJunkDetail("fluff-blue", {
    suitableForRecipeDetails: [RecipeDetailType.Guard],
    name: "Fluff",
    rarity: Rarity.Common,
    durability: Durability.Low,
    sellPriceCoefficient: 1,
    temperatureCoefficient: 1,
});

registerJunkDetail("fluff-green", {
    suitableForRecipeDetails: [RecipeDetailType.Guard],
    name: "Fluff",
    rarity: Rarity.Common,
    durability: Durability.Low,
    sellPriceCoefficient: 1,
    temperatureCoefficient: 1,
});
