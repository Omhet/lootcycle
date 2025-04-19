// ======= BASIC TYPES AND ENUMERATIONS =======

// Typed identifiers
export type MaterialCategoryId = string;
export type MaterialTypeId = string;
export type MaterialId = string;

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

// ======= MATERIALS =======

// Temperature range for materials
export interface TemperatureRange {
    min: number; // Minimum temperature in Celsius
    max: number; // Maximum temperature in Celsius
}

export enum Durability {
    Low = "low",
    Medium = "medium",
    High = "high",
}

// Material category
export interface MaterialCategory {
    id: MaterialCategoryId;
    name: string;
}

// Material type
export interface MaterialType {
    id: MaterialTypeId;
    categoryId: MaterialCategoryId;
    name: string;
    rarity: Rarity;
    durability: Durability;
    basePrice: number; // Price for 1% content in an item part
    optimalTemperatureRange: TemperatureRange;
}

// Specific material
export interface Material {
    id: MaterialId;
    typeId: MaterialTypeId;
}

// Material composition in an item part
export interface MaterialComposition {
    materialId: MaterialId;
    percentage: number; // 0-100
}

export enum MaterialCategoryIdEnum {
    Metal = "metal",
    Wood = "wood",
}

// Initial material categories
export const initialMaterialCategories: MaterialCategory[] = [
    { id: MaterialCategoryIdEnum.Metal, name: "Metal" },
    { id: MaterialCategoryIdEnum.Wood, name: "Wood" },
];

// Initial material types with one of each rarity per category
export const initialMaterialTypes: MaterialType[] = [
    {
        id: "copper",
        name: "Copper",
        categoryId: MaterialCategoryIdEnum.Metal,
        rarity: Rarity.Common,
        durability: Durability.Medium,
        basePrice: 2,
        optimalTemperatureRange: { min: 30, max: 80 },
    },
    {
        id: "iron",
        name: "Iron",
        categoryId: MaterialCategoryIdEnum.Metal,
        rarity: Rarity.Uncommon,
        durability: Durability.Medium,
        basePrice: 4,
        optimalTemperatureRange: { min: 50, max: 100 },
    },
    {
        id: "silver",
        name: "Silver",
        categoryId: MaterialCategoryIdEnum.Metal,
        rarity: Rarity.Rare,
        durability: Durability.Low,
        basePrice: 8,
        optimalTemperatureRange: { min: 40, max: 90 },
    },
    {
        id: "pine",
        name: "Pine",
        categoryId: MaterialCategoryIdEnum.Wood,
        rarity: Rarity.Common,
        durability: Durability.Low,
        basePrice: 1,
        optimalTemperatureRange: { min: 10, max: 60 },
    },
    {
        id: "oak",
        name: "Oak",
        categoryId: MaterialCategoryIdEnum.Wood,
        rarity: Rarity.Uncommon,
        durability: Durability.Medium,
        basePrice: 3,
        optimalTemperatureRange: { min: 20, max: 70 },
    },
    {
        id: "elvenmwood",
        name: "Elvenwood",
        categoryId: MaterialCategoryIdEnum.Wood,
        rarity: Rarity.Rare,
        durability: Durability.High,
        basePrice: 7,
        optimalTemperatureRange: { min: 15, max: 65 },
    },
];

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

export type LootItemTemplateId = string;
export type LootMoleculeId = string;
export type LootAtomId = string;

export enum LootItemTemplateType {
    Sword = "sword",
}

export interface LootItemTemplate {
    id: LootItemTemplateId;
    subCategory: ItemSubCategoryId;
    type: LootItemTemplateType;
    name: string;
    sockets: LootMoleculeSocket[];
}

export type LootMoleculeSocket = {
    acceptType: LootMoleculeType;
    acceptTags: LootMoleculeTag[];
    relativeWeight?: number;
    pinpoint: Pinpoint;
};

export enum LootMoleculeType {
    SwordHilt = "sword_hilt",
    SwordBlade = "sword_blade",
}

export enum LootMoleculeTag {
    Handheld = "handheld",
    Sharp = "sharp",
}

export type LootMolecule = {
    id: LootMoleculeId;
    type: LootMoleculeType;
    name: string;
    tags: LootMoleculeTag[];
    sockets: LootAtomSocket[];
};

export type LootAtomSocket = {
    acceptType: LootAtomType;
    relativeWeight?: number;
    pinpoint: Pinpoint;
};

export enum LootAtomType {
    Pommel = "pommel",
    Grip = "grip",
    Guard = "guard",
    Blade = "blade",
}

export type LootAtom = {
    id: LootAtomId;
    type: LootAtomType;
    name: string;
    rarity: Rarity;
    assetPath: string;
};

// ======= LOOT CONFIGURATION =======

// Define the structure for the overall configuration
export interface LootConfig {
    lootItemTemplates: Record<LootItemTemplateType, LootItemTemplate[]>;
    lootMolecules: Record<LootMoleculeType, LootMolecule[]>;
    lootAtoms: Record<LootAtomType, LootAtom[]>;
    // Add other config sections as needed (e.g., materials, categories)
}

// ======= LOOT OBJECTS TYPES =======

export type LootItemId = string;
export type LootPartId = string;
export type LootDetailId = LootAtomId;

export type LootItem = {
    id: LootItemId;
    templateId: LootItemTemplateId;
    name: string;
    subparts: LootPartId[];
    materialComposition: MaterialComposition[];
    rarity: Rarity;
    quality: number;
    sellPrice: number;
    temperatureRange: TemperatureRange;
    masterQualityTemperatureRange: TemperatureRange;
};

export type LootPart = {
    id: LootPartId;
    moleculeId: LootMoleculeId;
    subparts: LootDetailId[];
    materialComposition: MaterialComposition[];
    rarity: Rarity;
};

export type LootDetail = {
    id: LootDetailId;
    atomId: LootAtomId;
    material: MaterialId;
    rarity: Rarity;
};

export type LootJunk = LootDetail & {
    durability: number;
    overrideAssetPath?: string;
};

export type LootJunkItem = LootJunk & {
    id: string;
    degradation: number;
};
