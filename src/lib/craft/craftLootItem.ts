import {
    CraftingFailureReason,
    JunkPiece,
    LootConfig,
    LootDetail,
    LootItem,
    LootPart,
    Rarity,
    RecipeItemId,
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
    lootItemRecipeId: RecipeItemId;
    junkPieces: JunkPiece[];
    temperature: number;
    config: LootConfig;
};

// ======= CRAFTING FUNCTION =======

/**
 * Attempts to craft a LootItem from a recipe and junk items at a specific temperature.
 * // TODO: For now it is a stub, it will always return a success. It will be updated after GDD is refined
 */
export function craftLootItem(params: craftLootItemParams): CraftingResult {
    const { lootItemRecipeId } = params;

    const craftedItem: LootItem = {
        id: "loot-item-id",
        recipeId: lootItemRecipeId,
        name: "Item Name",
        rarity: Rarity.Common,
        sellPrice: 100,
        temperatureRange: {
            min: 0,
            max: 100,
        },
        parts: [], // This will be filled with actual parts after crafting logic is implemented
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
