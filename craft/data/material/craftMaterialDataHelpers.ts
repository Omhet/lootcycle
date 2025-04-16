import {
    Material,
    MaterialCategory,
    MaterialCategoryId,
    MaterialId,
    MaterialType,
    MaterialTypeId,
    Rarity,
} from '../../craftModel'
import { customOverrides, initialMaterialCategories, initialMaterialTypes } from './craftMaterialDataInit'

// ======= DATA STORE =======

// Map storage for generated data
export class CraftMaterialDataStore {
    materialCategories: Map<MaterialCategoryId, MaterialCategory> = new Map()
    materialTypes: Map<MaterialTypeId, MaterialType> = new Map()
    materials: Map<MaterialId, Material> = new Map()

    // Can be extended with other data maps as needed
}

// Global data instance
export const craftMaterialData = new CraftMaterialDataStore()

// Function to generate a unique ID for materials
export function generateMaterialId(typeId: MaterialTypeId): MaterialId {
    return `material_${typeId}`
}

// Apply custom overrides to data
export function applyOverrides<T>(item: T, overrides: Partial<T> | undefined): T {
    if (!overrides) return item
    return { ...item, ...overrides }
}

// Initialize all data
export function initializeCraftData(): CraftMaterialDataStore {
    // Clear existing data
    craftMaterialData.materialCategories.clear()
    craftMaterialData.materialTypes.clear()
    craftMaterialData.materials.clear()

    // Process material categories
    initialMaterialCategories.forEach((category) => {
        const overrides = customOverrides.materialCategories?.[category.id]
        const finalCategory = applyOverrides(category, overrides)
        craftMaterialData.materialCategories.set(finalCategory.id, finalCategory)
    })

    // Process material types
    initialMaterialTypes.forEach((partialType) => {
        const overrides = customOverrides.materialTypes?.[partialType.id!]

        // Apply overrides to the material type
        const materialType = applyOverrides(
            {
                ...partialType,
            } as MaterialType,
            overrides
        )

        craftMaterialData.materialTypes.set(materialType.id, materialType)

        // Generate a default material instance for each type
        const materialId = generateMaterialId(materialType.id)
        const material: Material = {
            id: materialId,
            typeId: materialType.id,
        }

        craftMaterialData.materials.set(materialId, material)
    })

    return craftMaterialData
}

// Helper to get all material types by rarity
export function getMaterialTypesByRarity(rarity: Rarity): MaterialType[] {
    return Array.from(craftMaterialData.materialTypes.values()).filter((type) => type.rarity === rarity)
}

// Helper to get all material types by category
export function getMaterialTypesByCategory(categoryId: MaterialCategoryId): MaterialType[] {
    return Array.from(craftMaterialData.materialTypes.values()).filter((type) => type.categoryId === categoryId)
}

// Helper to create a new material instance
export function createMaterial(typeId: MaterialTypeId): Material {
    const materialType = craftMaterialData.materialTypes.get(typeId)
    if (!materialType) throw new Error(`Material type ${typeId} not found`)

    const materialId = generateMaterialId(typeId)
    const material: Material = {
        id: materialId,
        typeId,
    }

    craftMaterialData.materials.set(materialId, material)
    return material
}
