import crypto from "crypto";
import {
    initialMaterialTypes,
    LootAtom,
    LootAtomSocket,
    LootAtomType,
    LootConfig,
    LootDetail,
    LootDetailId,
    LootItemId,
    LootItemTemplate,
    LootItemTemplateId,
    LootJunkItem,
    LootMolecule,
    LootMoleculeId,
    LootMoleculeSocket,
    LootPart,
    LootPartId,
    MaterialCategoryIdEnum,
    MaterialComposition,
    MaterialId,
    MaterialType,
    MaterialTypeId,
    Rarity,
    TemperatureRange,
} from "./craftModel.js";

// ======= CONSTANTS =======

export const RarityMultipliers: Record<Rarity, number> = {
    [Rarity.Common]: 1.0,
    [Rarity.Uncommon]: 1.5,
    [Rarity.Rare]: 2.5,
    [Rarity.Epic]: 4.0,
    [Rarity.Legendary]: 6.0,
};

const MasterQualityBoostMultiplier = 1.2;
const QualitySellPriceMultiplier = (quality: number) => 0.5 + quality / 200;

const materialTypeMap = new Map<string, MaterialType>(
    initialMaterialTypes.map((mt) => [mt.id, mt])
);

// ======= HELPER FUNCTIONS =======

// --- Value Calculation ---

function getMaterialCompositionBaseValue(
    composition: MaterialComposition[]
): number {
    return (
        composition.reduce((sum, mc) => {
            const materialType = materialTypeMap.get(mc.materialId);
            const pricePerPercent = materialType?.basePrice ?? 0;
            return sum + pricePerPercent * mc.percentage;
        }, 0) / 100
    );
}

export function calculateJunkValue(junkItem: LootJunkItem): number {
    const baseValue = getMaterialCompositionBaseValue(
        junkItem.materialComposition
    );
    const rarityMultiplier = RarityMultipliers[junkItem.rarity];
    const degradationFactor = junkItem.degradation / 100;
    return baseValue * rarityMultiplier * (1 - degradationFactor);
}

// --- Material Requirements & Selection ---

export function calculateRequiredMaterials(
    template: LootItemTemplate
): Map<MaterialTypeId, number> {
    const requirements = new Map<MaterialTypeId, number>();
    let totalWeight = 0;

    template.sockets.forEach((socket) => {
        totalWeight += socket.relativeWeight ?? 1;
    });

    let metalCount = 0;
    initialMaterialTypes.forEach((mt) => {
        if (mt.categoryId === MaterialCategoryIdEnum.Metal) {
            metalCount++;
        }
    });

    initialMaterialTypes.forEach((mt) => {
        if (mt.categoryId === MaterialCategoryIdEnum.Metal && metalCount > 0) {
            requirements.set(mt.id, totalWeight / metalCount);
        }
    });
    return requirements;
}

export function selectJunkItems(
    junkItemsWithValue: (LootJunkItem & { value: number })[],
    requiredMaterials: Map<MaterialTypeId, number>,
    template: LootItemTemplate,
    config: LootConfig
): LootJunkItem[] | null {
    if (!config) {
        console.error("Crafting config not provided to selectJunkItems!");
        return null;
    }
    const fittingJunk = junkItemsWithValue.filter((junk) => {
        let junkAtomType: LootAtomType | undefined = undefined;
        for (const type in config.lootAtoms) {
            if (
                config.lootAtoms[type as LootAtomType].some(
                    (atom: LootAtom) => atom.id === junk.atomId
                )
            ) {
                junkAtomType = type as LootAtomType;
                break;
            }
        }
        if (!junkAtomType) return false;

        return template.sockets.some((molSocket: LootMoleculeSocket) => {
            const molecules = config.lootMolecules[molSocket.acceptType] || [];
            return molecules.some((mol: LootMolecule) =>
                mol.sockets.some(
                    (atomSocket: LootAtomSocket) =>
                        atomSocket.acceptType === junkAtomType
                )
            );
        });
    });

    let totalRequiredWeight = 0;
    requiredMaterials.forEach((weight) => (totalRequiredWeight += weight));
    if (totalRequiredWeight <= 0) totalRequiredWeight = 1;

    fittingJunk.sort((a, b) => b.value - a.value);

    const selectedJunk: LootJunkItem[] = [];
    let currentWeightSum = 0;

    let remainingJunk = [...fittingJunk];
    let totalValueWeightSquared = remainingJunk.reduce(
        (sum, item) => sum + item.value * item.value,
        0
    );

    let targetValueSum =
        fittingJunk.reduce((sum, item) => sum + item.value, 0) * 0.7;

    if (remainingJunk.length === 0) {
        console.log("No fitting junk available.");
        return null;
    }

    while (currentWeightSum < targetValueSum && remainingJunk.length > 0) {
        if (totalValueWeightSquared <= 0) {
            const randomIndex = Math.floor(
                Math.random() * remainingJunk.length
            );
            const selected = remainingJunk.splice(randomIndex, 1)[0];
            selectedJunk.push(selected);
            currentWeightSum += Math.max(0, selected.value);
            totalValueWeightSquared = remainingJunk.reduce(
                (sum, item) => sum + Math.max(0, item.value * item.value),
                0
            );
            continue;
        }

        const randomThreshold = Math.random() * totalValueWeightSquared;
        let cumulativeWeight = 0;
        let selectedIndex = -1;

        for (let i = 0; i < remainingJunk.length; i++) {
            cumulativeWeight += Math.max(
                0,
                remainingJunk[i].value * remainingJunk[i].value
            );
            if (cumulativeWeight >= randomThreshold) {
                selectedIndex = i;
                break;
            }
        }

        if (selectedIndex === -1) {
            selectedIndex = remainingJunk.length - 1;
        }

        const selected = remainingJunk.splice(selectedIndex, 1)[0];
        selectedJunk.push(selected);
        currentWeightSum += Math.max(0, selected.value);

        totalValueWeightSquared = remainingJunk.reduce(
            (sum, item) => sum + Math.max(0, item.value * item.value),
            0
        );
    }

    if (selectedJunk.length === 0) {
        console.log("Not enough suitable junk selected (0 items).");
        return null;
    }

    return selectedJunk;
}

