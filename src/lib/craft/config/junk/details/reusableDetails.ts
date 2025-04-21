import { Durability, Rarity, RecipeDetailType } from "../../../craftModel";
import { registerJunkDetail } from "../../registry";

registerJunkDetail("bone", {
    suitableForRecipeDetails: [RecipeDetailType.Grip, RecipeDetailType.Pommel],
    name: "Bone",
    rarity: Rarity.Common,
    durability: Durability.Medium,
    sellPriceCoefficient: 0.5,
    temperatureCoefficient: 0.5,
});
