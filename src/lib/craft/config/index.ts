import {
    LootAtom,
    LootAtomType,
    LootConfig,
    LootItemTemplate,
    LootItemTemplateType,
    LootMolecule,
    LootMoleculeType,
} from "../craftModel.js";

// Import configurations from specific template files
import { swordAtoms, swordMolecules, swordTemplates } from "./sword.js";
// import { axeAtoms, axeMolecules, axeTemplates } from "./axe.js"; // Example for future expansion

// Combine all imported configurations
const allAtoms: LootAtom[] = [
    ...swordAtoms,
    // ...axeAtoms,
];

const allMolecules: LootMolecule[] = [
    ...swordMolecules,
    // ...axeMolecules,
];

const allTemplates: LootItemTemplate[] = [
    ...swordTemplates,
    // ...axeTemplates,
];

// Helper function to group items by their type into a Record
function groupByType<T extends { type: string }, K extends string>(
    items: T[],
    typeEnum: Record<string, K>
): Record<K, T[]> {
    const grouped: Partial<Record<K, T[]>> = {};

    for (const key in typeEnum) {
        const typeValue = typeEnum[key] as K;
        grouped[typeValue] = [];
    }

    items.forEach((item) => {
        const itemType = item.type as K;
        if (grouped[itemType]) {
            grouped[itemType]!.push(item);
        } else {
            console.warn(
                `Item with type ${item.type} does not match any known type enum value.`
            );
        }
    });

    return grouped as Record<K, T[]>;
}

// Assemble the final LootConfig object
export const lootConfig: LootConfig = {
    lootItemTemplates: groupByType(allTemplates, LootItemTemplateType),
    lootMolecules: groupByType(allMolecules, LootMoleculeType),
    lootAtoms: groupByType(allAtoms, LootAtomType),
};

// Optional: Log the assembled config for debugging
// console.log("Assembled Loot Config:", JSON.stringify(lootConfig, null, 2));
