import {
  CraftingFailureReason,
  ItemCategoryId,
  JunkPiece,
  JunkPieceId,
  LootConfig,
  LootDetail,
  LootDetailId,
  LootItem,
  Rarity,
  RecipeDetailType,
  RecipeItem,
  RecipeItemId,
  TemperatureRange,
  initialItemSubCategories,
} from "./craftModel";
import { generateLootItemId } from "./craftUtils";

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

// ======= HELPER FUNCTIONS =======

/**
 * Gets all required detail types for a recipe
 */
function getRequiredDetailTypes(recipe: RecipeItem, config: LootConfig): RecipeDetailType[] {
  const detailTypes: RecipeDetailType[] = [];

  // Go through each socket in the recipe
  for (const recipeSocket of recipe.sockets) {
    // Find matching recipe parts
    const recipeParts = config.recipeParts[recipeSocket.acceptType] || [];

    // For each recipe part, collect the detail types it accepts
    for (const recipePart of recipeParts) {
      for (const detailSocket of recipePart.sockets) {
        detailTypes.push(detailSocket.acceptType);
      }
    }
  }

  return detailTypes;
}

/**
 * Finds suitable junk pieces for a list of detail types
 */
function filterSuitableJunk(junkPieces: JunkPiece[], detailTypes: RecipeDetailType[]): JunkPiece[] {
  return junkPieces.filter((junk) => {
    return junk.suitableForRecipeDetails.some((detailType) => detailTypes.includes(detailType));
  });
}

/**
 * Finds all loot details that can be crafted from a specific junk piece
 */
function getLootDetailsForJunk(junkPiece: JunkPiece, detailType: RecipeDetailType, config: LootConfig): LootDetail[] {
  const allDetails: LootDetail[] = [];

  // Collect all loot details of the required type
  Object.values(config.lootDetails).forEach((detailsArray) => {
    detailsArray.forEach((detail) => {
      if (detail.type === detailType) {
        // Check if this detail can be crafted from this junk
        if (
          detail.canBeCraftedFrom.includes(junkPiece.id) ||
          detail.canBeCraftedFrom.length === 0 // Default detail that can be crafted from anything
        ) {
          allDetails.push(detail);
        }
      }
    });
  });

  return allDetails;
}

/**
 * Finds basic loot details for a specific detail type
 */
function getBasicLootDetail(detailType: RecipeDetailType, config: LootConfig): LootDetail | undefined {
  // Look for a loot detail with the specified type and an empty canBeCraftedFrom array
  let basicDetail: LootDetail | undefined;

  Object.values(config.lootDetails).forEach((detailsArray) => {
    detailsArray.forEach((detail) => {
      if (detail.type === detailType && detail.canBeCraftedFrom.length === 0) {
        basicDetail = detail;
      }
    });
  });

  return basicDetail;
}

/**
 * Selects a loot detail randomly, weighted by the rarity of junk
 */
function selectLootDetail(details: LootDetail[], junkPiece: JunkPiece): LootDetail | undefined {
  if (details.length === 0) return undefined;

  // First, try to find details that specifically list this junk piece
  const specificDetails = details.filter((detail) => detail.canBeCraftedFrom.includes(junkPiece.id));

  if (specificDetails.length > 0) {
    // Select randomly from specific details
    return specificDetails[Math.floor(Math.random() * specificDetails.length)];
  }

  // If no specific details, fall back to default details (canBeCraftedFrom = [])
  const defaultDetails = details.filter((detail) => detail.canBeCraftedFrom.length === 0);

  if (defaultDetails.length > 0) {
    return defaultDetails[Math.floor(Math.random() * defaultDetails.length)];
  }

  return undefined;
}

/**
 * Distributes junk pieces evenly across required detail types
 */