// --- Material Combination ---

export function combineMaterials(
    selectedJunk: (LootJunkItem & { value?: number })[]
): MaterialComposition[] {
    const combined = new Map<
        MaterialId,
        { totalPercentage: number; totalValueWeight: number }
    >();
    let totalValue = 0;

    selectedJunk.forEach((junk) => {
        const value = Math.max(0.001, junk.value ?? calculateJunkValue(junk));
        totalValue += value;
        junk.materialComposition.forEach((mc) => {
            const existing = combined.get(mc.materialId) || {
                totalPercentage: 0,
                totalValueWeight: 0,
            };
            existing.totalPercentage += mc.percentage * value;
            existing.totalValueWeight += value;
            combined.set(mc.materialId, existing);
        });
    });

    if (totalValue <= 0.001 * selectedJunk.length) {
        console.warn(
            "Total value of selected junk is near zero, averaging materials equally."
        );
        const combinedEqualWeight = new Map<
            MaterialId,
            { totalPercentage: number; count: number }
        >();
        let itemCount = 0;
        selectedJunk.forEach((junk) => {
            itemCount++;
            junk.materialComposition.forEach((mc) => {
                const existing = combinedEqualWeight.get(mc.materialId) || {
                    totalPercentage: 0,
                    count: 0,
                };
                existing.totalPercentage += mc.percentage;
                existing.count += 1;
                combinedEqualWeight.set(mc.materialId, existing);
            });
        });

        if (itemCount === 0) return [];

        const finalComposition: MaterialComposition[] = [];
        let totalFinalPercentage = 0;
        combinedEqualWeight.forEach((data, materialId) => {
            const avgPercentage =
                data.count > 0 ? data.totalPercentage / data.count : 0;
            if (avgPercentage > 0) {
                finalComposition.push({
                    materialId,
                    percentage: avgPercentage,
                });
                totalFinalPercentage += avgPercentage;
            }
        });
        return finalComposition
            .map((mc) => ({
                ...mc,
                percentage:
                    totalFinalPercentage > 0
                        ? Math.max(
                              0,
                              (mc.percentage / totalFinalPercentage) * 100
                          )
                        : 0,
            }))
            .filter((mc) => mc.percentage > 0.1);
    }

    const finalComposition: MaterialComposition[] = [];
    let totalFinalPercentage = 0;

    combined.forEach((data, materialId) => {
        const avgPercentage =
            data.totalValueWeight > 0
                ? data.totalPercentage / data.totalValueWeight
                : 0;
        if (avgPercentage > 0) {
            finalComposition.push({ materialId, percentage: avgPercentage });
            totalFinalPercentage += avgPercentage;
        }
    });

    return finalComposition
        .map((mc) => ({
            ...mc,
            percentage:
                totalFinalPercentage > 0
                    ? Math.max(0, (mc.percentage / totalFinalPercentage) * 100)
                    : 0,
        }))
        .filter((mc) => mc.percentage > 0.1);
}

// --- Temperature Calculation ---

