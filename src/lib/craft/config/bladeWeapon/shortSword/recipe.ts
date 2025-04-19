// === Recipe Item for Sword ===

import {
    ItemSubCategoryId,
    PecipePartType,
    RecipeItem,
    RecipeItemType,
} from "../../../craftModel";

export const shortSwordRecipe: RecipeItem = {
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
                localOffset: { x: 0, y: 0.5 },
                localRotationAngle: 0,
                zIndex: 1,
            },
        },
        {
            acceptType: PecipePartType.BladeWeaponHilt,
            relativeWeight: 4,
            pinpoint: {
                coords: { x: 0, y: 0 },
                localOffset: { x: 0, y: -0.5 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
    ],
    baseSellPrice: 10,
    perfectTemperature: 500,
    baseTemperatureOffset: 200,
};
