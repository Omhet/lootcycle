// ======= BASIC TYPES AND ENUMERATIONS =======

import { ItemCategoryIdEnum, ItemSubCategoryIdEnum, ItemTemplateIdEnum } from './data/item/craftItemDataInit'

// Typed identifiers
export type MaterialCategoryId = string
export type MaterialTypeId = string
export type MaterialId = string
export type ItemCategoryId = ItemCategoryIdEnum
export type ItemSubCategoryId = ItemSubCategoryIdEnum
export type ItemTemplateId = ItemTemplateIdEnum
export type JunkItemId = string
export type LootItemId = string
export type LootPartId = string

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

export enum LootItemTemplateType {
    Sword = 'sword',
    Axe = 'axe',
}

export interface LootItemTemplate {
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
    type: LootAtomType
    assetPath: string
}

// ======= LOOT ITEMS =======

const swordTemplate: LootItemTemplate = {
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
    type: LootAtomType.Guard,
    assetPath: 'assets/sword/guards/basic-guard.png',
}
const swordBasicGripAtom: LootAtom = {
    type: LootAtomType.Grip,
    assetPath: 'assets/sword/grips/basic-grip.png',
}
const swordBasicPommelAtom: LootAtom = {
    type: LootAtomType.Pommel,
    assetPath: 'assets/sword/pommels/basic-pommel.png',
}
const swordBasicBladeAtom: LootAtom = {
    type: LootAtomType.Blade,
    assetPath: 'assets/sword/blades/basic-blade.png',
}

// Axe molecules and atoms

const axeHandleMolecule: LootMolecule = {
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
    type: LootAtomType.Handle,
    assetPath: 'assets/axe/handles/basic-handle.png',
}
const axeBasicBladeAtom: LootAtom = {
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

export type LootObject = {
    id: LootItemId
    template: LootItemTemplateType
    subparts: LootPartId[]
    materials: MaterialComposition[]
}

export type LootPartObject = {
    id: LootPartId
    subparts: LootPartId[]
    materials: MaterialComposition[]
}

export type LootJunkObject = LootPartObject & {
    overrideAssetPath?: string
}

export const generateAllLootObjectsInGame = (
    lootItemTemplateConfig: LootItemTemplateConfig,
    lootMoleculeConfig: LootMoleculeConfig,
    lootAtomConfig: LootAtomConfig
) => {
    const lootObjects: Record<LootItemId, LootItemTemplate> = {}
    const lootParts: Record<LootPartId, LootPartObject> = {}
    const lootJunk: Record<JunkItemId, LootJunkObject> = {}

    // Generate all loot parts
    for (const [_templateType, templates] of Object.entries(lootItemTemplateConfig)) {
        for (const template of templates) {
            for (const [_moleculeType, molecules] of Object.entries(lootMoleculeConfig)) {
                for (const molecule of molecules) {
                    const lootPartId = `${template.type}_${molecule.type}`
                    lootParts[lootPartId] = {
                        id: lootPartId,
                        subparts: [],
                        materials: [],
                    }
                    for (const socket of molecule.sockets) {
                        for (const atom of lootAtomConfig[socket.acceptType]) {
                            const lootAtomId = `${molecule.type}_${atom.type}`
                            lootParts[lootPartId].subparts.push(lootAtomId)
                        }
                    }
                }
            }
        }
    }

    return { lootObjects, lootParts, lootJunk }
}
