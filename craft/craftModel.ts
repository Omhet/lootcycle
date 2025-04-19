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
    // Can be easily extended with new categories
}

// Initial material categories
export const initialMaterialCategories: MaterialCategory[] = [
    { id: MaterialCategoryIdEnum.Metal, name: "Metal" },
    { id: MaterialCategoryIdEnum.Wood, name: "Wood" },
];

// Initial material types with one of each rarity per category
export const initialMaterialTypes: MaterialType[] = [
    // Metal types
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
    // Wood types
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
// TODO: Refactor to divide exact templates types that will be in config with corresponding molecules and atoms in its own files
// (for example, sword template with sword molecules and atoms, axe template with axe molecules and atoms)

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
    // Future categories would go here: Armor, Magic, Accessories, etc.
}

// Item subcategory enum
export enum ItemSubCategoryId {
    MeleeWeapon = "melee_weapon",
    // Future subcategories would go here: Range Weapon, Light Armor, Heavy Armor, etc.
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
    // Future subcategories would go here: Range Weapon, Light Armor, Heavy Armor, etc.
];

// export type JunkItemId = string
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
    rarirty: Rarity;
    assetPath: string;
};

// ======= LOOT ITEMS =======

const swordTemplate: LootItemTemplate = {
    id: "sword",
    subCategory: ItemSubCategoryId.MeleeWeapon,
    type: LootItemTemplateType.Sword,
    name: "Basic Sword",
    sockets: [
        {
            acceptType: LootMoleculeType.SwordHilt,
            acceptTags: [LootMoleculeTag.Handheld],
            relativeWeight: 3,
            pinpoint: {
                coords: { x: 0, y: 0 },
                localOffset: { x: 0, y: -0.5 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
        {
            acceptType: LootMoleculeType.SwordBlade,
            acceptTags: [LootMoleculeTag.Sharp],
            relativeWeight: 7,
            pinpoint: {
                coords: { x: 0, y: 0 },
                localOffset: { x: 0, y: 0.5 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
    ],
};

export type LootItemTemplateConfig = Record<
    LootItemTemplateType,
    LootItemTemplate[]
>;

// All loot item templates available in the game
export const lootItemTemplateConfig: LootItemTemplateConfig = {
    [LootItemTemplateType.Sword]: [swordTemplate],
};

// ======= LOOT MOLECULES =======

// Sword molecules and atoms
const swordHiltMolecule: LootMolecule = {
    id: "sword_hilt",
    type: LootMoleculeType.SwordHilt,
    tags: [LootMoleculeTag.Handheld],
    name: "Basic Sword Hilt",
    sockets: [
        {
            acceptType: LootAtomType.Guard,
            relativeWeight: 2,
            pinpoint: {
                coords: { x: 0, y: 0.5 },
                localOffset: { x: 0, y: -0.5 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
        {
            acceptType: LootAtomType.Grip,
            relativeWeight: 1,
            pinpoint: {
                coords: { x: 0, y: 0 },
                localOffset: { x: 0, y: 0 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
        {
            acceptType: LootAtomType.Pommel,
            relativeWeight: 1,
            pinpoint: {
                coords: { x: 0, y: -0.5 },
                localOffset: { x: 0, y: 75 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
    ],
};

const swordBladeMolecule: LootMolecule = {
    id: "sword_blade",
    type: LootMoleculeType.SwordBlade,
    tags: [LootMoleculeTag.Sharp],
    name: "Basic Sword Blade",
    sockets: [
        {
            acceptType: LootAtomType.Blade,
            relativeWeight: 1,
            pinpoint: {
                coords: { x: 0, y: 0 },
                localOffset: { x: 0, y: 0 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
    ],
};

// Elven sword molecules
const elvenSwordHiltMolecule: LootMolecule = {
    id: "elven_sword_hilt",
    type: LootMoleculeType.SwordHilt,
    tags: [LootMoleculeTag.Handheld],
    name: "Elven Sword Hilt",
    sockets: [
        {
            acceptType: LootAtomType.Guard,
            relativeWeight: 2,
            pinpoint: {
                coords: { x: 0, y: 0.5 },
                localOffset: { x: 0, y: -0.5 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
        {
            acceptType: LootAtomType.Grip,
            relativeWeight: 1,
            pinpoint: {
                coords: { x: 0, y: 0 },
                localOffset: { x: 0, y: 0 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
        {
            acceptType: LootAtomType.Pommel,
            relativeWeight: 1,
            pinpoint: {
                coords: { x: 0, y: -0.5 },
                localOffset: { x: 0, y: 0.75 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
    ],
};

const elvenSwordBladeMolecule: LootMolecule = {
    id: "elven_sword_blade",
    type: LootMoleculeType.SwordBlade,
    tags: [LootMoleculeTag.Sharp],
    name: "Elven Sword Blade",
    sockets: [
        {
            acceptType: LootAtomType.Blade,
            relativeWeight: 1,
            pinpoint: {
                coords: { x: 0, y: 0 },
                localOffset: { x: 0, y: 0 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
    ],
};

const swordBasicGuardAtom: LootAtom = {
    id: "sword_basic_guard",
    type: LootAtomType.Guard,
    name: "Basic Sword Guard",
    rarirty: Rarity.Common,
    assetPath: "assets/sword/guards/basic-guard.png",
};
const swordBasicGripAtom: LootAtom = {
    id: "sword_basic_grip",
    type: LootAtomType.Grip,
    name: "Basic Sword Grip",
    rarirty: Rarity.Common,
    assetPath: "assets/sword/grips/basic-grip.png",
};
const swordBasicPommelAtom: LootAtom = {
    id: "sword_basic_pommel",
    type: LootAtomType.Pommel,
    name: "Basic Sword Pommel",
    rarirty: Rarity.Common,
    assetPath: "assets/sword/pommels/basic-pommel.png",
};
const swordBasicBladeAtom: LootAtom = {
    id: "sword_basic_blade",
    type: LootAtomType.Blade,
    name: "Basic Sword Blade",
    rarirty: Rarity.Common,
    assetPath: "assets/sword/blades/basic-blade.png",
};

// Elven sword atoms
const elvenSwordGuardAtom: LootAtom = {
    id: "elven_sword_guard",
    type: LootAtomType.Guard,
    name: "Elven Sword Guard",
    rarirty: Rarity.Rare,
    assetPath: "assets/sword/guards/elven-guard.png",
};

const elvenSwordGripAtom: LootAtom = {
    id: "elven_sword_grip",
    type: LootAtomType.Grip,
    name: "Elven Sword Grip",
    rarirty: Rarity.Rare,
    assetPath: "assets/sword/grips/elven-grip.png",
};

const elvenSwordPommelAtom: LootAtom = {
    id: "elven_sword_pommel",
    type: LootAtomType.Pommel,
    name: "Elven Sword Pommel",
    rarirty: Rarity.Rare,
    assetPath: "assets/sword/pommels/elven-pommel.png",
};

const elvenSwordBladeAtom: LootAtom = {
    id: "elven_sword_blade",
    type: LootAtomType.Blade,
    name: "Elven Sword Blade",
    rarirty: Rarity.Rare,
    assetPath: "assets/sword/blades/elven-blade.png",
};

export type LootMoleculeConfig = Record<LootMoleculeType, LootMolecule[]>;
// All molecules and atoms available in the game
export const lootMoleculeConfig: Record<LootMoleculeType, LootMolecule[]> = {
    [LootMoleculeType.SwordHilt]: [swordHiltMolecule, elvenSwordHiltMolecule],
    [LootMoleculeType.SwordBlade]: [
        swordBladeMolecule,
        elvenSwordBladeMolecule,
    ],
};

export type LootAtomConfig = Record<LootAtomType, LootAtom[]>;
export const lootAtomConfig: Record<LootAtomType, LootAtom[]> = {
    [LootAtomType.Guard]: [swordBasicGuardAtom, elvenSwordGuardAtom],
    [LootAtomType.Grip]: [swordBasicGripAtom, elvenSwordGripAtom],
    [LootAtomType.Pommel]: [swordBasicPommelAtom, elvenSwordPommelAtom],
    [LootAtomType.Blade]: [swordBasicBladeAtom, elvenSwordBladeAtom],
};

export type LootConfig = {
    lootItemTemplates: LootItemTemplateConfig;
    lootMolecules: LootMoleculeConfig;
    lootAtoms: LootAtomConfig;
};

// ======= LOOT OBJECTS TYPES (that will be generated in build time and then used in runtime) =======

export type LootItemId = string;
export type LootPartId = string;
export type LootDetailId = LootAtomId;

export type LootItem = {
    id: LootItemId;
    templateId: LootItemTemplateId;
    subparts: LootPartId[];
    materialComposition: MaterialComposition[];
    rarity: Rarity;
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
    materialComposition: MaterialComposition[];
    rarity: Rarity;
};

export type LootJunk = LootDetail & {
    durability: number;
    overrideAssetPath?: string;
};

export type LootJunkItem = LootJunk & {
    degradation: number; // from 0% to 100%. Degradation remains in the type for runtime use. Game will calculate degradation based on how many game days item was in the game compared to its durability
};

// ======= CRAFTING FUNCTION =======

export interface CraftingResult {
    success: boolean;
    item?: LootItem;
    quality?: number; // 0-100 quality percentage
    sellPrice?: number;
    failure?: {
        reason: CraftingFailureReason;
    };
}

export type craftLootItemParams = {
    lootItemTemplate: LootItemTemplate;
    junkItems: LootJunkItem[];
    temperature: number;
    config: LootConfig;
};

export function craftLootItem(params: craftLootItemParams): CraftingResult {
    const { lootItemTemplate, junkItems, temperature, config } = params;

    // Step 1: Check if there is enough material proportional weight in the junk items overall material composition
    // retutn NotEnoughJunk failure if not enough

    // Step 2: Select best junk items candidates to craft the item
    // Firstly, sort by value (formula of material composition value, rarity, degradation. material composition value is a formula of material composition percentage and base price and rarity of the material type)
    // Then, prioritise junk items that are fitted to the item template, then everything else
    // The final list of junk items should be sorted by value
    // Determine the best junk items to use for crafting (allow some luck factor for not the very best junk items to be used)

    // Step 3: Determine wich materials will be used for crafting the item

    // Step 4: Check if temperature is appropriate for crafting.
    // Needs to calculate temperature range (regular and master quality range) for the item based on the material composition of the junk items used
    // Range is narrower if item is more rare (need to calculate this potential crafted loot item rarity)
    // Range offset is determined by the material composition of the junk items used
    // Master range is even narrower than regular range
    // If temperature is too low or too high, return TooLowTemperature or TooHighTemperature failure

    // Step 7: Calculate quality based on
    // junk items overall degradation and temperature (is it in master quality range or not)

    // Step 8: Calculate final sell price based on the item rarity, quality, and material composition

    return {
        success: true,
        item: {},
        quality: 0,
        sellPrice: 0,
    };
}

// Helper function to calculate similarity between material compositions
function calculateMaterialSimilarity(
    composition1: MaterialComposition[],
    composition2: MaterialComposition[]
): number {
    let similarity = 0;

    // Create maps of material percentages for easier comparison
    const map1 = new Map(
        composition1.map((mc) => [mc.materialId, mc.percentage])
    );
    const map2 = new Map(
        composition2.map((mc) => [mc.materialId, mc.percentage])
    );

    // Combine all material IDs
    const allMaterials = new Set([...map1.keys(), ...map2.keys()]);

    // For each material, calculate the similarity (100 - absolute difference)
    allMaterials.forEach((materialId) => {
        const percentage1 = map1.get(materialId) || 0;
        const percentage2 = map2.get(materialId) || 0;

        const materialSimilarity = 100 - Math.abs(percentage1 - percentage2);
        similarity += materialSimilarity;
    });

    // Normalize by the number of materials
    return similarity / allMaterials.size;
}
