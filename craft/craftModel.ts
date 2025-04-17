// ======= BASIC TYPES AND ENUMERATIONS =======

// Typed identifiers
export type MaterialCategoryId = string
export type MaterialTypeId = string
export type MaterialId = string

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

// export type ItemCategoryId = ItemCategoryIdEnum
// export type ItemSubCategoryId = ItemSubCategoryIdEnum
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
    type: LootItemTemplateType
    sockets: LootMoleculeSocket[]
}

export type LootMoleculeSocket = {
    acceptType: LootMoleculeType
    acceptTags: LootMoleculeTag[]
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
    tags: LootMoleculeTag[]
    sockets: LootAtomSocket[]
}

export type LootAtomSocket = {
    acceptType: LootAtomType
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
    assetPath: string
}

// ======= LOOT ITEMS =======

const swordTemplate: LootItemTemplate = {
    id: 'sword',
    type: LootItemTemplateType.Sword,
    sockets: [
        {
            acceptType: LootMoleculeType.SwordHilt,
            acceptTags: [LootMoleculeTag.Handheld],
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
    type: LootItemTemplateType.Axe,
    sockets: [
        {
            acceptType: LootMoleculeType.AxeHandle,
            acceptTags: [LootMoleculeTag.Handheld],
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
const lootItemTemplateConfig: LootItemTemplateConfig = {
    [LootItemTemplateType.Sword]: [swordTemplate],
    [LootItemTemplateType.Axe]: [axeTemplate],
}

// ======= LOOT MOLECULES =======

// Sword molecules and atoms
const swordHiltMolecule: LootMolecule = {
    id: 'sword_hilt',
    type: LootMoleculeType.SwordHilt,
    tags: [LootMoleculeTag.Handheld],
    sockets: [
        {
            acceptType: LootAtomType.Guard,
            pinpoint: {
                coords: { x: 0, y: 0.5 },
                localOffset: { x: 0, y: -0.5 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
        {
            acceptType: LootAtomType.Grip,
            pinpoint: {
                coords: { x: 0, y: 0 },
                localOffset: { x: 0, y: 0 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
        {
            acceptType: LootAtomType.Pommel,
            pinpoint: {
                coords: { x: 0, y: -0.5 },
                localOffset: { x: 0, y: 0.75 },
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
    sockets: [
        {
            acceptType: LootAtomType.Blade,
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
    assetPath: 'assets/sword/guards/basic-guard.png',
}
const swordBasicGripAtom: LootAtom = {
    id: 'sword_basic_grip',
    type: LootAtomType.Grip,
    assetPath: 'assets/sword/grips/basic-grip.png',
}
const swordBasicPommelAtom: LootAtom = {
    id: 'sword_basic_pommel',
    type: LootAtomType.Pommel,
    assetPath: 'assets/sword/pommels/basic-pommel.png',
}
const swordBasicBladeAtom: LootAtom = {
    id: 'sword_basic_blade',
    type: LootAtomType.Blade,
    assetPath: 'assets/sword/blades/basic-blade.png',
}

// Axe molecules and atoms

const axeHandleMolecule: LootMolecule = {
    id: 'axe_handle',
    type: LootMoleculeType.AxeHandle,
    tags: [LootMoleculeTag.Handheld],
    sockets: [
        {
            acceptType: LootAtomType.Handle,
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
    sockets: [
        {
            acceptType: LootAtomType.Blade,
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
    assetPath: 'assets/axe/handles/basic-handle.png',
}
const axeBasicBladeAtom: LootAtom = {
    id: 'axe_basic_blade',
    type: LootAtomType.Blade,
    assetPath: 'assets/axe/blades/basic-blade.png',
}

export type LootMoleculeConfig = Record<LootMoleculeType, LootMolecule[]>
// All molecules and atoms available in the game
const lootMoleculeConfig: Record<LootMoleculeType, LootMolecule[]> = {
    [LootMoleculeType.SwordHilt]: [swordHiltMolecule],
    [LootMoleculeType.SwordBlade]: [swordBladeMolecule],
    [LootMoleculeType.AxeHandle]: [axeHandleMolecule],
    [LootMoleculeType.AxeBlade]: [axeBladeMolecule],
}

export type LootAtomConfig = Record<LootAtomType, LootAtom[]>
const lootAtomConfig: Record<LootAtomType, LootAtom[]> = {
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
    materials: MaterialComposition[]
}

export type LootPart = {
    id: LootPartId
    subparts: LootDetailId[]
    materials: MaterialComposition[]
}

export type LootDetail = {
    id: LootDetailId
    materials: MaterialComposition[]
}

export type LootJunkObject = LootPart & {
    overrideAssetPath?: string
}

export const generateAllLootObjectsInGame = (
    lootItemTemplateConfig: LootItemTemplateConfig,
    lootMoleculeConfig: LootMoleculeConfig,
    lootAtomConfig: LootAtomConfig
) => {
    const lootItems: Record<LootItemId, LootItem> = {}
    const lootParts: Record<LootPartId, LootPart> = {}

    // Helper to generate atom combinations for a molecule
    const generateAtomCombinationsForMolecule = (molecule: LootMolecule): LootAtomId[][] => {
        // For each socket, get all compatible atoms
        const atomsPerSocket = molecule.sockets.map((socket) =>
            lootAtomConfig[socket.acceptType].map((atom) => atom.id)
        )

        // Generate all combinations using recursive helper
        const generateCombinations = (current: number, combination: LootAtomId[] = []): LootAtomId[][] => {
            if (current === atomsPerSocket.length) {
                return [combination]
            }

            const result: LootAtomId[][] = []
            for (const atomId of atomsPerSocket[current]) {
                result.push(...generateCombinations(current + 1, [...combination, atomId]))
            }
            return result
        }

        return generateCombinations(0)
    }

    // Generate all possible loot parts
    Object.values(lootMoleculeConfig).forEach((molecules) => {
        molecules.forEach((molecule) => {
            // Get all possible atom combinations for this molecule
            const atomCombinations = generateAtomCombinationsForMolecule(molecule)

            // Create a unique loot part for each combination
            atomCombinations.forEach((atomIds) => {
                const lootPartId = `${molecule.id}-[${atomIds.join('-')}]`

                const lootPart: LootPart = {
                    id: lootPartId,
                    subparts: atomIds,
                    materials: [],
                }

                lootParts[lootPartId] = lootPart
            })
        })
    })

    // Helper to generate part combinations for an item template
    const generatePartCombinationsForTemplate = (template: LootItemTemplate): LootPartId[][] => {
        // For each socket, get all compatible parts
        const partsPerSocket = template.sockets.map((socket) => {
            const compatibleMolecules = Object.values(lootMoleculeConfig[socket.acceptType] || []).filter((molecule) =>
                socket.acceptTags.every((tag) => molecule.tags.includes(tag))
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

    // Generate all possible loot items
    Object.values(lootItemTemplateConfig).forEach((templates) => {
        templates.forEach((template) => {
            // Get all possible part combinations for this template
            const partCombinations = generatePartCombinationsForTemplate(template)

            // Create a unique loot item for each combination
            partCombinations.forEach((partIds) => {
                const lootItemId = `${template.id}-[${partIds.join('-')}]`

                const lootItem: LootItem = {
                    id: lootItemId,
                    subparts: partIds,
                    materials: [],
                }

                lootItems[lootItemId] = lootItem
            })
        })
    })

    return { lootParts, lootItems }
}

export const logLootObjectsInHumanReadableFormat = (
    lootItemTemplateConfig: LootItemTemplateConfig,
    lootMoleculeConfig: LootMoleculeConfig,
    lootAtomConfig: LootAtomConfig
) => {
    const { lootParts, lootItems } = generateAllLootObjectsInGame(
        lootItemTemplateConfig,
        lootMoleculeConfig,
        lootAtomConfig
    )

    // Helper function to convert atom IDs to human-readable names
    const getAtomReadableName = (atomId: string): string => {
        // Find the atom in the config
        const atom = Object.values(lootAtomConfig)
            .flat()
            .find((a) => a.id === atomId)

        if (!atom) return atomId

        // Extract a readable name from the ID, preserving the item type prefix
        const nameParts = atom.id.split('_')

        // Capitalize all parts to keep the item type (sword/axe) visible
        return nameParts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
    }

    // Helper function to get molecule readable name
    const getMoleculeReadableName = (moleculeId: string): string => {
        // Find the molecule in the config
        const molecule = Object.values(lootMoleculeConfig)
            .flat()
            .find((m) => m.id === moleculeId)

        if (!molecule) return moleculeId

        // Convert molecule type to readable name, assuming format like "sword_hilt"
        const nameParts = molecule.id.split('_')
        return nameParts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
    }

    // Helper function to extract molecule ID from part ID
    const getMoleculeIdFromPartId = (partId: string): string => {
        // Part ID format is like "sword_hilt-[atom1-atom2-atom3]"
        return partId.split('-[')[0]
    }

    // Helper function to extract template ID from item ID
    const getTemplateIdFromItemId = (itemId: string): string => {
        // Item ID format is like "sword-[part1-part2]"
        return itemId.split('-[')[0]
    }

    // Log all loot parts in human-readable format
    console.log('\n=== LOOT PARTS ===')
    for (const partId in lootParts) {
        const part = lootParts[partId]
        const moleculeId = getMoleculeIdFromPartId(partId)
        const moleculeName = getMoleculeReadableName(moleculeId)

        // Get readable names of all atoms in this part
        const atomNames = part.subparts.map((atomId) => getAtomReadableName(atomId))

        console.log(`${moleculeName} (${atomNames.join(', ')})`)
    }

    // Log all loot items in human-readable format
    console.log('\n=== LOOT ITEMS ===')
    for (const itemId in lootItems) {
        const item = lootItems[itemId]
        const templateId = getTemplateIdFromItemId(itemId)

        // Get readable names of all parts in this item
        const partDescs = item.subparts.map((partId) => {
            const moleculeId = getMoleculeIdFromPartId(partId)
            const moleculeName = getMoleculeReadableName(moleculeId)

            // Get the part to find its atoms
            const part = lootParts[partId]
            if (!part) return moleculeName

            // Get readable names of all atoms in this part
            const atomNames = part.subparts.map((atomId) => getAtomReadableName(atomId))

            return `${moleculeName} (${atomNames.join(', ')})`
        })

        console.log(`${templateId.charAt(0).toUpperCase() + templateId.slice(1)}: ${partDescs.join(', ')}`)
    }
}

// Call the function to log all generated loot objects
// console.log(generateAllLootObjectsInGame(lootItemTemplateConfig, lootMoleculeConfig, lootAtomConfig))
logLootObjectsInHumanReadableFormat(lootItemTemplateConfig, lootMoleculeConfig, lootAtomConfig)