function getWeightedAverageTemperature(composition: MaterialComposition[]): {
    avgMin: number;
    avgMax: number;
} {
    let weightedMinSum = 0;
    let weightedMaxSum = 0;
    let totalPercentage = 0;

    composition.forEach((mc) => {
        const materialType = materialTypeMap.get(mc.materialId);
        if (materialType && mc.percentage > 0) {
            weightedMinSum +=
                materialType.optimalTemperatureRange.min * mc.percentage;
            weightedMaxSum +=
                materialType.optimalTemperatureRange.max * mc.percentage;
            totalPercentage += mc.percentage;
        }
    });

    if (totalPercentage === 0) return { avgMin: 20, avgMax: 80 };

    return {
        avgMin: weightedMinSum / totalPercentage,
        avgMax: weightedMaxSum / totalPercentage,
    };
}

export function calculateTemperatureRanges(
    finalComposition: MaterialComposition[],
    potentialRarity: Rarity,
    template: LootItemTemplate
): { regularRange: TemperatureRange; masterRange: TemperatureRange } {
    const { avgMin, avgMax } = getWeightedAverageTemperature(finalComposition);
    const baseWidth = Math.max(1, avgMax - avgMin);

    const targetMidpoint = (avgMin + avgMax) / 2;
    const actualMidpoint = (avgMin + avgMax) / 2;
    const offset = actualMidpoint - targetMidpoint;

    const rarityIndex = Object.values(Rarity).indexOf(potentialRarity);
    const validRarityIndex = rarityIndex >= 0 ? rarityIndex : 0;
    const rarityFactor = 1.0 - validRarityIndex * 0.1;
    const adjustedWidth = Math.max(10, baseWidth * rarityFactor);

    const regularMidpoint = actualMidpoint + offset;
    const regularMin = regularMidpoint - adjustedWidth / 2;
    const regularMax = regularMidpoint + adjustedWidth / 2;
    const regularRange = { min: regularMin, max: regularMax };

    const masterWidth = adjustedWidth * 0.4;
    const masterMidpoint = (regularMin + regularMax) / 2;
    const masterRange = {
        min: masterMidpoint - masterWidth / 2,
        max: masterMidpoint + masterWidth / 2,
    };

    if (regularRange.min > regularRange.max)
        regularRange.min = regularRange.max - 0.1;
    if (masterRange.min > masterRange.max)
        masterRange.min = masterRange.max - 0.1;

    return { regularRange, masterRange };
}

// --- Quality Calculation ---

export function calculateQuality(
    selectedJunk: LootJunkItem[],
    temperature: number,
    masterRange: TemperatureRange
): number {
    if (selectedJunk.length === 0) return 0;

    let totalValue = 0;
    let weightedDegradationSum = 0;

    selectedJunk.forEach((junk) => {
        const value = Math.max(0.001, calculateJunkValue(junk));
        totalValue += value;
        weightedDegradationSum += junk.degradation * value;
    });

    const averageDegradation =
        totalValue > 0.001 * selectedJunk.length
            ? weightedDegradationSum / totalValue
            : selectedJunk.reduce((sum, j) => sum + j.degradation, 0) /
              selectedJunk.length;

    let quality = 100 - averageDegradation;

    if (temperature >= masterRange.min && temperature <= masterRange.max) {
        quality *= MasterQualityBoostMultiplier;
    }

    return Math.max(0, Math.min(100, quality));
}

// --- Sell Price Calculation ---

export function calculateSellPrice(
    finalComposition: MaterialComposition[],
    rarity: Rarity,
    quality: number
): number {
    const baseMaterialValue = getMaterialCompositionBaseValue(finalComposition);
    const rarityMultiplier = RarityMultipliers[rarity];
    const qualityMultiplier = QualitySellPriceMultiplier(quality);

    const price = baseMaterialValue * rarityMultiplier * qualityMultiplier;
    return Math.max(0, Math.round(price * 100) / 100);
}

// --- Item Structure & ID Generation ---

export function generateItemId(
    templateId: LootItemTemplateId,
    partIds: LootPartId[],
    materialComposition: MaterialComposition[]
): LootItemId {
    const hash = crypto.createHash("sha256");
    hash.update(templateId);
    partIds.sort().forEach((id) => hash.update(id));
    materialComposition
        .slice()
        .sort((a, b) => a.materialId.localeCompare(b.materialId))
        .forEach((mc) =>
            hash.update(`${mc.materialId}:${mc.percentage.toFixed(2)}`)
        );
    return `item-${hash.digest("hex").substring(0, 16)}`;
}