function distributeJunkToDetails(
  junkPieces: JunkPiece[],
  detailTypes: RecipeDetailType[],
  config: LootConfig
): Map<RecipeDetailType, { lootDetail: LootDetail; junkPieces: JunkPiece[] }> {
  const result = new Map<RecipeDetailType, { lootDetail: LootDetail; junkPieces: JunkPiece[] }>();

  // Create a map of detail type to junk pieces that can be used for it
  const detailTypeToJunk = new Map<RecipeDetailType, JunkPiece[]>();

  // Initialize the map with empty arrays
  detailTypes.forEach((detailType) => {
    detailTypeToJunk.set(detailType, []);
  });

  // Populate the map with junk pieces that are suitable for each detail type
  junkPieces.forEach((junk) => {
    junk.suitableForRecipeDetails.forEach((detailType) => {
      if (detailTypes.includes(detailType)) {
        const currentJunk = detailTypeToJunk.get(detailType) || [];
        currentJunk.push(junk);
        detailTypeToJunk.set(detailType, currentJunk);
      }
    });
  });

  // For each detail type, distribute junk pieces evenly
  detailTypes.forEach((detailType) => {
    const availableJunk = detailTypeToJunk.get(detailType) || [];
    if (availableJunk.length === 0) return;

    // Group by junk ID to avoid duplicates
    const junkById = new Map<JunkPiece["id"], JunkPiece[]>();
    availableJunk.forEach((junk) => {
      if (!junkById.has(junk.id)) {
        junkById.set(junk.id, []);
      }
      junkById.get(junk.id)?.push(junk);
    });

    // Select a junk piece for this detail type
    const randomJunkId = Array.from(junkById.keys())[Math.floor(Math.random() * junkById.size)];
    const selectedJunk = junkById.get(randomJunkId) || [];
    if (selectedJunk.length === 0) return;

    // Find loot details that can be crafted from this junk
    const possibleDetails = getLootDetailsForJunk(selectedJunk[0], detailType, config);
    const selectedDetail = selectLootDetail(possibleDetails, selectedJunk[0]);

    if (selectedDetail) {
      result.set(detailType, {
        lootDetail: selectedDetail,
        junkPieces: selectedJunk,
      });
    }
  });

  return result;
}

/**
 * Calculates the sell price based on junk values and recipe details
 */
function calculateSellPrice(
  recipe: RecipeItem,
  detailToJunk: Map<RecipeDetailType, { lootDetail: LootDetail; junkPieces: JunkPiece[] }>,
  detailTypes: RecipeDetailType[],
  config: LootConfig
): number {
  // Start with base sell price from recipe
  let sellPrice = recipe.baseSellPrice || 1; // Ensure base price is at least 1

  // Calculate total weight for normalization
  const totalWeight = recipe.sockets.reduce((sum, socket) => sum + (socket.relativeWeight || 0), 0);

  // Map to track weighted contributions from each junk piece
  const detailTypeContributions = new Map<RecipeDetailType, number>();
  let totalWeightedCoefficient = 0;

  // Calculate weighted sell price coefficient based on socket weights
  detailToJunk.forEach((value, detailType) => {
    // Find which socket this detail type belongs to
    const socketForDetail = recipe.sockets.find((socket) => {
      // Get the recipe parts for this socket type from the config
      const recipeParts = config.recipeParts[socket.acceptType] || [];
      // Check if any of these parts contain a socket that accepts our detail type
      return recipeParts.some((part) => part.sockets.some((s) => s.acceptType === detailType));
    });

    // Get the relative weight for this detail type
    const relativeWeight = socketForDetail?.relativeWeight || 1;

    // Calculate average sell price coefficient for this detail
    const totalJunkCoefficient = value.junkPieces.reduce((sum, junk) => sum + (junk.sellPriceCoefficient || 1), 0);
    const avgCoefficient = value.junkPieces.length > 0 ? totalJunkCoefficient / value.junkPieces.length : 1;

    // Store weighted contribution
    const weightedCoefficient = avgCoefficient * relativeWeight;
    detailTypeContributions.set(detailType, weightedCoefficient);
    totalWeightedCoefficient += weightedCoefficient;
  });

  // Apply weighted average if we have junk pieces
  if (detailTypeContributions.size > 0 && totalWeight > 0) {
    // Normalize by total weight
    const normalizedCoefficient = totalWeightedCoefficient / totalWeight;
    sellPrice = Math.round(sellPrice * normalizedCoefficient);
  }

  // Apply crafting efficiency adjustment based on coverage of required details
  const coverageRatio = detailTypes.length > 0 ? detailToJunk.size / detailTypes.length : 1;
  sellPrice = Math.round(sellPrice * coverageRatio);

  return Math.max(1, sellPrice); // Ensure minimum price of 1
}

/**
 * Determines the rarity of the crafted item based on junk rarity
 */
