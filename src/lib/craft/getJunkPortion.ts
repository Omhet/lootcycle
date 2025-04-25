import { JunkPiece, LootConfig, RecipeDetailType, RecipeItem, RecipePartType } from "./craftModel";

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
 * @param currentRecipeId The ID of the currently selected recipe, if any
 * @param purchasedJunkLicenses Array of junk IDs that the player has purchased licenses for
 * @returns An array of junk details for the player to collect
 */
export function getJunkPortion(
  lootConfig: LootConfig,
  portionNumber: number,
  firstPortionSize: number,
  fluffRatio: number = 0.95,
  nextPortionPercentage: number = 0.3,
  currentRecipeId: string | null = null,
  purchasedJunkLicenses: string[] = []
): JunkPiece[] {
  // Calculate the size of the current portion using the player's next portion percentage upgrade
  const portionSize = calculatePortionSize(portionNumber, firstPortionSize, nextPortionPercentage);
  if (portionSize <= 0) return [];

  // Get all junk details from the config and filter by purchased licenses
  const alljunkPieces: JunkPiece[] = [];
  Object.entries(lootConfig.junkPieces).forEach(([junkId, detailsArray]) => {
    // Only include junk that the player has a license for
    if (purchasedJunkLicenses.includes(junkId) || detailsArray.some((piece) => piece.suitableForRecipeDetails.length === 0)) {
      alljunkPieces.push(...detailsArray);
    }
  });

  // If no junk pieces are available (no licenses), return minimal generic junk
  if (alljunkPieces.length === 0) {
    // Fallback to minimal generic junk (should not happen in normal gameplay)
    const minimalGenericJunk = Object.values(lootConfig.junkPieces)
      .flat()
      .filter((junk) => junk.suitableForRecipeDetails.length === 0)
      .slice(0, portionSize);

    return minimalGenericJunk;
  }

  // Separate junk into generic (not suitable for any recipes) and recipe-specific
  const genericJunk = alljunkPieces.filter((junk) => junk.suitableForRecipeDetails.length === 0);

  // Further filter recipe-specific junk to prioritize the current recipe if one is selected
  let recipeSpecificJunk = alljunkPieces.filter((junk) => junk.suitableForRecipeDetails.length > 0);

  if (currentRecipeId) {
    // Find the current recipe
    let currentRecipe: RecipeItem | undefined;
    Object.values(lootConfig.recipeItems).forEach((recipes) => {
      const found = recipes.find((recipe) => recipe.id === currentRecipeId);
      if (found) currentRecipe = found;
    });

    // If we have a valid recipe, only include junk relevant to it
    if (currentRecipe) {
      // Collect all detail types needed for this recipe
      // RecipeItem has sockets for RecipePartSockets, which can accept certain RecipePartTypes
      // Each RecipePart in turn has sockets for RecipeDetailSockets

      // First, find all part types needed by this recipe
      const neededPartTypes = new Set<RecipePartType>();
      currentRecipe.sockets.forEach((socket) => {
        neededPartTypes.add(socket.acceptType);
      });

      // Then, for each part type, find all the detail types that can be placed in those parts
      const neededDetailTypes = new Set<RecipeDetailType>();
      neededPartTypes.forEach((partType) => {
        // Find all parts of this type
        const partsOfThisType = lootConfig.recipeParts[partType] || [];

        // For each part, add all detail types it can accept
        partsOfThisType.forEach((part) => {
          part.sockets.forEach((socket) => {
            neededDetailTypes.add(socket.acceptType);
          });
        });
      });

      // Filter junk to only include pieces relevant for the current recipe
      recipeSpecificJunk = recipeSpecificJunk.filter((junk) => junk.suitableForRecipeDetails.some((detailType) => neededDetailTypes.has(detailType)));

      // If no relevant junk is found, fall back to empty array (we'll fill with generic junk)
      if (recipeSpecificJunk.length === 0) {
        recipeSpecificJunk = [];
      }
    }
  }

  // Calculate how many of each type to include based on the player's fluff ratio upgrade
  const genericJunkCount = Math.round(portionSize * fluffRatio);
  const recipeSpecificJunkCount = portionSize - genericJunkCount;

  const finalPortion: JunkPiece[] = [];

  // Add generic junk if available
  if (genericJunk.length > 0) {
    finalPortion.push(...getRandomItems(genericJunk, genericJunkCount));
  }

  // Add recipe-specific junk if available
  if (recipeSpecificJunk.length > 0) {
    finalPortion.push(...getRandomItems(recipeSpecificJunk, recipeSpecificJunkCount));
  }

  // If either category doesn't have enough items, fill with items from the other category
  if (finalPortion.length < portionSize) {
    const remainingCount = portionSize - finalPortion.length;
    // Prefer filling with recipe-specific junk if we have any
    if (recipeSpecificJunk.length > 0) {
      finalPortion.push(...getRandomItems(recipeSpecificJunk, remainingCount));
    } else {
      finalPortion.push(...getRandomItems(genericJunk, remainingCount));
    }
  }

  return shuffleArray(finalPortion);
}
