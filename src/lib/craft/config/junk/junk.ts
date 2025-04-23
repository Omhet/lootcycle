import { Durability, Rarity, RecipeDetailType } from "../../craftModel";
import { registerJunkPiece } from "../registry";

registerJunkPiece("bone", {
  suitableForRecipeDetails: [RecipeDetailType.Grip, RecipeDetailType.Pommel],
  name: "Bone",
  rarity: Rarity.Common,
  durability: Durability.Medium,
  sellPriceCoefficient: 0.5,
  temperatureCoefficient: 0.5,
});

registerJunkPiece("basic_short_sword_blade", {
  suitableForRecipeDetails: [RecipeDetailType.ShortSwordBlade],
  name: "Basic Short Sword Blade",
  rarity: Rarity.Common,
  durability: Durability.Medium,
  sellPriceCoefficient: 1,
  temperatureCoefficient: 1,
});

registerJunkPiece("curved_silver_short_sword_blade", {
  suitableForRecipeDetails: [RecipeDetailType.ShortSwordBlade],
  name: "Curved Silver Short Sword Blade",
  rarity: Rarity.Uncommon,
  durability: Durability.High,
  sellPriceCoefficient: 1.5,
  temperatureCoefficient: 1.5,
});

registerJunkPiece("basic_short_sword_grip", {
  suitableForRecipeDetails: [RecipeDetailType.Grip],
  name: "Basic Short Sword Grip",
  rarity: Rarity.Common,
  durability: Durability.Low,
  sellPriceCoefficient: 1,
  temperatureCoefficient: 1,
});

registerJunkPiece("tree", {
  suitableForRecipeDetails: [RecipeDetailType.Grip],
  name: "Tree Short Sword Grip",
  rarity: Rarity.Uncommon,
  durability: Durability.Low,
  sellPriceCoefficient: 1.5,
  temperatureCoefficient: 0.5,
});

registerJunkPiece("golden_with_emerald_pommel", {
  suitableForRecipeDetails: [RecipeDetailType.Pommel],
  name: "Golden With Emerald Short Sword Pommel",
  rarity: Rarity.Epic,
  durability: Durability.Low,
  sellPriceCoefficient: 2,
  temperatureCoefficient: 2,
});

registerJunkPiece("iron_ore", {
  suitableForRecipeDetails: [RecipeDetailType.Guard],
  name: "Iron Ore",
  rarity: Rarity.Common,
  durability: Durability.Medium,
  sellPriceCoefficient: 1,
  temperatureCoefficient: 1,
});

registerJunkPiece("silver_ore", {
  suitableForRecipeDetails: [RecipeDetailType.Guard],
  name: "Silver Ore",
  rarity: Rarity.Uncommon,
  durability: Durability.Medium,
  sellPriceCoefficient: 1.5,
  temperatureCoefficient: 1.5,
});

registerJunkPiece("gold_ore", {
  suitableForRecipeDetails: [RecipeDetailType.Guard],
  name: "Gold Ore",
  rarity: Rarity.Rare,
  durability: Durability.Low,
  sellPriceCoefficient: 2,
  temperatureCoefficient: 1,
});

registerJunkPiece("fluff-yellow", {
  suitableForRecipeDetails: [],
  name: "Fluff",
  rarity: Rarity.Common,
  durability: Durability.Low,
  sellPriceCoefficient: 1,
  temperatureCoefficient: 1,
});

registerJunkPiece("fluff-blue", {
  suitableForRecipeDetails: [],
  name: "Fluff",
  rarity: Rarity.Common,
  durability: Durability.Low,
  sellPriceCoefficient: 1,
  temperatureCoefficient: 1,
});

registerJunkPiece("fluff-green", {
  suitableForRecipeDetails: [],
  name: "Fluff",
  rarity: Rarity.Common,
  durability: Durability.Low,
  sellPriceCoefficient: 1,
  temperatureCoefficient: 1,
});

registerJunkPiece("banana", {
  suitableForRecipeDetails: [],
  name: "Banana",
  rarity: Rarity.Common,
  durability: Durability.Low,
  sellPriceCoefficient: 1,
  temperatureCoefficient: 1,
});
