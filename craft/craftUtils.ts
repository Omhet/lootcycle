import {
    LootAtomType,
    LootJunkItem,
    MaterialComposition,
    lootAtomConfig,
    lootItemTemplateConfig,
    lootMoleculeConfig,
} from "./craftModel.js";

// Helper function to find atom by ID and get its name
export const getAtomReadableName = (atomId: string): string => {
    // Find the atom in the config
    const atom = Object.values(lootAtomConfig)
        .flat()
        .find((a) => a.id === atomId);

    // Return the explicit name if found, otherwise the ID
    return atom ? atom.name : atomId;
};

// Helper function to find molecule by ID and get its name
export const getMoleculeReadableName = (moleculeId: string): string => {
    // Find the molecule in the config
    const molecule = Object.values(lootMoleculeConfig)
        .flat()
        .find((m) => m.id === moleculeId);

    // Return the explicit name if found, otherwise the ID
    return molecule ? molecule.name : moleculeId;
};

// Helper function to find template by ID and get its name
export const getTemplateReadableName = (templateId: string): string => {
    // Find the template in the config
    const template = Object.values(lootItemTemplateConfig)
        .flat()
        .find((t) => t.id === templateId);

    // Return the explicit name if found, otherwise capitalize the ID
    return template
        ? template.name
        : templateId.charAt(0).toUpperCase() + templateId.slice(1);
};

// Helper function to extract molecule ID from part ID
export const getMoleculeIdFromPartId = (partId: string): string => {
    // Part ID format is like "sword_hilt-[atom1-atom2-atom3]"
    return partId.split("-[")[0];
};

// Helper function to extract template ID from item ID
export const getTemplateIdFromItemId = (itemId: string): string => {
    // Item ID format is like "sword-[part1-part2]"
    return itemId.split("-[")[0];
};

// Helper function to get atom type
export const getAtomType = (atomId: string): LootAtomType | undefined => {
    const atom = Object.values(lootAtomConfig)
        .flat()
        .find((a) => a.id === atomId);

    return atom?.type;
};

// Helper function to format material composition in a readable way
export const formatMaterialComposition = (
    materialComposition: MaterialComposition[]
): string => {
    if (!materialComposition || materialComposition.length === 0)
        return "No materials";

    return materialComposition
        .map(
            ({ materialId, percentage }) =>
                `${materialId}: ${percentage.toFixed(1)}%`
        )
        .join(", ");
};

/**
 * Randomly select junk items from the available pool
 * and apply random degradation levels to them
 *
 * @param availableJunkItems Pool of all available junk items
 * @param minCount Minimum number of items to select
 * @param maxCount Maximum number of items to select
 * @returns Array of randomly selected junk items with random degradation (may contain duplicates)
 */
export const getRandomJunkItems = (
    availableJunkItems: LootJunkItem[],
    minCount: number = 3,
    maxCount: number = 10
): LootJunkItem[] => {
    // Determine a random quantity between min and max
    const count =
        Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
    const result: LootJunkItem[] = [];

    // Randomly select items from the available pool (allowing duplicates)
    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(
            Math.random() * availableJunkItems.length
        );

        // Create a deep copy of the selected item
        const selectedItem = { ...availableJunkItems[randomIndex] };

        // Apply random degradation between 0 and 100
        selectedItem.degradation = Math.floor(Math.random() * 101);

        result.push(selectedItem);
    }

    return result;
};
