// ======= BASIC TYPES AND ENUMERATIONS =======

import { ItemCategoryIdEnum, ItemSubCategoryIdEnum, ItemTemplateIdEnum } from './data/item/craftItemDataInit'

// Typed identifiers
export type MaterialCategoryId = string
export type MaterialTypeId = string
export type MaterialId = string
export type ItemCategoryId = ItemCategoryIdEnum
export type ItemSubCategoryId = ItemSubCategoryIdEnum
export type ItemTemplateId = ItemTemplateIdEnum
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

const configLootItemTemplates: Record<LootItemTemplateType, LootItemTemplate> = {
    [LootItemTemplateType.Sword]: swordTemplate,
    [LootItemTemplateType.Axe]: axeTemplate,
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

const swordGuardAtom: LootAtom = {
    type: LootAtomType.Guard,
}
const swordGripAtom: LootAtom = {
    type: LootAtomType.Grip,
}
const swordPommelAtom: LootAtom = {
    type: LootAtomType.Pommel,
}
const swordBladeAtom: LootAtom = {
    type: LootAtomType.Blade,
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

const axeHandleAtom: LootAtom = {
    type: LootAtomType.Handle,
}
const axeBladeAtom: LootAtom = {
    type: LootAtomType.Blade,
}

const configLootMolecules: Record<LootMoleculeType, LootMolecule> = {
    [LootMoleculeType.SwordHilt]: swordHiltMolecule,
    [LootMoleculeType.SwordBlade]: swordBladeMolecule,
    [LootMoleculeType.AxeHandle]: axeHandleMolecule,
    [LootMoleculeType.AxeBlade]: axeBladeMolecule,
}