function generatePartId(
    moleculeId: LootMoleculeId,
    detailIds: LootDetailId[],
    materialComposition: MaterialComposition[]
): LootPartId {
    const hash = crypto.createHash("sha256");
    hash.update(moleculeId);
    detailIds.sort().forEach((id) => hash.update(id));
    materialComposition
        .slice()
        .sort((a, b) => a.materialId.localeCompare(b.materialId))
        .forEach((mc) =>
            hash.update(`${mc.materialId}:${mc.percentage.toFixed(2)}`)
        );
    return `part-${hash.digest("hex").substring(0, 12)}`;
}

export function buildLootItemStructure(
    template: LootItemTemplate,
    selectedJunk: LootJunkItem[],
    finalItemComposition: MaterialComposition[],
    finalItemRarity: Rarity,
    config: LootConfig
): { parts: LootPart[]; details: LootDetail[] } | null {
    if (!config) {
        console.error(
            "Crafting config not provided to buildLootItemStructure!"
        );
        return null;
    }
    const generatedParts: LootPart[] = [];
    const generatedDetails: LootDetail[] = [];
    const availableJunkMap = new Map(selectedJunk.map((j) => [j.id, j]));

    const detailIdMap = new Map<LootDetailId, LootDetail>();
    selectedJunk.forEach((junk) => {
        if (!detailIdMap.has(junk.atomId)) {
            const detail: LootDetail = {
                id: junk.atomId,
                atomId: junk.atomId,
                materialComposition: junk.materialComposition,
                rarity: junk.rarity,
            };
            detailIdMap.set(detail.id, detail);
            generatedDetails.push(detail);
        }
    });

    for (const molSocket of template.sockets) {
        const candidateMolecules = (
            config.lootMolecules[molSocket.acceptType] || []
        ).filter((mol: LootMolecule) =>
            molSocket.acceptTags.every((tag) => mol.tags.includes(tag))
        );

        const selectedMolecule = candidateMolecules[0];

        if (selectedMolecule) {
            const partDetailIds: LootDetailId[] = [];

            for (const atomSocket of selectedMolecule.sockets) {
                const candidateAtoms =
                    config.lootAtoms[atomSocket.acceptType] || [];

                let bestFitDetailId: LootDetailId | undefined = undefined;
                let bestFitJunkId: string | undefined = undefined;

                for (const [junkId, junk] of availableJunkMap.entries()) {
                    const detail = detailIdMap.get(junk.atomId);
                    if (detail) {
                        const atom = candidateAtoms.find(
                            (a: LootAtom) => a.id === detail.atomId
                        );
                        if (atom) {
                            bestFitDetailId = detail.id;
                            bestFitJunkId = junkId;
                            break;
                        }
                    }
                }

                if (bestFitDetailId && bestFitJunkId) {
                    partDetailIds.push(bestFitDetailId);
                    availableJunkMap.delete(bestFitJunkId);
                } else {
                    console.warn(
                        `No suitable atom/junk found for molecule ${selectedMolecule.id} socket accepting ${atomSocket.acceptType}`
                    );
                }
            }

            if (partDetailIds.length > 0) {
                const partComposition = finalItemComposition;
                const partRarity = finalItemRarity;

                const partId = generatePartId(
                    selectedMolecule.id,
                    partDetailIds,
                    partComposition
                );

                generatedParts.push({
                    id: partId,
                    moleculeId: selectedMolecule.id,
                    subparts: partDetailIds,
                    materialComposition: partComposition,
                    rarity: partRarity,
                });
            } else if (selectedMolecule.sockets.length > 0) {
                console.warn(
                    `Molecule ${selectedMolecule.id} created no details, though sockets exist.`
                );
            }
        } else {
            console.warn(
                `No suitable molecule found for template ${template.id} socket accepting ${molSocket.acceptType}`
            );
        }
    }

    if (generatedParts.length < template.sockets.length) {
        console.warn(
            `Crafting failed: Not all template sockets could be filled. Expected ${template.sockets.length}, got ${generatedParts.length} parts.`
        );
    }

    return { parts: generatedParts, details: generatedDetails };
}

// --- Rarity Calculation ---

export function calculateAverageRarity(rarities: Rarity[]): Rarity {
    if (rarities.length === 0) return Rarity.Common;

    const rarityValues = Object.values(Rarity);
    const numericValues = rarities.map((r) => {
        const index = rarityValues.indexOf(r);
        return index === -1 ? 0 : index;
    });

    const avgNumericValue =
        numericValues.reduce((sum, val) => sum + val, 0) / rarities.length;

    const closestIndex = Math.round(avgNumericValue);
    const clampedIndex = Math.max(
        0,
        Math.min(closestIndex, rarityValues.length - 1)
    );
    return rarityValues[clampedIndex];
}
