import {
    LootAtomConfig,
    LootAtomType,
    LootItemTemplateConfig,
    LootMoleculeConfig,
    MaterialComposition,
    generateAllLootObjectsInGame,
    lootAtomConfig,
    lootItemTemplateConfig,
    lootMoleculeConfig,
} from './craftModel'

export const logLootObjectsInHumanReadableFormat = (
    lootItemTemplateConfig: LootItemTemplateConfig,
    lootMoleculeConfig: LootMoleculeConfig,
    lootAtomConfig: LootAtomConfig
) => {
    const { lootParts, lootItems, lootDetails, lootJunkItems } = generateAllLootObjectsInGame(
        lootItemTemplateConfig,
        lootMoleculeConfig,
        lootAtomConfig
    )

    // Helper function to find atom by ID and get its name
    const getAtomReadableName = (atomId: string): string => {
        // Find the atom in the config
        const atom = Object.values(lootAtomConfig)
            .flat()
            .find((a) => a.id === atomId)

        // Return the explicit name if found, otherwise the ID
        return atom ? atom.name : atomId
    }

    // Helper function to find molecule by ID and get its name
    const getMoleculeReadableName = (moleculeId: string): string => {
        // Find the molecule in the config
        const molecule = Object.values(lootMoleculeConfig)
            .flat()
            .find((m) => m.id === moleculeId)

        // Return the explicit name if found, otherwise the ID
        return molecule ? molecule.name : moleculeId
    }

    // Helper function to find template by ID and get its name
    const getTemplateReadableName = (templateId: string): string => {
        // Find the template in the config
        const template = Object.values(lootItemTemplateConfig)
            .flat()
            .find((t) => t.id === templateId)

        // Return the explicit name if found, otherwise capitalize the ID
        return template ? template.name : templateId.charAt(0).toUpperCase() + templateId.slice(1)
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

    // Helper function to get atom type
    const getAtomType = (atomId: string): LootAtomType | undefined => {
        const atom = Object.values(lootAtomConfig)
            .flat()
            .find((a) => a.id === atomId)

        return atom?.type
    }

    // Helper function to format material composition in a readable way
    const formatMaterialComposition = (materialComposition: MaterialComposition[]): string => {
        if (!materialComposition || materialComposition.length === 0) return 'No materials'

        return materialComposition
            .map(({ materialId, percentage }) => `${materialId}: ${percentage.toFixed(1)}%`)
            .join(', ')
    }

    // Log all loot details (atoms) in human-readable format
    console.log('\n=== LOOT DETAILS (ATOMS) ===')
    for (const detailId in lootDetails) {
        const detail = lootDetails[detailId]
        const readableName = getAtomReadableName(detailId)
        const atomType = getAtomType(detailId)

        if (atomType) {
            console.log(
                `${readableName} [${detail.rarity}] (Type: ${atomType}) (Materials: ${formatMaterialComposition(
                    detail.materialComposition
                )})`
            )
        } else {
            console.log(
                `${readableName} [${detail.rarity}] (Materials: ${formatMaterialComposition(
                    detail.materialComposition
                )})`
            )
        }
    }

    // Log all loot junk items in human-readable format
    console.log('\n=== LOOT JUNK ITEMS ===')
    for (const junkItemId in lootJunkItems) {
        const junkItem = lootJunkItems[junkItemId]
        const readableName = getAtomReadableName(junkItemId)
        const atomType = getAtomType(junkItemId)

        if (atomType) {
            console.log(
                `${readableName} [${junkItem.rarity}] (Type: ${atomType}) (Durability: ${junkItem.durability.toFixed(
                    1
                )}) (Degradation: ${junkItem.degradation}%) (Materials: ${formatMaterialComposition(
                    junkItem.materialComposition
                )})`
            )
        } else {
            console.log(
                `${readableName} [${junkItem.rarity}] (Durability: ${junkItem.durability.toFixed(1)}) (Degradation: ${
                    junkItem.degradation
                }%) (Materials: ${formatMaterialComposition(junkItem.materialComposition)})`
            )
        }
    }

    // Log all loot parts in human-readable format
    console.log('\n=== LOOT PARTS ===')
    for (const partId in lootParts) {
        const part = lootParts[partId]
        const moleculeId = getMoleculeIdFromPartId(partId)
        const moleculeName = getMoleculeReadableName(moleculeId)

        // Get readable names of all atoms in this part
        const atomNames = part.subparts.map((atomId) => getAtomReadableName(atomId))

        console.log(
            `${moleculeName} [${part.rarity}] (${atomNames.join(', ')}) (Materials: ${formatMaterialComposition(
                part.materialComposition
            )})`
        )
    }

    // Log all loot items in human-readable format
    console.log('\n=== LOOT ITEMS ===')
    for (const itemId in lootItems) {
        const item = lootItems[itemId]
        const templateId = getTemplateIdFromItemId(itemId)
        const templateName = getTemplateReadableName(templateId)

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

        console.log(
            `${templateName} [${item.rarity}] (Temp: ${item.temperatureRange.min}°C-${
                item.temperatureRange.max
            }°C) (MasterTemp: ${item.masterQualityTemperatureRange.min}°C-${
                item.masterQualityTemperatureRange.max
            }°C) (Materials: ${formatMaterialComposition(item.materialComposition)}): ${partDescs.join(', ')}`
        )
    }
}

// Call the function to log all generated loot objects
logLootObjectsInHumanReadableFormat(lootItemTemplateConfig, lootMoleculeConfig, lootAtomConfig)
