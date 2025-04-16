import { MaterialCategory, MaterialCategoryIdEnum, MaterialType, Rarity } from './craftModel'

// Initial material categories
export const initialMaterialCategories: MaterialCategory[] = [
    { id: MaterialCategoryIdEnum.Metal, name: 'Metal' },
    { id: MaterialCategoryIdEnum.Wood, name: 'Wood' },
]

// Initial material types with one of each rarity per category
export const initialMaterialTypes: Partial<MaterialType>[] = [
    // Metal types
    {
        id: 'copper',
        name: 'Copper',
        categoryId: MaterialCategoryIdEnum.Metal,
        rarity: Rarity.Common,
        basePrice: 10,
        heatValue: 5,
        burnRate: 0.2,
        optimalTemperatureRange: { min: 900, max: 1200 },
    },
    {
        id: 'iron',
        name: 'Iron',
        categoryId: MaterialCategoryIdEnum.Metal,
        rarity: Rarity.Uncommon,
        basePrice: 25,
        heatValue: 8,
        burnRate: 0.15,
        optimalTemperatureRange: { min: 1100, max: 1500 },
    },
    {
        id: 'steel',
        name: 'Steel',
        categoryId: MaterialCategoryIdEnum.Metal,
        rarity: Rarity.Rare,
        basePrice: 50,
        heatValue: 12,
        burnRate: 0.1,
        optimalTemperatureRange: { min: 1200, max: 1600 },
    },
    {
        id: 'mithril',
        name: 'Mithril',
        categoryId: MaterialCategoryIdEnum.Metal,
        rarity: Rarity.Epic,
        basePrice: 100,
        heatValue: 15,
        burnRate: 0.08,
        optimalTemperatureRange: { min: 1300, max: 1700 },
    },
    {
        id: 'adamantium',
        name: 'Adamantium',
        categoryId: MaterialCategoryIdEnum.Metal,
        rarity: Rarity.Legendary,
        basePrice: 250,
        heatValue: 20,
        burnRate: 0.05,
        optimalTemperatureRange: { min: 1400, max: 1900 },
    },

    // Wood types
    {
        id: 'pine',
        name: 'Pine',
        categoryId: MaterialCategoryIdEnum.Wood,
        rarity: Rarity.Common,
        basePrice: 5,
        heatValue: 3,
        burnRate: 0.5,
        optimalTemperatureRange: { min: 300, max: 400 },
    },
    {
        id: 'oak',
        name: 'Oak',
        categoryId: MaterialCategoryIdEnum.Wood,
        rarity: Rarity.Uncommon,
        basePrice: 15,
        heatValue: 4,
        burnRate: 0.4,
        optimalTemperatureRange: { min: 350, max: 450 },
    },
    {
        id: 'mahogany',
        name: 'Mahogany',
        categoryId: MaterialCategoryIdEnum.Wood,
        rarity: Rarity.Rare,
        basePrice: 35,
        heatValue: 6,
        burnRate: 0.35,
        optimalTemperatureRange: { min: 380, max: 480 },
    },
    {
        id: 'ebony',
        name: 'Ebony',
        categoryId: MaterialCategoryIdEnum.Wood,
        rarity: Rarity.Epic,
        basePrice: 80,
        heatValue: 8,
        burnRate: 0.3,
        optimalTemperatureRange: { min: 400, max: 500 },
    },
    {
        id: 'arcane_wood',
        name: 'Arcane Wood',
        categoryId: MaterialCategoryIdEnum.Wood,
        rarity: Rarity.Legendary,
        basePrice: 200,
        heatValue: 12,
        burnRate: 0.2,
        optimalTemperatureRange: { min: 450, max: 550 },
    },
]

// Custom overrides that can be applied before data generation
export const customOverrides: {
    materialCategories?: Partial<Record<MaterialCategoryIdEnum, Partial<MaterialCategory>>>
    materialTypes?: Partial<Record<string, Partial<MaterialType>>>
} = {
    materialTypes: {
        // Example override: Make adamantium more expensive
        // 'adamantium': { basePrice: 300 }
    },
}
