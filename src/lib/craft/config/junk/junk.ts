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

// Fluff items
registerJunkPiece("yellow_fluff", {
  suitableForRecipeDetails: [],
  name: "Yellow Fluff",
  rarity: Rarity.Common,
  durability: Durability.Low,
  sellPriceCoefficient: 1,
  temperatureCoefficient: 1,
});

registerJunkPiece("blue_fluff", {
  suitableForRecipeDetails: [],
  name: "Blue Fluff",
  rarity: Rarity.Common,
  durability: Durability.Low,
  sellPriceCoefficient: 1,
  temperatureCoefficient: 1,
});

registerJunkPiece("green_fluff", {
  suitableForRecipeDetails: [],
  name: "Green Fluff",
  rarity: Rarity.Common,
  durability: Durability.Low,
  sellPriceCoefficient: 1,
  temperatureCoefficient: 1,
});

registerJunkPiece("banana_peel", {
  suitableForRecipeDetails: [],
  name: "Banana Peel",
  rarity: Rarity.Common,
  durability: Durability.Low,
  sellPriceCoefficient: 1,
  temperatureCoefficient: 1,
});

registerJunkPiece("log", {
  suitableForRecipeDetails: [RecipeDetailType.Grip],
  name: "Log",
  rarity: Rarity.Common,
  durability: Durability.Medium,
  sellPriceCoefficient: 0.8,
  temperatureCoefficient: 0.5,
});

registerJunkPiece("dead_fish", {
  suitableForRecipeDetails: [],
  name: "Dead Fish",
  rarity: Rarity.Common,
  durability: Durability.Low,
  sellPriceCoefficient: 0.5,
  temperatureCoefficient: 0.3,
});

registerJunkPiece("horse_shoe", {
  suitableForRecipeDetails: [RecipeDetailType.Guard],
  name: "Horse Shoe",
  rarity: Rarity.Common,
  durability: Durability.Medium,
  sellPriceCoefficient: 1.2,
  temperatureCoefficient: 1.5,
});

registerJunkPiece("golden_ring", {
  suitableForRecipeDetails: [RecipeDetailType.Pommel],
  name: "Golden Ring",
  rarity: Rarity.Rare,
  durability: Durability.Medium,
  sellPriceCoefficient: 2,
  temperatureCoefficient: 1.5,
});

registerJunkPiece("golden_cup", {
  suitableForRecipeDetails: [RecipeDetailType.Pommel],
  name: "Golden Cup",
  rarity: Rarity.Rare,
  durability: Durability.Medium,
  sellPriceCoefficient: 2.5,
  temperatureCoefficient: 1.5,
});

registerJunkPiece("golden_necklace", {
  suitableForRecipeDetails: [],
  name: "Golden Necklace",
  rarity: Rarity.Rare,
  durability: Durability.Low,
  sellPriceCoefficient: 2.5,
  temperatureCoefficient: 1.5,
});

registerJunkPiece("silver_cup", {
  suitableForRecipeDetails: [RecipeDetailType.Pommel],
  name: "Silver Cup",
  rarity: Rarity.Uncommon,
  durability: Durability.Medium,
  sellPriceCoefficient: 1.8,
  temperatureCoefficient: 1.3,
});

registerJunkPiece("silver_necklace", {
  suitableForRecipeDetails: [],
  name: "Silver Necklace",
  rarity: Rarity.Uncommon,
  durability: Durability.Low,
  sellPriceCoefficient: 1.8,
  temperatureCoefficient: 1.3,
});

registerJunkPiece("lollipop", {
  suitableForRecipeDetails: [],
  name: "Lollipop",
  rarity: Rarity.Common,
  durability: Durability.Low,
  sellPriceCoefficient: 0.5,
  temperatureCoefficient: 0.3,
});

registerJunkPiece("rope", {
  suitableForRecipeDetails: [RecipeDetailType.Grip],
  name: "Rope",
  rarity: Rarity.Common,
  durability: Durability.Medium,
  sellPriceCoefficient: 0.8,
  temperatureCoefficient: 0.4,
});

