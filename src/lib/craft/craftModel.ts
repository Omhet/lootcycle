// ======= BASIC TYPES AND ENUMERATIONS =======

// System enumerations
export enum Rarity {
    Common = "common",
    Uncommon = "uncommon",
    Rare = "rare",
    Epic = "epic",
    Legendary = "legendary",
}

// Operation results
export enum CraftingFailureReason {
    NotEnoughJunk = "NOT_ENOUGH_JUNK",
    TooLowTemperature = "TOO_LOW_TEMPERATURE",
    TooHighTemperature = "TOO_HIGH_TEMPERATURE",
}

// Temperature range for materials
export interface TemperatureRange {
    min: number; // Minimum temperature in Celsius
    max: number; // Maximum temperature in Celsius
}

// ======= ITEMS =======

export type Pinpoint = {
    coords: {
        x: number;
        y: number;
    };
    localOffset: {
        x: number;
        y: number;
    };
    localRotationAngle: number;
    zIndex: number;
};

// Item category enum
export enum ItemCategoryId {
    Weapon = "weapon",
}

// Item subcategory enum
export enum ItemSubCategoryId {
    MeleeWeapon = "melee_weapon",
}

export type ItemCategory = {
    id: ItemCategoryId;
    name: string;
};

export type ItemSubCategory = {
    id: ItemSubCategoryId;
    name: string;
    categoryId: ItemCategoryId;
};

// Initial item categories
export const initialItemCategories: ItemCategory[] = [
    { id: ItemCategoryId.Weapon, name: "Weapon" },
];

// Initial item subcategories
export const initialItemSubCategories: ItemSubCategory[] = [
    {
        id: ItemSubCategoryId.MeleeWeapon,
        name: "Melee Weapon",
        categoryId: ItemCategoryId.Weapon,
    },
];

export type RecipeItemId = string;
export type PecipePartId = string;
export type RecipeDetailId = string;
export type RecipeDetailVariantId = string;

export enum RecipeItemType {
    Blade = "blade",
}

// Loot item template
export interface RecipeItem {
    id: RecipeItemId;
    subCategory: ItemSubCategoryId;
    type: RecipeItemType;
    name: string;
    sockets: PecipePartSocket[];
    baseSellPrice: number;
    perfectTemperature: number;
    baseTemperatureOffset: number;
}

export type PecipePartSocket = {
    acceptType: PecipePartType;
    relativeWeight?: number;
    pinpoint: Pinpoint;
};

export enum PecipePartType {
    Hilt = "hilt",
    ShortSwordBlade = "short_sword_blade",
}

export type PecipePart = {
    id: PecipePartId;
    type: PecipePartType;
    name: string;
    sockets: RecipeDetailSocket[];
};

export type RecipeDetailSocket = {
    acceptType: RecipeDetailType;
    relativeWeight?: number;
    pinpoint: Pinpoint;
};

export enum RecipeDetailType {
    Pommel = "pommel",
    Grip = "grip",
    Guard = "guard",
    ShortSwordBlade = "short_sword_blade",
}

export type RecipeDetail = {
    id: RecipeDetailId;
    type: RecipeDetailType;
    name: string;
    rarity: Rarity;
};

export type RecipeDetailVariant = {
    id: RecipeDetailVariantId;
    detailId: RecipeDetailId;
    name: string;
    assetPath: string;
};

// ======= GAME LOOT CONFIGURATION =======

// Define the structure for the overall configuration
export interface LootConfig {
    RecipeItems: Record<RecipeItemType, RecipeItem[]>;
    PecipeParts: Record<PecipePartType, PecipePart[]>;
    RecipeDetails: Record<RecipeDetailType, RecipeDetailVariant[]>;
}

// ======= LOOT OBJECTS TYPES =======

export type LootItemId = string;
export type LootPartId = string;
export type LootDetailId = string;

// Particular crafted item in game
export type LootItem = {
    id: LootItemId;
    recipeId: RecipeItemId;
    name: string;
    parts: LootPartId[];
    rarity: Rarity;
    sellPrice: number;
    temperatureRange: TemperatureRange;
};

export type LootPart = {
    id: LootPartId;
    recipePartId: PecipePartId;
    details: LootDetailId[];
    rarity: Rarity;
};

export type LootDetail = {
    id: LootDetailId;
    recipeDetailVariantId: RecipeDetailVariantId;
    rarity: Rarity;
};

// ======= JUNK OBJECTS TYPES =======

export type JunkPartId = string;
export type JunkDetailId = string;

export type JunkPart = {
    id: JunkPartId;
    recipePartId: PecipePartId;
    details: JunkDetailId[];
};

export type JunkDetail = {
    id: JunkDetailId;
    recipeDetailVariantId: RecipeDetailVariantId;
    suitableForRecipeDetails: RecipeDetailType[];
};

// Particular instance of junk in game
export type JunkPiece = {
    id: JunkPartId | JunkDetailId;
    type: "part" | "detail";
    durability: number; // How long junk particular instance will last after spawning (in crafting times)
    degradation: number; // Degradation level of any junk piece (from 0% to 100%)
};
