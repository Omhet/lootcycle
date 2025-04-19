import {
    Rarity,
    RecipeDetailType,
    RecipeDetailVariant,
} from "../../../craftModel.js";

// === Recipe Detail Variants for Basic Short Sword ===

// === Bad Variants ===

export const wodenShortSwordPommel: RecipeDetailVariant = {
    id: "wooden_short_sword_pommel",
    name: "Wooden Pommel",
    assetPath: "details/shortSword/pommel_wooden.png",
    type: RecipeDetailType.Pommel,
    rarity: Rarity.Common,
    sellPriceCoefficient: 0.5,
    temperatureCoefficient: 0.5,
    durabilityCoefficient: 0.5,
};

export const woodenShortSwordGuard: RecipeDetailVariant = {
    id: "wooden_short_sword_guard",
    name: "Wooden Guard",
    assetPath: "details/shortSword/guard_wooden.png",
    type: RecipeDetailType.Guard,
    rarity: Rarity.Common,
    sellPriceCoefficient: 0.5,
    temperatureCoefficient: 0.5,
    durabilityCoefficient: 0.5,
};

export const woodenShortSwordBlade: RecipeDetailVariant = {
    id: "wooden_short_sword_blade",
    name: "Wooden Short Sword Blade",
    assetPath: "details/shortSword/blade_wooden.png",
    type: RecipeDetailType.ShortSwordBlade,
    rarity: Rarity.Common,
    sellPriceCoefficient: 0.5,
    temperatureCoefficient: 0.5,
    durabilityCoefficient: 0.5,
};

// === Good Variants ===

// e.g. Iron Pommel, Wooden Grip, Iron Guard, Iron Blade
export const ironShortSwordPommel: RecipeDetailVariant = {
    id: "iron_short_sword_pommel",
    name: "Iron Pommel",
    assetPath: "details/shortSword/pommel_iron.png",
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
    temperatureCoefficient: 0.5,
    durabilityCoefficient: 0.5,
};

export const ironShortSwordGuard: RecipeDetailVariant = {
    id: "iron_short_sword_guard",
    name: "Iron Guard",
    assetPath: "details/shortSword/guard_iron.png",
    type: RecipeDetailType.Guard,
    rarity: Rarity.Common,
    sellPriceCoefficient: 1,
    temperatureCoefficient: 1,
    durabilityCoefficient: 1,
};

export const ironShortSwordBlade: RecipeDetailVariant = {
    id: "iron_short_sword_blade_detail",
    name: "Iron Short Sword Blade",
    assetPath: "details/shortSword/blade_iron.png",
    type: RecipeDetailType.ShortSwordBlade,
    rarity: Rarity.Common,
    sellPriceCoefficient: 1,
    temperatureCoefficient: 1,
    durabilityCoefficient: 1,
};

// === Best Variants ===

// TODO: Add best variants for each part

export const woodenShortSwordDetailVariants: RecipeDetailVariant[] = [
    wodenShortSwordPommel,
    woodenShortSwordGrip,
    woodenShortSwordGuard,
    woodenShortSwordBlade,
];
