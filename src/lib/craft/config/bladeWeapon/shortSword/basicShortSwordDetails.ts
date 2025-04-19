import {
    Rarity,
    RecipeDetailType,
    RecipeDetailVariant,
} from "../../../craftModel.js";

// === Recipe Detail Variants for Basic Short Sword ===

// === Bad Variants ===

export const wodenBasicShortSwordPommel: RecipeDetailVariant = {
    id: "wooden_basic_short_sword_pommel",
    name: "Wooden Basic Short Sword Pommel",
    assetPath: "details/shortSword/pommel_wooden.png",
    type: RecipeDetailType.Pommel,
    rarity: Rarity.Common,
    sellPriceCoefficient: 0.5,
    temperatureCoefficient: 0.5,
    durabilityCoefficient: 0.5,
};

export const woodenBasicShortSwordGuard: RecipeDetailVariant = {
    id: "wooden_basic_short_sword_guard",
    name: "Wooden Basic Short Sword Guard",
    assetPath: "details/shortSword/guard_wooden.png",
    type: RecipeDetailType.Guard,
    rarity: Rarity.Common,
    sellPriceCoefficient: 0.5,
    temperatureCoefficient: 0.5,
    durabilityCoefficient: 0.5,
};

export const woodenBasicShortSwordBlade: RecipeDetailVariant = {
    id: "wooden_basic_short_sword_blade",
    name: "Wooden Basic Short Sword Blade",
    assetPath: "details/shortSword/blade_wooden.png",
    type: RecipeDetailType.ShortSwordBlade,
    rarity: Rarity.Common,
    sellPriceCoefficient: 0.5,
    temperatureCoefficient: 0.5,
    durabilityCoefficient: 0.5,
};

// === Good Variants ===

// e.g. Iron Pommel, Wooden Grip, Iron Guard, Iron Blade
export const ironBasicShortSwordPommel: RecipeDetailVariant = {
    id: "iron_basic_short_sword_pommel",
    name: "Iron Basic Short Sword Pommel",
    assetPath: "details/shortSword/pommel_iron.png",
    type: RecipeDetailType.Pommel,
    rarity: Rarity.Common,
    sellPriceCoefficient: 1,
    temperatureCoefficient: 1,
    durabilityCoefficient: 1,
};

export const woodenBasicShortSwordGrip: RecipeDetailVariant = {
    id: "wooden_basic_short_sword_grip",
    name: "Wooden Basic Short Sword Grip",
    assetPath: "details/shortSword/grip_wooden.png",
    type: RecipeDetailType.Grip,
    rarity: Rarity.Common,
    sellPriceCoefficient: 1,
    temperatureCoefficient: 0.5,
    durabilityCoefficient: 0.5,
};

export const ironBasicShortSwordGuard: RecipeDetailVariant = {
    id: "iron_basic_short_sword_guard",
    name: "Iron Basic Short Sword Guard",
    assetPath: "details/shortSword/guard_iron.png",
    type: RecipeDetailType.Guard,
    rarity: Rarity.Common,
    sellPriceCoefficient: 1,
    temperatureCoefficient: 1,
    durabilityCoefficient: 1,
};

export const ironBasicShortSwordBlade: RecipeDetailVariant = {
    id: "iron_basic_short_sword_blade",
    name: "Iron Basic Short Sword Blade",
    assetPath: "details/shortSword/blade_iron.png",
    type: RecipeDetailType.ShortSwordBlade,
    rarity: Rarity.Common,
    sellPriceCoefficient: 1,
    temperatureCoefficient: 1,
    durabilityCoefficient: 1,
};

// === Best Variants ===

export const goldenBasicShortSwordPommel: RecipeDetailVariant = {
    id: "golden_basic_short_sword_pommel",
    name: "Golden Basic Short Sword Pommel",
    assetPath: "details/shortSword/pommel_golden.png",
    type: RecipeDetailType.Pommel,
    rarity: Rarity.Rare,
    sellPriceCoefficient: 2.0,
    temperatureCoefficient: 1.5,
    durabilityCoefficient: 1.5,
};

export const goldenBasicShortSwordGrip: RecipeDetailVariant = {
    id: "golden_basic_short_sword_grip",
    name: "Golden Basic Short Sword Grip",
    assetPath: "details/shortSword/grip_golden.png",
    type: RecipeDetailType.Grip,
    rarity: Rarity.Rare,
    sellPriceCoefficient: 2.0,
    temperatureCoefficient: 1.5,
    durabilityCoefficient: 1.5,
};

export const goldenBasicShortSwordGuard: RecipeDetailVariant = {
    id: "golden_basic_short_sword_guard",
    name: "Golden Basic Short Sword Guard",
    assetPath: "details/shortSword/guard_golden.png",
    type: RecipeDetailType.Guard,
    rarity: Rarity.Rare,
    sellPriceCoefficient: 2.0,
    temperatureCoefficient: 1.5,
    durabilityCoefficient: 1.5,
};

export const goldenBasicShortSwordBlade: RecipeDetailVariant = {
    id: "golden_basic_short_sword_blade",
    name: "Golden Basic Short Sword Blade",
    assetPath: "details/shortSword/blade_golden.png",
    type: RecipeDetailType.ShortSwordBlade,
    rarity: Rarity.Rare,
    sellPriceCoefficient: 2.0,
    temperatureCoefficient: 1.5,
    durabilityCoefficient: 1.5,
};

export const woodenBasicShortSwordDetailVariants: RecipeDetailVariant[] = [
    wodenBasicShortSwordPommel,
    woodenBasicShortSwordGrip,
    woodenBasicShortSwordGuard,
    woodenBasicShortSwordBlade,
];