function calculateRarity(detailToJunk: Map<RecipeDetailType, { lootDetail: LootDetail; junkPieces: JunkPiece[] }>): Rarity {
  // Convert rarity to numeric value for calculation
  const rarityValues: Record<Rarity, number> = {
    [Rarity.Common]: 1,
    [Rarity.Uncommon]: 2,
    [Rarity.Rare]: 3,
    [Rarity.Epic]: 4,
    [Rarity.Legendary]: 5,
  };

  // Calculate weighted average rarity
  let totalRarityValue = 0;
  let totalJunkPieces = 0;

  detailToJunk.forEach(({ junkPieces }) => {
    junkPieces.forEach((junk) => {
      totalRarityValue += rarityValues[junk.rarity];
      totalJunkPieces++;
    });
  });

  if (totalJunkPieces === 0) return Rarity.Common;

  const averageRarityValue = totalRarityValue / totalJunkPieces;

  // Convert back to rarity enum
  if (averageRarityValue >= 4.5) return Rarity.Legendary;
  if (averageRarityValue >= 3.5) return Rarity.Epic;
  if (averageRarityValue >= 2.5) return Rarity.Rare;
  if (averageRarityValue >= 1.5) return Rarity.Uncommon;
  return Rarity.Common;
}

/**
 * Calculates temperature range based on recipe and junk
 */
function calculateTemperatureRange(
  recipe: RecipeItem,
  detailToJunk: Map<RecipeDetailType, { lootDetail: LootDetail; junkPieces: JunkPiece[] }>
): TemperatureRange {
  const perfectTemp = recipe.perfectTemperature;
  const baseOffset = recipe.baseTemperatureOffset;

  // Calculate average temperature coefficient
  let totalCoefficient = 0;
  let totalJunkPieces = 0;

  detailToJunk.forEach(({ junkPieces }) => {
    junkPieces.forEach((junk) => {
      totalCoefficient += junk.temperatureCoefficient;
      totalJunkPieces++;
    });
  });

  // Default to 1.0 if no junk pieces
  const avgCoefficient = totalJunkPieces > 0 ? totalCoefficient / totalJunkPieces : 1.0;

  // Adjust offset based on average coefficient
  const adjustedOffset = baseOffset * avgCoefficient;

  return {
    min: perfectTemp - adjustedOffset,
    max: perfectTemp + adjustedOffset,
  };
}

/**
 * Generates a name for the crafted item
 */
function generateItemName(recipe: RecipeItem, detailToJunk: Map<RecipeDetailType, { lootDetail: LootDetail; junkPieces: JunkPiece[] }>): string {
  // Start with the recipe name
  let name = recipe.name;

  // Find the most valuable/distinctive detail to feature in the name
  let mostDistinctiveDetail: LootDetail | undefined;
  let highestValue = -1;

  detailToJunk.forEach(({ lootDetail, junkPieces }) => {
    // Skip basic/default details
    if (lootDetail.canBeCraftedFrom.length === 0) return;

    // Calculate a "distinctiveness" value based on junk rarity and price
    const avgValue =
      junkPieces.reduce((sum, junk) => {
        const rarityValue = {
          [Rarity.Common]: 1,
          [Rarity.Uncommon]: 2,
          [Rarity.Rare]: 3,
          [Rarity.Epic]: 4,
          [Rarity.Legendary]: 5,
        }[junk.rarity];

        return sum + rarityValue * junk.sellPriceCoefficient;
      }, 0) / junkPieces.length;

    if (avgValue > highestValue) {
      highestValue = avgValue;
      mostDistinctiveDetail = lootDetail;
    }
  });

  // Add the distinctive detail name if found
  if (mostDistinctiveDetail) {
    // Extract adjectives/descriptors from the detail name
    const detailNameParts = mostDistinctiveDetail.name.split(" ");

    // Skip "basic" details
    if (!detailNameParts.some((part) => part.toLowerCase() === "basic")) {
      // Avoid repeating the item type
      const descriptors = detailNameParts.filter((part) => !name.toLowerCase().includes(part.toLowerCase()));

      if (descriptors.length > 0) {
        name = `${descriptors.join(" ")} ${name}`;
      }
    }
  }

  return name.trim();
}

function findRecipeItem(recipeId: string, config: LootConfig): RecipeItem | undefined {
  return Object.values(config.recipeItems)
    .flat()
    .find((item) => item.id === recipeId);
}

/**
 * Finds the category ID for a given subcategory ID
 */
function findCategoryForSubcategory(subCategoryId: string): string {
  const subCategory = initialItemSubCategories.find((sc) => sc.id === subCategoryId);
  return subCategory?.categoryId || "";
}

// ======= CRAFTING FUNCTION =======

/**
 * Attempts to craft a LootItem from a recipe and junk items at a specific temperature.
 */
