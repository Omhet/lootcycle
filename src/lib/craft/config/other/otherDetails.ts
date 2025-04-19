import { Rarity, RecipeDetailType } from "../../craftModel";
import { registerRecipeDetailVariant } from "../registry";

registerRecipeDetailVariant(RecipeDetailType.Bone, {
    id: "other_bone",
    name: "Bone",
    assetPath: "details/other/bone.png",
    type: RecipeDetailType.Bone,
    rarity: Rarity.Common,
    sellPriceCoefficient: 0.5,
    temperatureCoefficient: 0.5,
    durabilityCoefficient: 0.5,
});

registerRecipeDetailVariant(RecipeDetailType.Gristle, {
    id: "other_gristle",
    name: "Gristle",
    assetPath: "details/other/gristle.png",
    type: RecipeDetailType.Gristle,
    rarity: Rarity.Common,
    sellPriceCoefficient: 0.5,
    temperatureCoefficient: 0.5,
    durabilityCoefficient: 0.5,
});
