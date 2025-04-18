import {
    formatMaterialComposition,
    getAtomReadableName,
    getAtomType,
    getMoleculeIdFromPartId,
    getMoleculeReadableName,
    getTemplateIdFromItemId,
    getTemplateReadableName,
} from "./craftUtils.js";

export const logLootObjectsInHumanReadableFormat = (
    // Removed config parameters, assuming data is loaded from elsewhere
    lootData: {
        lootParts: any;
        lootItems: any;
        lootDetails: any;
        lootJunkItems: any;
    } // Expect the generated data structure
) => {
    const { lootParts, lootItems, lootDetails, lootJunkItems } = lootData;

    // Log all loot details (atoms) in human-readable format
    console.log("\n=== LOOT DETAILS (ATOMS) ===");
    for (const detailId in lootDetails) {
        const detail = lootDetails[detailId];
        const readableName = getAtomReadableName(detailId);
        const atomType = getAtomType(detailId);

        if (atomType) {
            console.log(
                `${readableName} [${
                    detail.rarity
                }] (Type: ${atomType}) (Materials: ${formatMaterialComposition(
                    detail.materialComposition
                )})`
            );
        } else {
            console.log(
                `${readableName} [${
                    detail.rarity
                }] (Materials: ${formatMaterialComposition(
                    detail.materialComposition
                )})`
            );
        }
    }

    // Log all loot junk items in human-readable format
    console.log("\n=== LOOT JUNK ITEMS ===");
    for (const junkItemId in lootJunkItems) {
        const junkItem = lootJunkItems[junkItemId];
        const readableName = getAtomReadableName(junkItemId);
        const atomType = getAtomType(junkItemId);

        if (atomType) {
            console.log(
                `${readableName} [${
                    junkItem.rarity
                }] (Type: ${atomType}) (Durability: ${junkItem.durability.toFixed(
                    1
                )}) (Degradation: ${
                    junkItem.degradation
                }%) (Materials: ${formatMaterialComposition(
                    junkItem.materialComposition
                )})`
            );
        } else {
            console.log(
                `${readableName} [${
                    junkItem.rarity
                }] (Durability: ${junkItem.durability.toFixed(
                    1
                )}) (Degradation: ${
                    junkItem.degradation
                }%) (Materials: ${formatMaterialComposition(
                    junkItem.materialComposition
                )})`
            );
        }
    }

    // Log all loot parts in human-readable format
    console.log("\n=== LOOT PARTS ===");
    for (const partId in lootParts) {
        const part = lootParts[partId];
        const moleculeId = getMoleculeIdFromPartId(partId);
        const moleculeName = getMoleculeReadableName(moleculeId);

        // Get readable names of all atoms in this part
        const atomNames = part.subparts.map((atomId: string) =>
            getAtomReadableName(atomId)
        );

        console.log(
            `${moleculeName} [${part.rarity}] (${atomNames.join(
                ", "
            )}) (Materials: ${formatMaterialComposition(
                part.materialComposition
            )})`
        );
    }

    // Log all loot items in human-readable format
    console.log("\n=== LOOT ITEMS ===");
    for (const itemId in lootItems) {
        const item = lootItems[itemId];
        const templateId = getTemplateIdFromItemId(itemId);
        const templateName = getTemplateReadableName(templateId);

        // Get readable names of all parts in this item
        const partDescs = item.subparts.map((partId: string) => {
            const moleculeId = getMoleculeIdFromPartId(partId);
            const moleculeName = getMoleculeReadableName(moleculeId);

            // Get the part to find its atoms
            const part = lootParts[partId];
            if (!part) return moleculeName;

            // Get readable names of all atoms in this part
            const atomNames = part.subparts.map((atomId: string) =>
                getAtomReadableName(atomId)
            );

            return `${moleculeName} (${atomNames.join(", ")})`;
        });

        console.log(
            `${templateName} [${item.rarity}] (Temp: ${
                item.temperatureRange.min
            }°C-${item.temperatureRange.max}°C) (MasterTemp: ${
                item.masterQualityTemperatureRange.min
            }°C-${
                item.masterQualityTemperatureRange.max
            }°C) (Materials: ${formatMaterialComposition(
                item.materialComposition
            )}): ${partDescs.join(", ")}`
        );
    }
};

// Example of how to use it if you load the config:
/*
import * as fs from 'fs';
import * as path from 'path';

try {
    const configPath = path.join(__dirname, '../../public/config/lootConfig.json');
    const configData = fs.readFileSync(configPath, 'utf-8');
    const loadedLootData = JSON.parse(configData);
    logLootObjectsInHumanReadableFormat(loadedLootData);
} catch (error) {
    console.error("Failed to load or parse lootConfig.json. Run `pnpm generate:loot` first.", error);
}
*/
