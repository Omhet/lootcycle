import {
    CraftingFailureReason,
    LootConfig,
    LootDetail,
    LootItem,
    LootItemTemplate,
    LootJunkItem,
    LootPart,
    Rarity,
} from "./craftModel.js";

// ======= CRAFTING FUNCTION TYPES =======

export interface CraftingResult {
    success: boolean;
    item?: LootItem;
    parts?: LootPart[];
    details?: LootDetail[]; // Add details here
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
 * // TODO: For now it is a stub, it will always return a success. It will be updated after GDD is refined
 */
export function craftLootItem(params: craftLootItemParams): CraftingResult {
    const { lootItemTemplate } = params;

    const craftedItem: LootItem = {
        id: "loot-item-id",
        templateId: lootItemTemplate.id,
        name: "Item Name",
        subparts: [],
        materialComposition: [],
        rarity: Rarity.Common,
        quality: 100,
        sellPrice: 100,
        temperatureRange: {
            min: 0,
            max: 100,
        },
        masterQualityTemperatureRange: {
            min: 20,
            max: 80,
        },
    };

    const parts: LootPart[] = [];
    const details: LootDetail[] = [];

    return {
        success: true,
        item: craftedItem,
        parts: parts,
        details: details,
    };
}
