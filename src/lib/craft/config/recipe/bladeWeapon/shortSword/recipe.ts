import {
    ItemSubCategoryId,
    PecipePartType,
    RecipeItemType,
} from "../../../../craftModel";
import { registerRecipeItem } from "../../../registry";

// === Recipe Item for Sword ===

registerRecipeItem(RecipeItemType.BladeWeapon, {
    id: "short_sword",
    subCategory: ItemSubCategoryId.MeleeWeapon,
    type: RecipeItemType.BladeWeapon,
    name: "Short Sword",
    sockets: [
        {
            acceptType: PecipePartType.ShortSwordBlade,
            relativeWeight: 6,
            pinpoint: {
                coords: { x: 0, y: 0 },
                localOffset: { x: 0, y: -0.5 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
        {
            acceptType: PecipePartType.BladeWeaponHilt,
            relativeWeight: 4,
            pinpoint: {
                coords: { x: 0, y: 0 },
                localOffset: { x: 0, y: 0.5 },
                localRotationAngle: 0,
                zIndex: 1,
            },
        },
    ],
    baseSellPrice: 10,
    perfectTemperature: 500,
    baseTemperatureOffset: 200,
});
