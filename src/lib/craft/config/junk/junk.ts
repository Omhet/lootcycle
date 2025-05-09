import { Durability, Rarity, RecipeDetailType } from "../../craftModel";
import { registerJunkPiece } from "../registry";

registerJunkPiece("bone", {
  suitableForRecipeDetails: [RecipeDetailType.AxeHandle],
  name: "Bone",
  rarity: Rarity.Common,
  durability: Durability.Medium,
  sellPriceCoefficient: 1.5,
  temperatureCoefficient: 1.5,
});

registerJunkPiece("log", {
  suitableForRecipeDetails: [
    RecipeDetailType.Grip,
    RecipeDetailType.Guard,
    RecipeDetailType.Pommel,
    RecipeDetailType.ShortSwordBlade,
    RecipeDetailType.AxeHandle,
    RecipeDetailType.AxeHead,
  ],
  name: "Log",
  rarity: Rarity.Common,
  durability: Durability.Medium,
  sellPriceCoefficient: 1.8,
  temperatureCoefficient: 1.5,
});

registerJunkPiece("horse_shoe", {
  suitableForRecipeDetails: [RecipeDetailType.Guard],
  name: "Horse Shoe",
  rarity: Rarity.Common,
  durability: Durability.Medium,
  sellPriceCoefficient: 2.2,
  temperatureCoefficient: 2.5,
});

registerJunkPiece("golden_ring", {
  suitableForRecipeDetails: [RecipeDetailType.Pommel],
  name: "Golden Ring",
  rarity: Rarity.Rare,
  durability: Durability.Medium,
  sellPriceCoefficient: 4,
  temperatureCoefficient: 2.5,
});

registerJunkPiece("golden_cup", {
  suitableForRecipeDetails: [
    RecipeDetailType.Grip,
    RecipeDetailType.Guard,
    RecipeDetailType.ShortSwordBlade,
    RecipeDetailType.AxeHandle,
    RecipeDetailType.AxeHead,
  ],
  name: "Golden Cup",
  rarity: Rarity.Rare,
  durability: Durability.Medium,
  sellPriceCoefficient: 3.5,
  temperatureCoefficient: 2.5,
});

registerJunkPiece("golden_necklace", {
  suitableForRecipeDetails: [
    RecipeDetailType.Grip,
    RecipeDetailType.Guard,
    RecipeDetailType.ShortSwordBlade,
    RecipeDetailType.AxeHandle,
    RecipeDetailType.AxeHead,
  ],
  name: "Golden Necklace",
  rarity: Rarity.Rare,
  durability: Durability.Low,
  sellPriceCoefficient: 3.5,
  temperatureCoefficient: 2.5,
});

registerJunkPiece("silver_cup", {
  suitableForRecipeDetails: [
    RecipeDetailType.Grip,
    RecipeDetailType.Guard,
    RecipeDetailType.ShortSwordBlade,
    RecipeDetailType.AxeHandle,
    RecipeDetailType.AxeHead,
  ],
  name: "Silver Cup",
  rarity: Rarity.Uncommon,
  durability: Durability.Medium,
  sellPriceCoefficient: 2.8,
  temperatureCoefficient: 2.3,
});

registerJunkPiece("silver_necklace", {
  suitableForRecipeDetails: [
    RecipeDetailType.Grip,
    RecipeDetailType.Guard,
    RecipeDetailType.ShortSwordBlade,
    RecipeDetailType.AxeHandle,
    RecipeDetailType.AxeHead,
  ],
  name: "Silver Necklace",
  rarity: Rarity.Uncommon,
  durability: Durability.Low,
  sellPriceCoefficient: 2.8,
  temperatureCoefficient: 2.3,
});

registerJunkPiece("lollipop", {
  suitableForRecipeDetails: [RecipeDetailType.Pommel],
  name: "Lollipop",
  rarity: Rarity.Common,
  durability: Durability.Low,
  sellPriceCoefficient: 1.5,
  temperatureCoefficient: 1.3,
});

registerJunkPiece("rope", {
  suitableForRecipeDetails: [RecipeDetailType.Grip, RecipeDetailType.AxeHandle],
  name: "Rope",
  rarity: Rarity.Common,
  durability: Durability.Medium,
  sellPriceCoefficient: 1.8,
  temperatureCoefficient: 1.4,
});

registerJunkPiece("saw", {
  suitableForRecipeDetails: [RecipeDetailType.ShortSwordBlade],
  name: "Saw",
  rarity: Rarity.Uncommon,
  durability: Durability.Medium,
  sellPriceCoefficient: 2.5,
  temperatureCoefficient: 2.2,
});

registerJunkPiece("shell", {
  suitableForRecipeDetails: [RecipeDetailType.Pommel, RecipeDetailType.AxeHead],
  name: "Shell",
  rarity: Rarity.Uncommon,
  durability: Durability.Medium,
  sellPriceCoefficient: 2.2,
  temperatureCoefficient: 1.6,
});

registerJunkPiece("golden_coin", {
  suitableForRecipeDetails: [
    RecipeDetailType.Grip,
    RecipeDetailType.Guard,
    RecipeDetailType.ShortSwordBlade,
    RecipeDetailType.AxeHandle,
    RecipeDetailType.AxeHead,
  ],
  name: "Golden Coin",
  rarity: Rarity.Rare,
  durability: Durability.Medium,
  sellPriceCoefficient: 3.5,
  temperatureCoefficient: 2.5,
});

registerJunkPiece("silver_coin", {
  suitableForRecipeDetails: [
    RecipeDetailType.Grip,
    RecipeDetailType.Guard,
    RecipeDetailType.ShortSwordBlade,
    RecipeDetailType.AxeHandle,
    RecipeDetailType.AxeHead,
  ],
  name: "Silver Coin",
  rarity: Rarity.Uncommon,
  durability: Durability.Medium,
  sellPriceCoefficient: 2.8,
  temperatureCoefficient: 2.2,
});

registerJunkPiece("button", {
  suitableForRecipeDetails: [RecipeDetailType.Pommel],
  name: "Button",
  rarity: Rarity.Common,
  durability: Durability.Low,
  sellPriceCoefficient: 1.5,
  temperatureCoefficient: 1.5,
});

registerJunkPiece("robo_hand", {
  suitableForRecipeDetails: [RecipeDetailType.AxeHandle],
  name: "Robo Hand",
  rarity: Rarity.Rare,
  durability: Durability.High,
  sellPriceCoefficient: 3.2,
  temperatureCoefficient: 2.8,
});

registerJunkPiece("nut", {
  suitableForRecipeDetails: [RecipeDetailType.Pommel],
  name: "Nut",
  rarity: Rarity.Common,
  durability: Durability.High,
  sellPriceCoefficient: 1.7,
  temperatureCoefficient: 2.3,
});

registerJunkPiece("silver_ring", {
  suitableForRecipeDetails: [RecipeDetailType.Pommel],
  name: "Silver Ring",
  rarity: Rarity.Uncommon,
  durability: Durability.Medium,
  sellPriceCoefficient: 3,
  temperatureCoefficient: 2.2,
});

registerJunkPiece("deer_hoof", {
  suitableForRecipeDetails: [RecipeDetailType.AxeHandle],
  name: "Deer Hoof",
  rarity: Rarity.Uncommon,
  durability: Durability.Medium,
  sellPriceCoefficient: 2.2,
  temperatureCoefficient: 1.7,
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
