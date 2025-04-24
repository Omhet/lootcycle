import { JunkPiece, LootConfig, Quality, RecipeItemId } from "./craftModel";

/**
 * Determines the quality level based on the sell price coefficient
 * @param sellPriceCoefficient The sell price coefficient of the junk piece
 * @returns The corresponding quality level
 */
function determineQuality(sellPriceCoefficient: number): Quality {
  if (sellPriceCoefficient < 0.5) return Quality.Worst;
  if (sellPriceCoefficient < 1.0) return Quality.Bad;
  if (sellPriceCoefficient < 1.5) return Quality.Good;
  if (sellPriceCoefficient < 2.0) return Quality.Better;
  return Quality.Best;
}

/**
 * Calculates the current portion size based on the portion number and first portion size
 * with a decrease factor of 0.8 for each subsequent portion
 * @param portionNumber The current portion number (starts at 1)
 * @param firstPortionSize The size of the first portion
 * @returns The calculated size of the current portion
 */
function calculatePortionSize(portionNumber: number, firstPortionSize: number): number {
  let size = firstPortionSize;
  for (let i = 1; i < portionNumber; i++) {
    size = Math.floor(size * 0.3);
  }
  return size;
}

/**
 * Randomly selects items from an array
 * @param array The array to select from
 * @param count The number of items to select
 * @param allowRepeats Whether the same item can be selected multiple times
 * @returns An array of the selected items
 */
function getRandomItems<T>(array: T[], count: number, allowRepeats: boolean = true): T[] {
  if (count <= 0) return [];

  if (array.length === 0) return [];

  const result: T[] = [];

  if (allowRepeats || count <= array.length) {
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * array.length);
      result.push(array[randomIndex]);
    }
  } else {
    // If we need more items than available and repeats aren't allowed,
    // return all items and fill the rest with random repeats
    result.push(...array);
    const remaining = count - array.length;
    for (let i = 0; i < remaining; i++) {
      const randomIndex = Math.floor(Math.random() * array.length);
      result.push(array[randomIndex]);
    }
  }

  return result;
}

/**
 * Shuffles an array in-place using the Fisher-Yates algorithm
 * @param array The array to shuffle
 * @returns The shuffled array (same reference as input array)
 */
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Gets a portion of junk items based on player preferences and game settings
 * @param lootConfig The global loot configuration
 * @param favoriteRecipes The player's favorite recipe IDs
 * @param portionNumber The current portion number (starts at 1)
 * @param firstPortionSize The size of the first junk portion
 * @param qualityChanceLevel The level determining which quality chance table to use
 * @param rarityChanceLevel The level determining which rarity chance table to use
 * @returns An array of junk details for the player to collect
 */
export function getJunkPortion(
  lootConfig: LootConfig,
  favoriteRecipes: RecipeItemId[],
  portionNumber: number,
  firstPortionSize: number,
  qualityChanceLevel: number,
  rarityChanceLevel: number
): JunkPiece[] {
  // Calculate the size of the current portion
  const portionSize = calculatePortionSize(portionNumber, firstPortionSize);
  if (portionSize <= 0) return [];

  // Get all junk details from the config
  const alljunkPieces: JunkPiece[] = [];
  Object.values(lootConfig.junkPieces).forEach((detailsArray) => {
    alljunkPieces.push(...detailsArray);
  });

  // Separate junk into generic (not suitable for any recipes) and recipe-specific
  const genericJunk = alljunkPieces.filter((junk) => junk.suitableForRecipeDetails.length === 0);
  const recipeSpecificJunk = alljunkPieces.filter((junk) => junk.suitableForRecipeDetails.length > 0);

  // Calculate how many of each type to include
  const genericJunkCount = Math.round(portionSize * 0.95);
  const recipeSpecificJunkCount = portionSize - genericJunkCount;

  const finalPortion: JunkPiece[] = [];

  if (genericJunk.length > 0) {
    finalPortion.push(...getRandomItems(genericJunk, genericJunkCount));
  }

  if (recipeSpecificJunk.length > 0) {
    finalPortion.push(...getRandomItems(recipeSpecificJunk, recipeSpecificJunkCount));
  }

  // If either category doesn't have enough items, fill with items from the other category
  if (finalPortion.length < portionSize) {
    const remainingCount = portionSize - finalPortion.length;
    finalPortion.push(...getRandomItems(alljunkPieces, remainingCount));
  }

  return shuffleArray(finalPortion);
}
