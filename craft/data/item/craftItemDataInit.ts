import { ItemCategory, ItemSubCategory, ItemType, ItemVariant, PartId } from '../../craftModel'

// Item category enum
export enum ItemCategoryIdEnum {
    Weapon = 'weapon',
    // Future categories would go here: Armor, Magic, Accessories, etc.
}

// Item subcategory enum
export enum ItemSubCategoryIdEnum {
    MeleeWeapon = 'melee_weapon',
    RangeWeapon = 'range_weapon',
    // Future subcategories would go here
}

// Item type enum
export enum ItemTypeIdEnum {
    // Melee weapons
    Sword = 'sword',
    Axe = 'axe',
    // Range weapons
    Bow = 'bow',
    Crossbow = 'crossbow',
    // Can be extended with more types
}

// Item variant enum
export enum ItemVariantIdEnum {
    // Sword variants
    ShortSword = 'short_sword',
    LongSword = 'long_sword',
    // Axe variants
    BattleAxe = 'battle_axe',
    HandAxe = 'hand_axe',
    // Bow variants
    HuntingBow = 'hunting_bow',
    Longbow = 'longbow',
    // Crossbow variants
    LightCrossbow = 'light_crossbow',
    HeavyCrossbow = 'heavy_crossbow',
    // Can be extended with more variants
}

// Initial item categories
export const initialItemCategories: ItemCategory[] = [{ id: ItemCategoryIdEnum.Weapon, name: 'Weapon' }]

// Initial item subcategories
export const initialItemSubCategories: ItemSubCategory[] = [
    { id: ItemSubCategoryIdEnum.MeleeWeapon, name: 'Melee Weapon', categoryId: ItemCategoryIdEnum.Weapon },
    { id: ItemSubCategoryIdEnum.RangeWeapon, name: 'Range Weapon', categoryId: ItemCategoryIdEnum.Weapon },
]

// Initial item types
export const initialItemTypes: ItemType[] = [
    // Melee weapon types
    {
        id: ItemTypeIdEnum.Sword,
        subCategoryId: ItemSubCategoryIdEnum.MeleeWeapon,
        name: 'Sword',
    },
    {
        id: ItemTypeIdEnum.Axe,
        subCategoryId: ItemSubCategoryIdEnum.MeleeWeapon,
        name: 'Axe',
    },

    // Ranged weapon types
    {
        id: ItemTypeIdEnum.Bow,
        subCategoryId: ItemSubCategoryIdEnum.RangeWeapon,
        name: 'Bow',
    },
    {
        id: ItemTypeIdEnum.Crossbow,
        subCategoryId: ItemSubCategoryIdEnum.RangeWeapon,
        name: 'Crossbow',
    },
]

// Initial item variants
export const initialItemVariants: ItemVariant[] = [
    // Sword variants
    {
        id: ItemVariantIdEnum.ShortSword,
        typeId: ItemTypeIdEnum.Sword,
        name: 'Short Sword',
        requiredParts: ['blade_small', 'hilt_basic'] as PartId[],
    },
    {
        id: ItemVariantIdEnum.LongSword,
        typeId: ItemTypeIdEnum.Sword,
        name: 'Long Sword',
        requiredParts: ['blade_large', 'hilt_advanced'] as PartId[],
    },

    // Axe variants
    {
        id: ItemVariantIdEnum.BattleAxe,
        typeId: ItemTypeIdEnum.Axe,
        name: 'Battle Axe',
        requiredParts: ['axe_head_large', 'handle_medium'] as PartId[],
    },
    {
        id: ItemVariantIdEnum.HandAxe,
        typeId: ItemTypeIdEnum.Axe,
        name: 'Hand Axe',
        requiredParts: ['axe_head_small', 'handle_short'] as PartId[],
    },

    // Bow variants
    {
        id: ItemVariantIdEnum.HuntingBow,
        typeId: ItemTypeIdEnum.Bow,
        name: 'Hunting Bow',
        requiredParts: ['bow_limb', 'bow_string'] as PartId[],
    },
    {
        id: ItemVariantIdEnum.Longbow,
        typeId: ItemTypeIdEnum.Bow,
        name: 'Longbow',
        requiredParts: ['bow_limb_long', 'bow_string', 'bow_grip'] as PartId[],
    },

    // Crossbow variants
    {
        id: ItemVariantIdEnum.LightCrossbow,
        typeId: ItemTypeIdEnum.Crossbow,
        name: 'Light Crossbow',
        requiredParts: ['crossbow_body_small', 'bow_string', 'trigger_mechanism'] as PartId[],
    },
    {
        id: ItemVariantIdEnum.HeavyCrossbow,
        typeId: ItemTypeIdEnum.Crossbow,
        name: 'Heavy Crossbow',
        requiredParts: ['crossbow_body_large', 'bow_string', 'trigger_mechanism', 'stock_reinforced'] as PartId[],
    },
]

// Custom overrides that can be applied before data generation
export const customOverrides: {
    itemCategories?: Partial<Record<ItemCategoryIdEnum, Partial<ItemCategory>>>
    itemSubCategories?: Partial<Record<ItemSubCategoryIdEnum, Partial<ItemSubCategory>>>
    itemTypes?: Partial<Record<ItemTypeIdEnum, Partial<ItemType>>>
    itemVariants?: Partial<Record<ItemVariantIdEnum, Partial<ItemVariant>>>
} = {
    // Example overrides:
    // itemTypes: {
    //     [ItemTypeIdEnum.Sword]: { name: 'Broadsword' }
    // },
    // itemVariants: {
    //     [ItemVariantIdEnum.LongSword]: { name: 'Claymore' }
    // }
}
