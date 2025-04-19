import {
    Rarity,
    RecipeDetailType,
    RecipeDetailVariant,
} from "../../../craftModel.js";

// === Recipe Detail Variants for wooden Short Sword ===

export const wodenShortSwordPommel: RecipeDetailVariant = {
    id: "wooden_short_sword_pommel",
    name: "Wooden Pommel",
    assetPath: "details/shortSword/pommel_wooden.png",
    type: RecipeDetailType.Pommel,
    rarity: Rarity.Common,
    sellPriceCoefficient: 1,
    temperatureCoefficient: 1,
    durabilityCoefficient: 1,
};

export const woodenShortSwordGrip: RecipeDetailVariant = {
    id: "wooden_short_sword_grip",
    name: "Wooden Grip",
    assetPath: "details/shortSword/grip_wooden.png",
    type: RecipeDetailType.Grip,
    rarity: Rarity.Common,
    sellPriceCoefficient: 1,
    temperatureCoefficient: 1,
    durabilityCoefficient: 1,
};

export const woodenShortSwordGuard: RecipeDetailVariant = {
    id: "wooden_short_sword_guard",
    name: "Wooden Guard",
    assetPath: "details/shortSword/guard_wooden.png",
    type: RecipeDetailType.Guard,
    rarity: Rarity.Common,
    sellPriceCoefficient: 1,
    temperatureCoefficient: 1,
    durabilityCoefficient: 1,
};

export const woodenShortSwordBladeDetail: RecipeDetailVariant = {
    id: "wooden_short_sword_blade_detail",
    name: "Wooden Blade Section",
    assetPath: "details/shortSword/blade_wooden.png",
    type: RecipeDetailType.ShortSwordBlade,
    rarity: Rarity.Common,
    sellPriceCoefficient: 1,
    temperatureCoefficient: 1,
    durabilityCoefficient: 1,
};

export const woodenShortSwordDetailVariants: RecipeDetailVariant[] = [
    wodenShortSwordPommel,
    woodenShortSwordGrip,
    woodenShortSwordGuard,
    woodenShortSwordBladeDetail,
];
