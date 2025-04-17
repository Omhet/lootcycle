// ======= BASIC TYPES AND ENUMERATIONS =======

// Typed identifiers
export type MaterialCategoryId = string
export type MaterialTypeId = string
export type MaterialId = string

// System enumerations
export enum Rarity {
    Common = 'common',
    Uncommon = 'uncommon',
    Rare = 'rare',
    Epic = 'epic',
    Legendary = 'legendary',
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

export enum Durability {
    Low = 'low',
    Medium = 'medium',
    High = 'high',
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
    durability: Durability
    basePrice: number // Price for 1% content in an item part
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

export enum MaterialCategoryIdEnum {
    Metal = 'metal',
    Wood = 'wood',
    // Can be easily extended with new categories
}

// Initial material categories
export const initialMaterialCategories: MaterialCategory[] = [
    { id: MaterialCategoryIdEnum.Metal, name: 'Metal' },
    { id: MaterialCategoryIdEnum.Wood, name: 'Wood' },
]

// Initial material types with one of each rarity per category
export const initialMaterialTypes: MaterialType[] = [
    // Metal types
    {
        id: 'copper',
        name: 'Copper',
        categoryId: MaterialCategoryIdEnum.Metal,
        rarity: Rarity.Common,
        durability: Durability.Medium,
        basePrice: 10,
        optimalTemperatureRange: { min: 30, max: 80 },
    },
    // Wood types
    {
        id: 'pine',
        name: 'Pine',
        categoryId: MaterialCategoryIdEnum.Wood,
        rarity: Rarity.Common,
        durability: Durability.Low,
        basePrice: 5,
        optimalTemperatureRange: { min: 10, max: 60 },
    },
]

// ======= ITEMS =======
// TODO: Refactor to divide exact templates types that will be in config with corresponding molecules and atoms in its own files
// (for example, sword template with sword molecules and atoms, axe template with axe molecules and atoms)

export type Pinpoint = {
    coords: {
        x: number
        y: number
    }
    localOffset: {
        x: number
        y: number
    }
    localRotationAngle: number
    zIndex: number
}

// Item category enum
export enum ItemCategoryId {
    Weapon = 'weapon',
    // Future categories would go here: Armor, Magic, Accessories, etc.
}

// Item subcategory enum
export enum ItemSubCategoryId {
    MeleeWeapon = 'melee_weapon',
    // Future subcategories would go here: Range Weapon, Light Armor, Heavy Armor, etc.
}

export type ItemCategory = {
    id: ItemCategoryId
    name: string
}

export type ItemSubCategory = {
    id: ItemSubCategoryId
    name: string
    categoryId: ItemCategoryId
}

// Initial item categories
export const initialItemCategories: ItemCategory[] = [{ id: ItemCategoryId.Weapon, name: 'Weapon' }]

// Initial item subcategories
export const initialItemSubCategories: ItemSubCategory[] = [
    { id: ItemSubCategoryId.MeleeWeapon, name: 'Melee Weapon', categoryId: ItemCategoryId.Weapon },
    // Future subcategories would go here: Range Weapon, Light Armor, Heavy Armor, etc.
]

// export type JunkItemId = string
export type LootItemTemplateId = string
export type LootMoleculeId = string
export type LootAtomId = string

export enum LootItemTemplateType {
    Sword = 'sword',
    Axe = 'axe',
}

export interface LootItemTemplate {
    id: LootItemTemplateId
    subCategory: ItemSubCategoryId
    type: LootItemTemplateType
    name: string
    sockets: LootMoleculeSocket[]
}

export type LootMoleculeSocket = {
    acceptType: LootMoleculeType
    acceptTags: LootMoleculeTag[]
    relativeWeight?: number
    pinpoint: Pinpoint
}

export enum LootMoleculeType {
    SwordHilt = 'sword_hilt',
    SwordBlade = 'sword_blade',
    AxeHandle = 'axe_handle',
    AxeBlade = 'axe_blade',
}

export enum LootMoleculeTag {
    Handheld = 'handheld',
    Sharp = 'sharp',
}

export type LootMolecule = {
    id: LootMoleculeId
    type: LootMoleculeType
    name: string
    tags: LootMoleculeTag[]
    sockets: LootAtomSocket[]
}

export type LootAtomSocket = {
    acceptType: LootAtomType
    relativeWeight?: number
    pinpoint: Pinpoint
}

export enum LootAtomType {
    Pommel = 'pommel',
    Grip = 'grip',
    Guard = 'guard',
    Blade = 'blade',
    Handle = 'handle',
}

export type LootAtom = {
    id: LootAtomId
    type: LootAtomType
    name: string
    rarirty: Rarity
    assetPath: string
}

// ======= LOOT ITEMS =======

const swordTemplate: LootItemTemplate = {
    id: 'sword',
    subCategory: ItemSubCategoryId.MeleeWeapon,
    type: LootItemTemplateType.Sword,
    name: 'Basic Sword',
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
}
const axeTemplate: LootItemTemplate = {
    id: 'axe',
    subCategory: ItemSubCategoryId.MeleeWeapon,
    type: LootItemTemplateType.Axe,
    name: 'Basic Axe',
    sockets: [
        {
            acceptType: LootMoleculeType.AxeHandle,
            acceptTags: [LootMoleculeTag.Handheld],
            relativeWeight: 3,
            pinpoint: {
                coords: { x: 0, y: 0 },
                localOffset: { x: 0, y: 0 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
        {
            acceptType: LootMoleculeType.AxeBlade,
            acceptTags: [LootMoleculeTag.Sharp],
            relativeWeight: 7,
            pinpoint: {
                coords: { x: 0, y: 0.5 },
                localOffset: { x: 0.5, y: 0 },
                localRotationAngle: 90,
                zIndex: 0,
            },
        },
    ],
}

export type LootItemTemplateConfig = Record<LootItemTemplateType, LootItemTemplate[]>

// All loot item templates available in the game
export const lootItemTemplateConfig: LootItemTemplateConfig = {
    [LootItemTemplateType.Sword]: [swordTemplate],
    [LootItemTemplateType.Axe]: [axeTemplate],
}

// ======= LOOT MOLECULES =======

// Sword molecules and atoms
const swordHiltMolecule: LootMolecule = {
    id: 'sword_hilt',
    type: LootMoleculeType.SwordHilt,
    tags: [LootMoleculeTag.Handheld],
    name: 'Basic Sword Hilt',
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
}

const swordBladeMolecule: LootMolecule = {
    id: 'sword_blade',
    type: LootMoleculeType.SwordBlade,
    tags: [LootMoleculeTag.Sharp],
    name: 'Basic Sword Blade',
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
}

const swordBasicGuardAtom: LootAtom = {
    id: 'sword_basic_guard',
    type: LootAtomType.Guard,
    name: 'Basic Sword Guard',
    rarirty: Rarity.Common,
    assetPath: 'assets/sword/guards/basic-guard.png',
}
const swordBasicGripAtom: LootAtom = {
    id: 'sword_basic_grip',
    type: LootAtomType.Grip,
    name: 'Basic Sword Grip',
    rarirty: Rarity.Common,
    assetPath: 'assets/sword/grips/basic-grip.png',
}
const swordBasicPommelAtom: LootAtom = {
    id: 'sword_basic_pommel',
    type: LootAtomType.Pommel,
    name: 'Basic Sword Pommel',
    rarirty: Rarity.Common,
    assetPath: 'assets/sword/pommels/basic-pommel.png',
}
const swordBasicBladeAtom: LootAtom = {
    id: 'sword_basic_blade',
    type: LootAtomType.Blade,
    name: 'Basic Sword Blade',
    rarirty: Rarity.Common,
    assetPath: 'assets/sword/blades/basic-blade.png',
}

// Axe molecules and atoms

const axeHandleMolecule: LootMolecule = {
    id: 'axe_handle',
    type: LootMoleculeType.AxeHandle,
    tags: [LootMoleculeTag.Handheld],
    name: 'Basic Axe Handle',
    sockets: [
        {
            acceptType: LootAtomType.Handle,
            relativeWeight: 1,
            pinpoint: {
                coords: { x: 0, y: 0 },
                localOffset: { x: 0, y: 0 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
    ],
}
const axeBladeMolecule: LootMolecule = {
    id: 'axe_blade',
    type: LootMoleculeType.AxeBlade,
    tags: [LootMoleculeTag.Sharp],
    name: 'Basic Axe Blade',
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
}

const axeBasicHandleAtom: LootAtom = {
    id: 'axe_basic_handle',
    type: LootAtomType.Handle,
    name: 'Basic Axe Handle',
    rarirty: Rarity.Common,
    assetPath: 'assets/axe/handles/basic-handle.png',
}
const axeBasicBladeAtom: LootAtom = {
    id: 'axe_basic_blade',
    type: LootAtomType.Blade,
    name: 'Basic Axe Blade',
    rarirty: Rarity.Common,
    assetPath: 'assets/axe/blades/basic-blade.png',
}

export type LootMoleculeConfig = Record<LootMoleculeType, LootMolecule[]>
// All molecules and atoms available in the game
export const lootMoleculeConfig: Record<LootMoleculeType, LootMolecule[]> = {
    [LootMoleculeType.SwordHilt]: [swordHiltMolecule],
    [LootMoleculeType.SwordBlade]: [swordBladeMolecule],
    [LootMoleculeType.AxeHandle]: [axeHandleMolecule],
    [LootMoleculeType.AxeBlade]: [axeBladeMolecule],
}

export type LootAtomConfig = Record<LootAtomType, LootAtom[]>
export const lootAtomConfig: Record<LootAtomType, LootAtom[]> = {
    [LootAtomType.Guard]: [swordBasicGuardAtom],
    [LootAtomType.Grip]: [swordBasicGripAtom],
    [LootAtomType.Pommel]: [swordBasicPommelAtom],
    [LootAtomType.Blade]: [swordBasicBladeAtom, axeBasicBladeAtom],
    [LootAtomType.Handle]: [axeBasicHandleAtom],
}

// ======= LOOT OBJECTS TYPES (that will be generated in build time and then used in runtime) =======

export type LootItemId = string
export type LootPartId = string
export type LootDetailId = LootAtomId

export type LootItem = {
    id: LootItemId
    subparts: LootPartId[]
    materialComposition: MaterialComposition[]
    rarity: Rarity
}

export type LootPart = {
    id: LootPartId
    subparts: LootDetailId[]
    materialComposition: MaterialComposition[]
    rarity: Rarity
}

export type LootDetail = {
    id: LootDetailId
    materialComposition: MaterialComposition[]
    rarity: Rarity
}

export type LootJunk = LootDetail & {
    durability: number
    overrideAssetPath?: string
}

export type LootJunkItem = LootJunk & {
    degradation: number
}

const materialTypes = initialMaterialTypes

// Utility functions for rarity calculation
const getRarityValue = (rarity: Rarity): number => {
    const rarityValues: Record<Rarity, number> = {
        [Rarity.Common]: 1,
        [Rarity.Uncommon]: 2,
        [Rarity.Rare]: 3,
        [Rarity.Epic]: 4,
        [Rarity.Legendary]: 5,
    }
    return rarityValues[rarity]
}

const getValueRarity = (value: number): Rarity => {
    if (value >= 4.5) return Rarity.Legendary
    if (value >= 3.5) return Rarity.Epic
    if (value >= 2.5) return Rarity.Rare
    if (value >= 1.5) return Rarity.Uncommon
    return Rarity.Common
}

// Calculate rarity based on material composition
const calculateMaterialRarity = (materialComposition: MaterialComposition[]): number => {
    let weightedRarityValue = 0
    let totalPercentage = 0

    materialComposition.forEach(({ materialId, percentage }) => {
        // Find material type from the materialId
        const material = materialTypes.find((mt) => mt.id === materialId)
        if (material) {
            const rarityValue = getRarityValue(material.rarity)
            weightedRarityValue += rarityValue * percentage
            totalPercentage += percentage
        }
    })

    return totalPercentage > 0 ? weightedRarityValue / totalPercentage : getRarityValue(Rarity.Common)
}

// Calculate weighted rarity from components and material composition
const calculateFinalRarity = (
    components: Array<{ rarity: Rarity; weight: number }>,
    materialComposition: MaterialComposition[],
    componentRarityWeight: number = 0.6 // Default weight for component rarity (vs material rarity)
): Rarity => {
    // Calculate component rarity
    let combinedRarityValue = 0
    let totalWeight = 0

    components.forEach(({ rarity, weight }) => {
        combinedRarityValue += getRarityValue(rarity) * weight
        totalWeight += weight
    })

    const componentRarityValue = totalWeight > 0 ? combinedRarityValue / totalWeight : getRarityValue(Rarity.Common)

    // Calculate material rarity
    const materialRarityValue = calculateMaterialRarity(materialComposition)

    // Combined weighted rarity
    const finalRarityValue =
        componentRarityValue * componentRarityWeight + materialRarityValue * (1 - componentRarityWeight)

    return getValueRarity(finalRarityValue)
}

// Utility function for durability calculation
const getDurabilityValue = (durability: Durability): number => {
    const durabilityValues: Record<Durability, number> = {
        [Durability.Low]: 1,
        [Durability.Medium]: 2,
        [Durability.High]: 3,
    }
    return durabilityValues[durability]
}

// Calculate durability based on material composition
const calculateDurability = (materialComposition: MaterialComposition[]): number => {
    let weightedDurability = 0
    let totalPercentage = 0

    materialComposition.forEach(({ materialId, percentage }) => {
        // Find material type from the materialId
        const materialType = materialTypes.find((mt) => mt.id === materialId)
        if (materialType) {
            const durabilityValue = getDurabilityValue(materialType.durability)
            weightedDurability += durabilityValue * percentage
            totalPercentage += percentage
        }
    })

    // Base durability from 100-300 based on materials (Low=100, Medium=200, High=300)
    return totalPercentage > 0 ? (weightedDurability / totalPercentage) * 100 : 100
}

export const generateAllLootObjectsInGame = (
    lootItemTemplateConfig: LootItemTemplateConfig,
    lootMoleculeConfig: LootMoleculeConfig,
    lootAtomConfig: LootAtomConfig
) => {
    const lootItems: Record<LootItemId, LootItem> = {}
    const lootParts: Record<LootPartId, LootPart> = {}
    const lootDetails: Record<LootDetailId, LootDetail> = {}
    const lootJunkItems: Record<LootDetailId, LootJunkItem> = {}

    // Helper to combine material compositions with weights
    const combineMaterialCompositions = (
        compositions: Array<{ composition: MaterialComposition[]; weight: number }>
    ): MaterialComposition[] => {
        const materialMap = new Map<MaterialId, number>()
        let totalWeight = 0

        // Sum all weights and accumulate material percentages
        compositions.forEach(({ composition, weight }) => {
            totalWeight += weight
            composition.forEach(({ materialId, percentage }) => {
                const weightedPercentage = (percentage * weight) / 100
                materialMap.set(materialId, (materialMap.get(materialId) || 0) + weightedPercentage)
            })
        })

        // Normalize percentages based on total weight
        const result: MaterialComposition[] = []
        materialMap.forEach((weightedPercentage, materialId) => {
            const normalizedPercentage = (weightedPercentage / totalWeight) * 100
            result.push({
                materialId,
                percentage: parseFloat(normalizedPercentage.toFixed(2)),
            })
        })

        // Ensure percentages sum to exactly 100%
        if (result.length > 0) {
            const sum = result.reduce((acc, { percentage }) => acc + percentage, 0)
            const adjustment = 100 - sum
            result[0].percentage += parseFloat(adjustment.toFixed(2))
        }

        return result
    }

    /**
     * Phase 1: Generate Loot Details
     * Creates loot details from atoms combined with materials
     */
    const generateLootDetails = () => {
        Object.values(lootAtomConfig).forEach((atoms) => {
            atoms.forEach((atom) => {
                const materials = Array.from(materialTypes.values())
                materials.forEach((material) => {
                    const lootDetailId = `${atom.id}-${material.id}`
                    lootDetails[lootDetailId] = {
                        id: lootDetailId,
                        materialComposition: [
                            {
                                materialId: material.id,
                                percentage: 100, // 100% of this single material
                            },
                        ],
                        rarity: atom.rarirty, // Using atom rarity directly for details
                    }
                })
            })
        })
    }

    /**
     * Phase 2: Generate Loot Parts
     * Creates loot parts by combining atoms into molecules
     */
    const generateLootParts = () => {
        // Helper to generate atom combinations for a molecule
        const generateAtomCombinationsForMolecule = (molecule: LootMolecule): LootDetailId[][] => {
            // For each socket, get all compatible atoms
            const atomsPerSocket = molecule.sockets.map((socket) => {
                const compatibleAtoms = lootAtomConfig[socket.acceptType].map((atom) => atom.id)

                // For each atom, get all material variants
                const atomMaterialVariants: LootDetailId[] = []
                compatibleAtoms.forEach((atomId) => {
                    const materials = Array.from(materialTypes.values())
                    materials.forEach((material) => {
                        atomMaterialVariants.push(`${atomId}-${material.id}`)
                    })
                })

                return atomMaterialVariants
            })

            // Generate all combinations using recursive helper
            const generateCombinations = (current: number, combination: LootDetailId[] = []): LootDetailId[][] => {
                if (current === atomsPerSocket.length) {
                    return [combination]
                }

                const result: LootDetailId[][] = []
                for (const detailId of atomsPerSocket[current]) {
                    result.push(...generateCombinations(current + 1, [...combination, detailId]))
                }
                return result
            }

            return generateCombinations(0)
        }

        Object.values(lootMoleculeConfig).forEach((molecules) => {
            molecules.forEach((molecule) => {
                // Get all possible atom combinations for this molecule
                const atomCombinations = generateAtomCombinationsForMolecule(molecule)

                // Create a unique loot part for each combination
                atomCombinations.forEach((detailIds) => {
                    const lootPartId = `${molecule.id}-[${detailIds.join('-')}]`

                    // Calculate material composition based on details and molecule sockets
                    const materialCompositions = detailIds.map((detailId, index) => {
                        const socketWeight = molecule.sockets[index].relativeWeight || 1
                        return {
                            composition: lootDetails[detailId].materialComposition,
                            weight: socketWeight,
                        }
                    })

                    const materialComposition = combineMaterialCompositions(materialCompositions)

                    // Calculate rarity components
                    const rarityComponents = detailIds.map((detailId, index) => ({
                        rarity: lootDetails[detailId].rarity,
                        weight: molecule.sockets[index].relativeWeight || 1,
                    }))

                    // Calculate final rarity (60% from details, 40% from materials)
                    const finalRarity = calculateFinalRarity(rarityComponents, materialComposition, 0.6)

                    const lootPart: LootPart = {
                        id: lootPartId,
                        subparts: detailIds,
                        materialComposition: materialComposition,
                        rarity: finalRarity,
                    }

                    lootParts[lootPartId] = lootPart
                })
            })
        })
    }

    /**
     * Phase 3: Generate Loot Items
     * Creates loot items by combining parts according to templates
     */
    const generateLootItems = () => {
        // Helper to generate part combinations for an item template
        const generatePartCombinationsForTemplate = (template: LootItemTemplate): LootPartId[][] => {
            // For each socket, get all compatible parts
            const partsPerSocket = template.sockets.map((socket) => {
                const compatibleMolecules = Object.values(lootMoleculeConfig[socket.acceptType] || []).filter(
                    (molecule) => socket.acceptTags.every((tag) => molecule.tags.includes(tag))
                )

                // Get all parts created from these molecules
                return Object.values(lootParts)
                    .filter((part) => compatibleMolecules.some((molecule) => part.id.startsWith(`${molecule.id}-`)))
                    .map((part) => part.id)
            })

            // Generate all combinations using recursive helper
            const generateCombinations = (current: number, combination: LootPartId[] = []): LootPartId[][] => {
                if (current === partsPerSocket.length) {
                    return [combination]
                }

                const result: LootPartId[][] = []
                for (const partId of partsPerSocket[current]) {
                    result.push(...generateCombinations(current + 1, [...combination, partId]))
                }
                return result
            }

            return generateCombinations(0)
        }

        Object.values(lootItemTemplateConfig).forEach((templates) => {
            templates.forEach((template) => {
                // Get all possible part combinations for this template
                const partCombinations = generatePartCombinationsForTemplate(template)

                // Create a unique loot item for each combination
                partCombinations.forEach((partIds) => {
                    const lootItemId = `${template.id}-[${partIds.join('-')}]`

                    // Calculate material composition based on parts and template sockets
                    const materialCompositions = partIds.map((partId, index) => {
                        const socketWeight = template.sockets[index].relativeWeight || 1
                        return {
                            composition: lootParts[partId].materialComposition,
                            weight: socketWeight,
                        }
                    })

                    const materialComposition = combineMaterialCompositions(materialCompositions)

                    // Calculate rarity components
                    const rarityComponents = partIds.map((partId, index) => ({
                        rarity: lootParts[partId].rarity,
                        weight: template.sockets[index].relativeWeight || 1,
                    }))

                    // Calculate final rarity (70% from parts, 30% from materials)
                    const finalRarity = calculateFinalRarity(rarityComponents, materialComposition, 0.7)

                    const lootItem: LootItem = {
                        id: lootItemId,
                        subparts: partIds,
                        materialComposition: materialComposition,
                        rarity: finalRarity,
                    }

                    lootItems[lootItemId] = lootItem
                })
            })
        })
    }

    /**
     * Phase 4: Generate Loot Junk Items
     * Creates loot junk items from loot details with durability
     */
    const generateLootJunkItems = () => {
        Object.values(lootDetails).forEach((detail) => {
            const durability = calculateDurability(detail.materialComposition)

            const lootJunkItem: LootJunkItem = {
                ...detail,
                durability,
                degradation: 0, // Start with no degradation
            }

            lootJunkItems[detail.id] = lootJunkItem
        })
    }

    // Generate all loot objects in sequence
    generateLootDetails()
    generateLootParts()
    generateLootItems()
    generateLootJunkItems() // Add this line to generate junk items

    return { lootParts, lootItems, lootDetails, lootJunkItems } // Add lootJunkItems to return
}
