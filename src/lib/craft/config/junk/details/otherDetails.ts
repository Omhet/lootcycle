import { Durability, Rarity, RecipeDetailType } from "../../../craftModel.js";
import { registerJunkDetail } from "../../registry.js";

registerJunkDetail(RecipeDetailType.Bone, {
    id: "junk_bone",
    suitableForRecipeDetails: [RecipeDetailType.Grip],
    name: "Bone",
    assetPath: "details/junk/bone.png",
    rarity: Rarity.Common,
    durability: Durability.Medium,
    sellPriceCoefficient: 0.5,
    temperatureCoefficient: 0.5,
});

registerJunkDetail(RecipeDetailType.Gristle, {
    id: "junk_gristle",
    suitableForRecipeDetails: [RecipeDetailType.Pommel],
    name: "Gristle",
    assetPath: "details/junk/gristle.png",
    rarity: Rarity.Common,
    durability: Durability.Low,
    sellPriceCoefficient: 0.5,
    temperatureCoefficient: 0.5,
});
