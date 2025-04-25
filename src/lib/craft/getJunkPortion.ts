import { JunkPiece, LootConfig } from "./craftModel";

/**
 * Calculates the current portion size based on the portion number and first portion size
 * with a decrease factor based on player upgrades
 * @param portionNumber The current portion number (starts at 1)
 * @param firstPortionSize The size of the first portion
 * @param nextPortionPercentage The percentage of items carried over to next portion (from upgrades)
 * @returns The calculated size of the current portion
 */
function calculatePortionSize(portionNumber: number, firstPortionSize: number, nextPortionPercentage: number = 0.3): number {
  let size = firstPortionSize;
  for (let i = 1; i < portionNumber; i++) {
    size = Math.floor(size * nextPortionPercentage);
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
 * @param portionNumber The current portion number (starts at 1)
 * @param firstPortionSize The size of the first junk portion (from player upgrades)
 * @param fluffRatio The ratio of generic junk to specific junk (from player upgrades)
 * @param nextPortionPercentage The percentage of items carried over to next portion (from upgrades)
 * @returns An array of junk details for the player to collect
 */
export function getJunkPortion(
  lootConfig: LootConfig,
  portionNumber: number,
  firstPortionSize: number,
  fluffRatio: number = 0.95,
  nextPortionPercentage: number = 0.3
): JunkPiece[] {
  // Calculate the size of the current portion using the player's next portion percentage upgrade
  const portionSize = calculatePortionSize(portionNumber, firstPortionSize, nextPortionPercentage);
  if (portionSize <= 0) return [];

  // Get all junk details from the config
  const alljunkPieces: JunkPiece[] = [];
  Object.values(lootConfig.junkPieces).forEach((detailsArray) => {
    alljunkPieces.push(...detailsArray);
  });

  // Separate junk into generic (not suitable for any recipes) and recipe-specific
  const genericJunk = alljunkPieces.filter((junk) => junk.suitableForRecipeDetails.length === 0);
  const recipeSpecificJunk = alljunkPieces.filter((junk) => junk.suitableForRecipeDetails.length > 0);

  // Calculate how many of each type to include based on the player's fluff ratio upgrade
  const genericJunkCount = Math.round(portionSize * fluffRatio);
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
