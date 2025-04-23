import { ChanceTable, JunkPiece, LootConfig, Quality, Rarity, RecipeItemId, RecipeItemType } from "./craftModel";

import { getChanceTables } from "./config/chanceTables";

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
    size = Math.floor(size * 0.8);
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
 * Gets a new distribution of items based on the provided chance table
 * @param totalCount The total number of items to distribute
 * @param chanceTable The table containing chances for each category
 * @returns A map of category to item count
 */
function getDistributionFromChanceTable(totalCount: number, chanceTable: ChanceTable): Map<string, number> {
  const distribution = new Map<string, number>();

  // Initialize all categories to 0
  Object.keys(chanceTable).forEach((category) => {
    distribution.set(category, 0);
  });

  // Distribute items one by one based on normalized chance table
  let itemsLeft = totalCount;

  // First, distribute items proportionally based on chances
  const totalChance = Object.values(chanceTable).reduce((sum, chance) => sum + chance, 0);

  if (totalChance > 0) {
    for (const [category, chance] of Object.entries(chanceTable)) {
      const normalizedChance = chance / totalChance;
      const count = Math.floor(totalCount * normalizedChance);
      distribution.set(category, count);
      itemsLeft -= count;
    }
  }

  // Distribute any remaining items randomly based on relative chances
  while (itemsLeft > 0) {
    let randomValue = Math.random() * totalChance;
    for (const [category, chance] of Object.entries(chanceTable)) {
      randomValue -= chance;
      if (randomValue <= 0) {
        distribution.set(category, (distribution.get(category) || 0) + 1);
        itemsLeft--;
        break;
      }
    }
  }

  return distribution;
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

  // First, find the favorite recipe objects by their IDs
  const favoriteRecipeObjects = favoriteRecipes
    .map((recipeId) => {
      // Search through all recipe types to find the recipe with matching ID
      for (const recipeType in lootConfig.recipeItems) {
        const typedRecipeType = recipeType as RecipeItemType;
        const recipes = lootConfig.recipeItems[typedRecipeType] || [];
        const matchingRecipe = recipes.find((recipe) => recipe.id === recipeId);
        if (matchingRecipe) {
          return matchingRecipe;
        }
      }
      return null;
    })
    .filter((recipe) => recipe !== null);

  // Filter junk details suitable for the player's favorite recipes
  // A junk piece is suitable if it can be used in any of the favorite recipes
  const suitablejunkPieces = alljunkPieces.filter((detail) => {
    // If no favorite recipes specified, all details are suitable
    if (!favoriteRecipes || favoriteRecipes.length === 0) return true;

    // Check if the detail is suitable for any of the favorite recipes
    return detail.suitableForRecipeDetails.some((recipeDetailType) => {
      // Check if this detail type is used in any of the favorite recipes
      return favoriteRecipeObjects.some((recipe) => {
        // Check if any recipe socket accepts parts that might use this detail type
        if (!recipe) return false;

        return recipe.sockets.some((socket) => {
          const recipeParts = lootConfig.recipeParts[socket.acceptType] || [];
          return recipeParts.some((recipePart) => {
            // Check if any part socket accepts this detail type
            return recipePart.sockets.some((s) => s.acceptType === recipeDetailType);
          });
        });
      });
    });
  });

  if (suitablejunkPieces.length === 0) {
    console.warn("No suitable junk details found for the given favorite recipes");
    return [];
  }

  // Get the quality and rarity chance tables from config
  const chanceTables = getChanceTables();

  const qualityChanceTable = chanceTables.qualityChanceTables[qualityChanceLevel] || chanceTables.qualityChanceTables[1];

  const rarityChanceTable = chanceTables.rarityChanceTables[rarityChanceLevel] || chanceTables.rarityChanceTables[1];

  // Group the filtered junk details by quality and rarity
  const qualityRarityGroups = new Map<string, JunkPiece[]>();

  suitablejunkPieces.forEach((detail) => {
    const quality = determineQuality(detail.sellPriceCoefficient);
    const rarity = detail.rarity;
    const groupKey = `${quality}_${rarity}`;

    if (!qualityRarityGroups.has(groupKey)) {
      qualityRarityGroups.set(groupKey, []);
    }

    qualityRarityGroups.get(groupKey)?.push(detail);
  });

  // Determine distribution by quality and rarity
  const qualityDistribution = getDistributionFromChanceTable(portionSize, qualityChanceTable);
  const rarityDistribution = getDistributionFromChanceTable(portionSize, rarityChanceTable);

  // Build the final junk portion
  const finalPortion: JunkPiece[] = [];

  // First, try to distribute by quality-rarity pairs
  for (const quality of Object.values(Quality)) {
    const qualityCount = qualityDistribution.get(quality) || 0;
    if (qualityCount <= 0) continue;

    // Distribute quality quota among rarities
    let remainingQualityCount = qualityCount;
    for (const rarity of Object.values(Rarity)) {
      const rarityCount = rarityDistribution.get(rarity) || 0;
      if (rarityCount <= 0) continue;

      // Calculate how many items to take from this quality-rarity group
      // This is a simplistic approach - in reality you might want a more complex distribution
      const groupKey = `${quality}_${rarity}`;
      const groupItems = qualityRarityGroups.get(groupKey) || [];

      // Simple proportion algorithm - can be refined
      const proportion = Math.min(1.0, rarityCount / portionSize);
      const groupCount = Math.min(Math.ceil(remainingQualityCount * proportion), remainingQualityCount);

      if (groupCount > 0 && groupItems.length > 0) {
        const selectedItems = getRandomItems(groupItems, groupCount, true);
        finalPortion.push(...selectedItems);
        remainingQualityCount -= selectedItems.length;
      }

      if (remainingQualityCount <= 0) break;
    }
  }

  // If we didn't fill the portion size, add random items from any quality-rarity group
  if (finalPortion.length < portionSize) {
    const allItems: JunkPiece[] = [];
    qualityRarityGroups.forEach((group) => allItems.push(...group));

    const additionalCount = portionSize - finalPortion.length;
    const additionalItems = getRandomItems(allItems, additionalCount, true);
    finalPortion.push(...additionalItems);
  }

  return finalPortion;
  //   return finalPortion.map((item) => {
  //     return {
  //       ...item,
  //       id: "banana",
  //     };
  //   });
}