registerJunkPiece("saw", {
  suitableForRecipeDetails: [RecipeDetailType.ShortSwordBlade],
  name: "Saw",
  rarity: Rarity.Uncommon,
  durability: Durability.Medium,
  sellPriceCoefficient: 1.5,
  temperatureCoefficient: 1.2,
});

registerJunkPiece("bolt", {
  suitableForRecipeDetails: [RecipeDetailType.Pommel],
  name: "Bolt",
  rarity: Rarity.Common,
  durability: Durability.High,
  sellPriceCoefficient: 0.7,
  temperatureCoefficient: 1.2,
});

registerJunkPiece("shell", {
  suitableForRecipeDetails: [RecipeDetailType.Guard],
  name: "Shell",
  rarity: Rarity.Uncommon,
  durability: Durability.Medium,
  sellPriceCoefficient: 1.2,
  temperatureCoefficient: 0.6,
});

registerJunkPiece("old_shoe", {
  suitableForRecipeDetails: [],
  name: "Old Shoe",
  rarity: Rarity.Common,
  durability: Durability.Low,
  sellPriceCoefficient: 0.3,
  temperatureCoefficient: 0.4,
});

registerJunkPiece("golden_coin", {
  suitableForRecipeDetails: [RecipeDetailType.Pommel],
  name: "Golden Coin",
  rarity: Rarity.Rare,
  durability: Durability.Medium,
  sellPriceCoefficient: 1.8,
  temperatureCoefficient: 1.5,
});

registerJunkPiece("silver_coin", {
  suitableForRecipeDetails: [RecipeDetailType.Pommel],
  name: "Silver Coin",
  rarity: Rarity.Uncommon,
  durability: Durability.Medium,
  sellPriceCoefficient: 1.3,
  temperatureCoefficient: 1.2,
});

registerJunkPiece("mushroom", {
  suitableForRecipeDetails: [],
  name: "Mushroom",
  rarity: Rarity.Common,
  durability: Durability.Low,
  sellPriceCoefficient: 0.6,
  temperatureCoefficient: 0.3,
});

registerJunkPiece("button", {
  suitableForRecipeDetails: [RecipeDetailType.Pommel],
  name: "Button",
  rarity: Rarity.Common,
  durability: Durability.Low,
  sellPriceCoefficient: 0.5,
  temperatureCoefficient: 0.5,
});

registerJunkPiece("robo_hand", {
  suitableForRecipeDetails: [RecipeDetailType.Grip],
  name: "Robo Hand",
  rarity: Rarity.Rare,
  durability: Durability.High,
  sellPriceCoefficient: 2.2,
  temperatureCoefficient: 1.8,
});

registerJunkPiece("nut", {
  suitableForRecipeDetails: [RecipeDetailType.Pommel],
  name: "Nut",
  rarity: Rarity.Common,
  durability: Durability.High,
  sellPriceCoefficient: 0.7,
  temperatureCoefficient: 1.3,
});

registerJunkPiece("silver_ring", {
  suitableForRecipeDetails: [RecipeDetailType.Pommel],
  name: "Silver Ring",
  rarity: Rarity.Uncommon,
  durability: Durability.Medium,
  sellPriceCoefficient: 1.5,
  temperatureCoefficient: 1.2,
});

registerJunkPiece("deer_hoof", {
  suitableForRecipeDetails: [RecipeDetailType.Pommel],
  name: "Deer Hoof",
  rarity: Rarity.Uncommon,
  durability: Durability.Medium,
  sellPriceCoefficient: 1.2,
  temperatureCoefficient: 0.7,
});

registerJunkPiece("empty_bottle", {
  suitableForRecipeDetails: [RecipeDetailType.Grip],
  name: "Empty Bottle",
  rarity: Rarity.Common,
  durability: Durability.Low,
  sellPriceCoefficient: 0.5,
  temperatureCoefficient: 0.8,
});
