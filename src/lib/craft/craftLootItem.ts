import { CraftingFailureReason, JunkPiece, LootConfig, LootItem, Rarity, RecipeItemId } from "./craftModel";

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
    // This will be filled with actual parts after crafting logic is implemented
    details: ["basic_short_sword_pommel", "basic_short_sword_grip", "basic_short_sword_guard", "basic_short_sword_blade"],
  };

  return {
    success: true,
    item: craftedItem,
  };
}
