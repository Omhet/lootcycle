import {
    Rarity,
    RecipeDetailType,
    RecipeDetailVariant,
} from "../../../craftModel.js";

// === Recipe Detail Variants for Basic Short Sword ===

export const basicShortSwordPommel: RecipeDetailVariant = {
    id: "basic_short_sword_pommel",
    name: "Basic Pommel",
    assetPath: "details/shortSword/pommel_basic.png",
    type: RecipeDetailType.Pommel,
    rarity: Rarity.Common,
    sellPriceCoefficient: 1,
    temperatureCoefficient: 1,
    durabilityCoefficient: 1,
};

export const basicShortSwordGrip: RecipeDetailVariant = {
    id: "basic_short_sword_grip",
    name: "Basic Grip",
    assetPath: "details/shortSword/grip_basic.png",
    type: RecipeDetailType.Grip,
    rarity: Rarity.Common,
    sellPriceCoefficient: 1,
    temperatureCoefficient: 1,
    durabilityCoefficient: 1,
};

export const basicShortSwordGuard: RecipeDetailVariant = {
    id: "basic_short_sword_guard",
    name: "Basic Guard",
    assetPath: "details/shortSword/guard_basic.png",
    type: RecipeDetailType.Guard,
    rarity: Rarity.Common,
    sellPriceCoefficient: 1,
    temperatureCoefficient: 1,
    durabilityCoefficient: 1,
};

export const basicShortSwordBladeDetail: RecipeDetailVariant = {
    id: "basic_short_sword_blade_detail",
    name: "Basic Blade Section",
    assetPath: "details/shortSword/blade_basic.png",
    type: RecipeDetailType.ShortSwordBlade,
    rarity: Rarity.Common,
    sellPriceCoefficient: 1,
    temperatureCoefficient: 1,
    durabilityCoefficient: 1,
};

export const basicShortSwordDetailVariants: RecipeDetailVariant[] = [
    basicShortSwordPommel,
    basicShortSwordGrip,
    basicShortSwordGuard,
    basicShortSwordBladeDetail,
];