export function craftLootItem(params: craftLootItemParams): CraftingResult {
  const { lootItemRecipeId, junkPieces, temperature: _temperature, config } = params;

  // Find the recipe item
  const recipe = findRecipeItem(lootItemRecipeId, config);

  // Check if recipe exists
  if (!recipe) {
    throw new Error(`Recipe with ID ${lootItemRecipeId} not found`);
  }

  // Get all required detail types for this recipe
  const requiredDetailTypes = getRequiredDetailTypes(recipe, config);

  // Check if we have enough junk
  if (junkPieces.length < requiredDetailTypes.length) {
    return {
      success: false,
      failure: {
        reason: CraftingFailureReason.NotEnoughJunk,
        message: `Not enough junk pieces. Need at least ${requiredDetailTypes.length}, but got ${junkPieces.length}`,
      },
    };
  }

  // Filter junk pieces suitable for this recipe
  const suitableJunk = filterSuitableJunk(junkPieces, requiredDetailTypes);

  // Create a map to hold our final selection of details and junk
  // First, try to distribute the suitable junk we have
  const detailToJunk = distributeJunkToDetails(suitableJunk, requiredDetailTypes, config);

  // For any missing detail types, use basic loot details
  const detailTypesCovered = new Set(detailToJunk.keys());
  const missingDetailTypes = requiredDetailTypes.filter((type) => !detailTypesCovered.has(type));

  if (missingDetailTypes.length > 0) {
    // Find basic details for each missing detail type
    for (const detailType of missingDetailTypes) {
      const basicDetail = getBasicLootDetail(detailType, config);

      if (basicDetail) {
        // Add the basic detail with no junk pieces
        detailToJunk.set(detailType, {
          lootDetail: basicDetail,
          junkPieces: [],
        });
      }
    }
  }

  // Calculate temperature range
  const temperatureRange = calculateTemperatureRange(recipe, detailToJunk);

  // TEMPORARY: Uncomment this when temperature is implemented
  // Check if temperature is in range
  //   if (temperature < temperatureRange.min) {
  //     return {
  //       success: false,
  //       failure: {
  //         reason: CraftingFailureReason.TooLowTemperature,
  //         message: `Temperature too low: ${temperature}. Required minimum: ${temperatureRange.min}`,
  //       },
  //     };
  //   }

  //   if (temperature > temperatureRange.max) {
  //     return {
  //       success: false,
  //       failure: {
  //         reason: CraftingFailureReason.TooHighTemperature,
  //         message: `Temperature too high: ${temperature}. Required maximum: ${temperatureRange.max}`,
  //       },
  //     };
  //   }

  // Calculate sell price
  const sellPrice = calculateSellPrice(recipe, detailToJunk, requiredDetailTypes, config);

  // Calculate rarity
  const rarity = calculateRarity(detailToJunk);

  // Generate name
  const name = generateItemName(recipe, detailToJunk);

  // Collect the loot details
  const details: LootDetailId[] = [];
  detailToJunk.forEach(({ lootDetail }) => {
    details.push(lootDetail.id);
  });

  // Collect all unique junk piece IDs used in crafting
  const usedJunkPieces: JunkPieceId[] = [];
  detailToJunk.forEach(({ junkPieces }) => {
    junkPieces.forEach((junk) => {
      if (!usedJunkPieces.includes(junk.id)) {
        usedJunkPieces.push(junk.id);
      }
    });
  });

  // Create map from detail ID to junk piece ID
  const detailToJunkMap: Record<LootDetailId, JunkPieceId | undefined> = {};
  detailToJunk.forEach(({ lootDetail, junkPieces }, _detailType) => {
    // Use the first junk piece for this detail, if any
    detailToJunkMap[lootDetail.id] = junkPieces.length > 0 ? junkPieces[0].id : undefined;
  });

  // Generate ID based on recipe and details
  const id = generateLootItemId(lootItemRecipeId, details);

  // Find the category for this item's subcategory
  const category: ItemCategoryId = findCategoryForSubcategory(recipe.subCategory) as ItemCategoryId;

  // Create the crafted item
  const craftedItem: LootItem = {
    id,
    recipeId: lootItemRecipeId,
    name,
    details,
    rarity,
    sellPrice,
    temperatureRange,
    category,
    subCategory: recipe.subCategory,
    type: recipe.type,
    junkPieces: usedJunkPieces,
    detailToJunkMap,
  };

  return {
    success: true,
    item: craftedItem,
  };
}
