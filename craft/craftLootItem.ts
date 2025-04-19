import {
    CraftingFailureReason,
    LootConfig,
    LootItem,
    LootItemTemplate,
    LootJunkItem,
    LootPart, // Import LootPart if needed for type annotations
} from "./craftModel.js";
import {
    buildLootItemStructure,
    calculateAverageRarity,
    calculateJunkValue,
    calculateQuality,
    calculateRequiredMaterials,
    calculateSellPrice,
    calculateTemperatureRanges,
    combineMaterials,
    generateItemId,
    selectJunkItems,
} from "./craftUtils.js";

// ======= CRAFTING FUNCTION TYPES =======

export interface CraftingResult {
    success: boolean;
    item?: LootItem;
    failure?: {
        reason: CraftingFailureReason;
        message?: string;
    };
}

export type craftLootItemParams = {
    lootItemTemplate: LootItemTemplate;
    junkItems: LootJunkItem[];
    temperature: number;
    config: LootConfig;
};

// ======= CRAFTING FUNCTION =======

/**
 * Attempts to craft a LootItem from a template and junk items at a specific temperature.
 */
export function craftLootItem(params: craftLootItemParams): CraftingResult {
    const { lootItemTemplate, junkItems, temperature, config } = params;

    // --- Pre-computation & Validation ---
    if (!lootItemTemplate || !junkItems || junkItems.length === 0 || !config) {
        return {
            success: false,
            failure: {
                reason: CraftingFailureReason.NotEnoughJunk,
                message: "Invalid input parameters.",
            },
        };
    }
    // setCraftingConfig(config); // Removed call

    const junkItemsWithValue = junkItems.map((junk) => ({
        ...junk,
        value: calculateJunkValue(junk),
    }));

    // --- Step 1 & 2: Determine Requirements & Select Junk ---
    // Pass config explicitly if calculateRequiredMaterials needs it in the future
    const requiredMaterials = calculateRequiredMaterials(
        lootItemTemplate /*, config */
    );
    const selectedJunk = selectJunkItems(
        junkItemsWithValue,
        requiredMaterials,
        lootItemTemplate,
        config // Pass config explicitly
    );

    if (!selectedJunk || selectedJunk.length === 0) {
        return {
            success: false,
            failure: {
                reason: CraftingFailureReason.NotEnoughJunk,
                message: "Not enough suitable junk items selected.",
            },
        };
    }

    // --- Step 3: Combine Materials ---
    const finalMaterialComposition = combineMaterials(selectedJunk);
    if (finalMaterialComposition.length === 0) {
        return {
            success: false,
            failure: {
                reason: CraftingFailureReason.NotEnoughJunk,
                message:
                    "Could not determine final material composition from selected junk.",
            },
        };
    }

    // --- Step 4: Calculate Potential Rarity & Temperature Ranges ---
    const potentialRarity = calculateAverageRarity(
        selectedJunk.map((j: LootJunkItem) => j.rarity)
    );
    // Pass config explicitly if calculateTemperatureRanges needs it in the future
    const { regularRange, masterRange } = calculateTemperatureRanges(
        finalMaterialComposition,
        potentialRarity,
        lootItemTemplate
        // config
    );

    // --- Step 5: Check Temperature ---
    if (temperature < regularRange.min) {
        return {
            success: false,
            failure: {
                reason: CraftingFailureReason.TooLowTemperature,
                message: `Temp ${temperature.toFixed(
                    1
                )}°C is BELOW range [${regularRange.min.toFixed(
                    1
                )}°C - ${regularRange.max.toFixed(
                    1
                )}°C]. Master: [${masterRange.min.toFixed(
                    1
                )}°C - ${masterRange.max.toFixed(1)}°C]`,
            },
        };
    }
    if (temperature > regularRange.max) {
        return {
            success: false,
            failure: {
                reason: CraftingFailureReason.TooHighTemperature,
                message: `Temp ${temperature.toFixed(
                    1
                )}°C is ABOVE range [${regularRange.min.toFixed(
                    1
                )}°C - ${regularRange.max.toFixed(
                    1
                )}°C]. Master: [${masterRange.min.toFixed(
                    1
                )}°C - ${masterRange.max.toFixed(1)}°C]`,
            },
        };
    }

    // --- Step 6: Calculate Quality ---
    const quality = calculateQuality(selectedJunk, temperature, masterRange);

    // --- Step 7: Build Item Structure ---
    const structureResult = buildLootItemStructure(
        lootItemTemplate,
        selectedJunk,
        finalMaterialComposition,
        potentialRarity,
        config // Pass config explicitly
    );

    if (!structureResult || structureResult.parts.length === 0) {
        const message =
            structureResult === null
                ? "Failed during item structure generation."
                : "Failed to construct any item parts from selected junk.";
        return {
            success: false,
            failure: { reason: CraftingFailureReason.NotEnoughJunk, message },
        };
    }
    const { parts } = structureResult;

    // --- Step 8: Calculate Sell Price ---
    const sellPrice = calculateSellPrice(
        finalMaterialComposition,
        potentialRarity,
        quality
    );

    // --- Step 9: Generate Final Item ID ---
    const finalItemId = generateItemId(
        lootItemTemplate.id,
        parts.map((p: LootPart) => p.id),
        finalMaterialComposition
    );

    // --- Step 10: Construct Final LootItem ---
    const itemName = `${potentialRarity} ${
        lootItemTemplate.name
    } (Q${quality.toFixed(0)})`;

    const craftedItem: LootItem = {
        id: finalItemId,
        templateId: lootItemTemplate.id,
        name: itemName,
        subparts: parts.map((p: LootPart) => p.id),
        materialComposition: finalMaterialComposition,
        rarity: potentialRarity,
        quality: parseFloat(quality.toFixed(2)),
        sellPrice: sellPrice,
        temperatureRange: {
            min: parseFloat(regularRange.min.toFixed(2)),
            max: parseFloat(regularRange.max.toFixed(2)),
        },
        masterQualityTemperatureRange: {
            min: parseFloat(masterRange.min.toFixed(2)),
            max: parseFloat(masterRange.max.toFixed(2)),
        },
    };

    // --- Return Success ---
    return {
        success: true,
        item: craftedItem,
    };
}
