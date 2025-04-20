import {
    Durability,
    JunkDetailType,
    Rarity,
    RecipeDetailType,
} from "../../../craftModel";
import { registerJunkDetail } from "../../registry";

registerJunkDetail(JunkDetailType.Bone, {
    id: "junk_bone",
    type: JunkDetailType.Bone,
    suitableForRecipeDetails: [RecipeDetailType.Grip],
    name: "Bone",
    assetPath: "details/junk/bone.png",
    rarity: Rarity.Common,
    durability: Durability.Medium,
    sellPriceCoefficient: 0.5,
    temperatureCoefficient: 0.5,
});

registerJunkDetail(JunkDetailType.Gristle, {
    id: "junk_gristle",
    type: JunkDetailType.Gristle,
    suitableForRecipeDetails: [RecipeDetailType.Pommel],
    name: "Gristle",
    assetPath: "details/junk/gristle.png",
    rarity: Rarity.Common,
    durability: Durability.Low,
    sellPriceCoefficient: 0.5,
    temperatureCoefficient: 0.5,
});
