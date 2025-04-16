// ======= BASIC TYPES AND ENUMERATIONS =======

import type {
    ItemCategoryIdEnum,
    ItemSubCategoryIdEnum,
    ItemTypeIdEnum,
    ItemVariantIdEnum,
} from './data/item/craftItemDataInit'

// Typed identifiers
export type MaterialCategoryId = string
export type MaterialTypeId = string
export type MaterialId = string
export type ItemCategoryId = ItemCategoryIdEnum
export type ItemSubCategoryId = ItemSubCategoryIdEnum
export type ItemTypeId = ItemTypeIdEnum
export type ItemVariantId = ItemVariantIdEnum
export type PartId = string
export type JunkItemId = string
export type LootItemId = string

// System enumerations
export enum Rarity {
    Common,
    Uncommon,
    Rare,
    Epic,
    Legendary,
}

// Operation results
export enum CraftingFailureReason {
    NoItems = 'NO_ITEMS',
    InvalidTemperature = 'INVALID_TEMPERATURE',
    IncompatibleMaterials = 'INCOMPATIBLE_MATERIALS',
    TooLowTemperature = 'TOO_LOW_TEMPERATURE',
    TooHighTemperature = 'TOO_HIGH_TEMPERATURE',
}

export enum TemperatureFailureReason {
    TooLow = 'TOO_LOW_TEMPERATURE',
    TooHigh = 'TOO_HIGH_TEMPERATURE',
}

// ======= MATERIALS =======

// Temperature range for materials
export interface TemperatureRange {
    min: number // Minimum temperature in Celsius
    max: number // Maximum temperature in Celsius
}

// Material category
export interface MaterialCategory {
    id: MaterialCategoryId
    name: string
}

// Material type
export interface MaterialType {
    id: MaterialTypeId
    categoryId: MaterialCategoryId
    name: string
    rarity: Rarity
    basePrice: number // Price for 1% content in an item part
    heatValue: number // Heat per 1 second of burning
    burnRate: number // Seconds of burning for 1 unit
    optimalTemperatureRange: TemperatureRange
}

// Specific material
export interface Material {
    id: MaterialId
    typeId: MaterialTypeId
}

// Material composition in an item part
export interface MaterialComposition {
    materialId: MaterialId
    percentage: number // 0-100
}

// ======= ITEM PARTS =======

// Item part (template)
export interface Part {
    id: PartId
    name: string
    // Part visualization
    assetPath: string
}

// Item part with materials
export interface ItemPart {
    partId: PartId
    composition: MaterialComposition[]
}

// Junk (input material for crafting)
export interface JunkItem {
    id: JunkItemId
    partId: PartId
    stability: number // 1-5
}

// ======= ITEMS =======

// Item category
export interface ItemCategory {
    id: ItemCategoryId
    name: string
}

// Item sub-category
export interface ItemSubCategory {
    id: ItemSubCategoryId
    categoryId: ItemCategoryId
    name: string
}

// Item type
export interface ItemType {
    id: ItemTypeId
    subCategoryId: ItemSubCategoryId
    name: string
}

// Item variant
export interface ItemVariant {
    id: ItemVariantId
    typeId: ItemTypeId
    name: string
    requiredParts: PartId[] // List of required parts
}

// Finished loot item (crafting result)
export interface LootItem {
    id: LootItemId
    variantId: ItemVariantId
    name: string
    rarity: Rarity
    parts: ItemPart[]
    isMasterwork: boolean
    price: number
}

// ======= ANALYSIS AND OPERATION RESULTS =======

// Material analysis result
export interface MaterialAnalysis {
    allMaterials: Record<MaterialId, number> // materialId -> percentage content
    dominantMaterialType: MaterialType
}

// Temperature compatibility check result
export interface TemperatureCompatibilityResult {
    compatible: boolean
    reason?: TemperatureFailureReason
}

// Crafting process result
export interface CraftingResult {
    success: boolean
    reason?: CraftingFailureReason
    item?: LootItem
}

// ======= OTHER SYSTEMS =======

// Recipe book entry (separate model)
export interface RecipeBookEntry {
    recipeId: string
    resultId: LootItemId
    inputs: JunkItemId[]
    temperatureRange: TemperatureRange
    discovered: boolean
}
