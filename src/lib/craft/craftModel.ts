// ======= BASIC TYPES AND ENUMERATIONS =======

// System enumerations
export enum Rarity {
  Common = "common",
  Uncommon = "uncommon",
  Rare = "rare",
  Epic = "epic",
  Legendary = "legendary",
}

export enum Quality {
  Worst = "worst",
  Bad = "bad",
  Good = "good",
  Better = "better",
  Best = "best",
}

// Chance tables for quality and rarity distribution
export type ChanceTable = Record<string, number>;

export interface ChanceTables {
  qualityChanceTables: Record<number, ChanceTable>;
  rarityChanceTables: Record<number, ChanceTable>;
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
export const initialItemCategories: ItemCategory[] = [{ id: ItemCategoryId.Weapon, name: "Weapon" }];

// Initial item subcategories
export const initialItemSubCategories: ItemSubCategory[] = [
  {
    id: ItemSubCategoryId.MeleeWeapon,
    name: "Melee Weapon",
    categoryId: ItemCategoryId.Weapon,
  },
];

export type RecipeItemId = string;
export type RecipePartId = string;
export type RecipeDetailId = string;

export enum RecipeItemType {
  BladeWeapon = "blade_weapon",
}

// Loot item template
export interface RecipeItem {
  id: RecipeItemId;
  subCategory: ItemSubCategoryId;
  type: RecipeItemType;
  name: string;
  sockets: RecipePartSocket[];
  baseSellPrice: number;
  perfectTemperature: number; // In Celsius
  baseTemperatureOffset: number; // In Celsius
}

export type RecipePartSocket = {
  acceptType: RecipePartType;
  relativeWeight: number;
  pinpoint: Pinpoint;
};

export enum RecipePartType {
  BladeWeaponHilt = "hilt",
  ShortSwordBlade = "short_sword_blade",
}

export type RecipePart = {
  id: RecipePartId;
  type: RecipePartType;
  name: string;
  sockets: RecipeDetailSocket[];
};

export type RecipeDetailSocket = {
  acceptType: RecipeDetailType;
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
};

// ======= JUNK OBJECTS TYPES =======

export enum Durability {
  Lowest = 1,
  Low = 2,
  Medium = 3,
  High = 4,
  Highest = 5,
}

export type JunkPieceId = string;

export type JunkPiece = {
  id: JunkPieceId;
  suitableForRecipeDetails: RecipeDetailType[];
  name: string;
  rarity: Rarity;
  durability: Durability; // Deterimines how long junk particular instance will last after spawning (in crafting times)
  sellPriceCoefficient: number;
  temperatureCoefficient: number;
};

// ======= LOOT OBJECTS TYPES =======

export type LootItemId = string;
export type LootPartId = string;
export type LootDetailId = string;

// Particular crafted item in game
export type LootItem = {
  id: LootItemId;
  recipeId: RecipeItemId;
  name: string;
  details: JunkPieceId[];
  rarity: Rarity;
  sellPrice: number;
  temperatureRange: TemperatureRange; // In Celsius
};

export type LootPart = {
  id: LootPartId;
  recipePartId: RecipePartId;
  details: LootDetailId[];
};

export type LootDetail = {
  id: LootDetailId;
  type: RecipeDetailType;
  canBeCraftedFrom: JunkPieceId[]; // List of junk pieces that can be used to craft this detail
  name: string;
};

// ======= GAME LOOT CONFIGURATION =======

// Define the structure for the overall configuration
export interface LootConfig {
  recipeItems: Record<RecipeItemType, RecipeItem[]>;
  recipeParts: Record<RecipePartType, RecipePart[]>;
  junkPieces: Record<JunkPieceId, JunkPiece[]>;
  lootDetails: Record<LootDetailId, LootDetail[]>;
}
