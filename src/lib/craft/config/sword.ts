import {
    ItemSubCategoryId,
    LootAtom,
    LootAtomType,
    LootItemTemplate,
    LootItemTemplateType,
    LootMolecule,
    LootMoleculeTag,
    LootMoleculeType,
    Rarity,
} from "../craftModel.js";

// === Atoms for Sword ===

export const basicPommel: LootAtom = {
    id: "basic_pommel",
    type: LootAtomType.Pommel,
    name: "Basic Pommel",
    rarity: Rarity.Common,
    assetPath: "atoms/pommel_basic.png",
};

export const basicGrip: LootAtom = {
    id: "basic_grip",
    type: LootAtomType.Grip,
    name: "Basic Grip",
    rarity: Rarity.Common,
    assetPath: "atoms/grip_basic.png",
};

export const basicGuard: LootAtom = {
    id: "basic_guard",
    type: LootAtomType.Guard,
    name: "Basic Guard",
    rarity: Rarity.Common,
    assetPath: "atoms/guard_basic.png",
};

export const basicBladeAtom: LootAtom = {
    id: "basic_blade_atom", // Note: This ID represents the *atom* part of the blade
    type: LootAtomType.Blade,
    name: "Basic Blade Section",
    rarity: Rarity.Common,
    assetPath: "atoms/blade_basic.png",
};

// Export all atoms defined in this file
export const swordAtoms: LootAtom[] = [
    basicPommel,
    basicGrip,
    basicGuard,
    basicBladeAtom,
];

// === Molecules for Sword ===

export const basicSwordHilt: LootMolecule = {
    id: "basic_sword_hilt",
    type: LootMoleculeType.SwordHilt,
    name: "Basic Sword Hilt",
    tags: [LootMoleculeTag.Handheld],
    sockets: [
        {
            acceptType: LootAtomType.Pommel,
            relativeWeight: 1,
            pinpoint: {
                coords: { x: 0, y: 5 },
                localOffset: { x: 0, y: 0 },
                localRotationAngle: 0,
                zIndex: 1,
            },
        },
        {
            acceptType: LootAtomType.Grip,
            relativeWeight: 2,
            pinpoint: {
                coords: { x: 0, y: 20 },
                localOffset: { x: 0, y: 0 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
        {
            acceptType: LootAtomType.Guard,
            relativeWeight: 1.5,
            pinpoint: {
                coords: { x: 0, y: 40 },
                localOffset: { x: 0, y: 0 },
                localRotationAngle: 0,
                zIndex: 2,
            },
        },
    ],
};

export const basicSwordBlade: LootMolecule = {
    id: "basic_sword_blade",
    type: LootMoleculeType.SwordBlade,
    name: "Basic Sword Blade",
    tags: [LootMoleculeTag.Sharp],
    sockets: [
        {
            acceptType: LootAtomType.Blade,
            relativeWeight: 5,
            pinpoint: {
                coords: { x: 0, y: 100 },
                localOffset: { x: 0, y: 0 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
    ],
};

// Export all molecules defined in this file
export const swordMolecules: LootMolecule[] = [basicSwordHilt, basicSwordBlade];

// === Template for Sword ===

export const swordTemplate: LootItemTemplate = {
    id: "basic_sword",
    subCategory: ItemSubCategoryId.MeleeWeapon,
    type: LootItemTemplateType.Sword,
    name: "Basic Sword",
    sockets: [
        {
            acceptType: LootMoleculeType.SwordHilt,
            acceptTags: [LootMoleculeTag.Handheld],
            relativeWeight: 3,
            pinpoint: {
                coords: { x: 100, y: 300 },
                localOffset: { x: 0, y: 0 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
        {
            acceptType: LootMoleculeType.SwordBlade,
            acceptTags: [LootMoleculeTag.Sharp],
            relativeWeight: 5,
            pinpoint: {
                coords: { x: 100, y: 250 },
                localOffset: { x: 0, y: -50 },
                localRotationAngle: 0,
                zIndex: 1,
            },
        },
    ],
};

// Export all templates defined in this file
export const swordTemplates: LootItemTemplate[] = [swordTemplate];
