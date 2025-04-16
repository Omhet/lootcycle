import {
    ItemCategory,
    ItemCategoryId,
    ItemSubCategory,
    ItemSubCategoryId,
    ItemType,
    ItemTypeId,
    ItemVariant,
    ItemVariantId,
} from '../../craftModel'
import { applyOverrides } from '../craftDataUtils'
import {
    customOverrides,
    initialItemCategories,
    initialItemSubCategories,
    initialItemTypes,
    initialItemVariants,
} from './craftItemDataInit'

// ======= DATA STORE =======

// Map storage for generated data
export class CraftItemDataStore {
    itemCategories: Map<ItemCategoryId, ItemCategory> = new Map()
    itemSubCategories: Map<ItemSubCategoryId, ItemSubCategory> = new Map()
    itemTypes: Map<ItemTypeId, ItemType> = new Map()
    itemVariants: Map<ItemVariantId, ItemVariant> = new Map()

    // Can be extended with other data maps as needed
}

// Global data instance
export const craftItemData = new CraftItemDataStore()

// Initialize all data
export function initializeCraftItemData(): CraftItemDataStore {
    // Clear existing data
    craftItemData.itemCategories.clear()
    craftItemData.itemSubCategories.clear()
    craftItemData.itemTypes.clear()
    craftItemData.itemVariants.clear()

    // Process item categories
    initialItemCategories.forEach((category) => {
        const overrides = customOverrides.itemCategories?.[category.id]
        const finalCategory = applyOverrides(category, overrides)
        craftItemData.itemCategories.set(finalCategory.id, finalCategory)
    })

    // Process item subcategories
    initialItemSubCategories.forEach((subCategory) => {
        const overrides = customOverrides.itemSubCategories?.[subCategory.id]
        const finalSubCategory = applyOverrides(subCategory, overrides)
        craftItemData.itemSubCategories.set(finalSubCategory.id, finalSubCategory)
    })

    // Process item types
    initialItemTypes.forEach((itemType) => {
        const overrides = customOverrides.itemTypes?.[itemType.id]
        const finalItemType = applyOverrides(itemType, overrides)
        craftItemData.itemTypes.set(finalItemType.id, finalItemType)
    })

    // Process item variants
    initialItemVariants.forEach((variant) => {
        const overrides = customOverrides.itemVariants?.[variant.id]
        const finalVariant = applyOverrides(variant, overrides)
        craftItemData.itemVariants.set(finalVariant.id, finalVariant)
    })

    return craftItemData
}

// ======= HELPER FUNCTIONS =======

// Helper to get all item types by category
export function getItemTypesByCategory(categoryId: ItemCategoryId): ItemType[] {
    // Get all subcategories for this category
    const subCategories = Array.from(craftItemData.itemSubCategories.values()).filter(
        (subCategory) => subCategory.categoryId === categoryId
    )

    // Get all item types for these subcategories
    const itemTypes: ItemType[] = []
    subCategories.forEach((subCategory) => {
        const types = Array.from(craftItemData.itemTypes.values()).filter(
            (itemType) => itemType.subCategoryId === subCategory.id
        )
        itemTypes.push(...types)
    })

    return itemTypes
}

// Helper to get all item types by subcategory
export function getItemTypesBySubCategory(subCategoryId: ItemSubCategoryId): ItemType[] {
    return Array.from(craftItemData.itemTypes.values()).filter((itemType) => itemType.subCategoryId === subCategoryId)
}

// Helper to get all variants for an item type
export function getItemVariantsByType(typeId: ItemTypeId): ItemVariant[] {
    return Array.from(craftItemData.itemVariants.values()).filter((variant) => variant.typeId === typeId)
}

// Helper to get a specific item variant
export function getItemVariant(variantId: ItemVariantId): ItemVariant | undefined {
    return craftItemData.itemVariants.get(variantId)
}

// Helper to get a specific item type
export function getItemType(typeId: ItemTypeId): ItemType | undefined {
    return craftItemData.itemTypes.get(typeId)
}

// Helper to get a specific item subcategory
export function getItemSubCategory(subCategoryId: ItemSubCategoryId): ItemSubCategory | undefined {
    return craftItemData.itemSubCategories.get(subCategoryId)
}

// Helper to get a specific item category
export function getItemCategory(categoryId: ItemCategoryId): ItemCategory | undefined {
    return craftItemData.itemCategories.get(categoryId)
}

// Helper to get subcategories for a category
export function getSubCategoriesForCategory(categoryId: ItemCategoryId): ItemSubCategory[] {
    return Array.from(craftItemData.itemSubCategories.values()).filter(
        (subCategory) => subCategory.categoryId === categoryId
    )
}

// Helper to get full item hierarchy information
export function getFullItemVariantInfo(variantId: ItemVariantId): {
    variant: ItemVariant | undefined
    type: ItemType | undefined
    subCategory: ItemSubCategory | undefined
    category: ItemCategory | undefined
} {
    const variant = craftItemData.itemVariants.get(variantId)
    if (!variant) return { variant: undefined, type: undefined, subCategory: undefined, category: undefined }

    const type = craftItemData.itemTypes.get(variant.typeId)
    if (!type) return { variant, type: undefined, subCategory: undefined, category: undefined }

    const subCategory = craftItemData.itemSubCategories.get(type.subCategoryId)
    if (!subCategory) return { variant, type, subCategory: undefined, category: undefined }

    const category = craftItemData.itemCategories.get(subCategory.categoryId)

    return { variant, type, subCategory, category }
}
