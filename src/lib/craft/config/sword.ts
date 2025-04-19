import {
    ItemSubCategoryId,
    PecipePart,
    PecipePartType,
    RecipeDetailType,
    RecipeDetailVariant,
    RecipeItem,
    RecipeItemType,
} from "../craftModel.js";

// === Recipe Details for Sword ===

export const basicPommel: RecipeDetailVariant = {
    id: "basic_pommel",
    detailId: "pommel_basic",
    name: "Basic Pommel",
    assetPath: "atoms/pommel_basic.png",
};

export const basicGrip: RecipeDetailVariant = {
    id: "basic_grip",
    detailId: "grip_basic",
    name: "Basic Grip",
    assetPath: "atoms/grip_basic.png",
};

export const basicGuard: RecipeDetailVariant = {
    id: "basic_guard",
    detailId: "guard_basic",
    name: "Basic Guard",
    assetPath: "atoms/guard_basic.png",
};

export const basicBladeDetail: RecipeDetailVariant = {
    id: "basic_blade_detail",
    detailId: "blade_basic",
    name: "Basic Blade Section",
    assetPath: "atoms/blade_basic.png",
};

// Export all recipe detail variants defined in this file
export const swordDetailVariants: RecipeDetailVariant[] = [
    basicPommel,
    basicGrip,
    basicGuard,
    basicBladeDetail,
];

// === Recipe Parts for Sword ===

export const basicSwordHilt: PecipePart = {
    id: "basic_sword_hilt",
    type: PecipePartType.Hilt,
    name: "Basic Sword Hilt",
    sockets: [
        {
            acceptType: RecipeDetailType.Pommel,
            relativeWeight: 1,
            pinpoint: {
                coords: { x: 0, y: 5 },
                localOffset: { x: 0, y: 0 },
                localRotationAngle: 0,
                zIndex: 1,
            },
        },
        {
            acceptType: RecipeDetailType.Grip,
            relativeWeight: 2,
            pinpoint: {
                coords: { x: 0, y: 20 },
                localOffset: { x: 0, y: 0 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
        {
            acceptType: RecipeDetailType.Guard,
            relativeWeight: 1.5,
            pinpoint: {
                coords: { x: 0, y: 40 },
                localOffset: { x: 0, y: 0 },
                localRotationAngle: 0,
                zIndex: 2,
            },
        },
    ],
};

export const basicSwordBlade: PecipePart = {
    id: "basic_sword_blade",
    type: PecipePartType.ShortSwordBlade,
    name: "Basic Sword Blade",
    sockets: [
        {
            acceptType: RecipeDetailType.ShortSwordBlade,
            relativeWeight: 5,
            pinpoint: {
                coords: { x: 0, y: 100 },
                localOffset: { x: 0, y: 0 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
    ],
};

// Export all recipe parts defined in this file
export const swordParts: PecipePart[] = [basicSwordHilt, basicSwordBlade];

// === Recipe Item for Sword ===

export const swordRecipe: RecipeItem = {
    id: "basic_sword",
    subCategory: ItemSubCategoryId.MeleeWeapon,
    type: RecipeItemType.Blade,
    name: "Basic Sword",
    sockets: [
        {
            acceptType: PecipePartType.Hilt,
            relativeWeight: 3,
            pinpoint: {
                coords: { x: 100, y: 300 },
                localOffset: { x: 0, y: 0 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
        {
            acceptType: PecipePartType.ShortSwordBlade,
            relativeWeight: 5,
            pinpoint: {
                coords: { x: 100, y: 250 },
                localOffset: { x: 0, y: -50 },
                localRotationAngle: 0,
                zIndex: 1,
            },
        },
    ],
    baseSellPrice: 100,
    perfectTemperature: 1000, // In Celsius
    baseTemperatureOffset: 200, // In Celsius
};

// Export all recipe items defined in this file
export const swordRecipes: RecipeItem[] = [swordRecipe];
