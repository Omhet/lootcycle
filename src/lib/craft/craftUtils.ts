import { LootDetailId, Rarity, RecipeItemId } from "./craftModel";

// ======= CONSTANTS =======

export const RarityMultipliers: Record<Rarity, number> = {
  [Rarity.Common]: 1.0,
  [Rarity.Uncommon]: 1.5,
  [Rarity.Rare]: 2.5,
  [Rarity.Epic]: 4.0,
  [Rarity.Legendary]: 6.0,
};

/**
 * Generates an ID for a loot item based on its recipe ID and the IDs of its details.
 * This ensures consistent ID generation across the application.
 *
 * @param recipeId The recipe ID used to craft the item
 * @param detailIds Array of loot detail IDs used in the item
 * @returns A unique ID string for the loot item
 */
export function generateLootItemId(recipeId: RecipeItemId, detailIds: LootDetailId[]): string {
  // Sort detail IDs to ensure consistent ID generation regardless of detail order
  const sortedDetailIds = [...detailIds].sort();

  // Create a base string combining the recipe ID with all detail IDs
  const baseString = `${recipeId}-${sortedDetailIds.join("-")}`;

  // Use a simple hash function to create a shorter ID
  let hash = 0;
  for (let i = 0; i < baseString.length; i++) {
    const char = baseString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Convert hash to a hex string and ensure positive value
  const hashString = Math.abs(hash).toString(16);

  // Return a combination of recipe ID and hash
  return `${recipeId}-${hashString}`;
}
