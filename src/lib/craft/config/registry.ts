import { JunkPiece, JunkPieceId, LootConfig, LootDetail, LootDetailId, RecipeItem, RecipeItemType, RecipePart, RecipePartType } from "../craftModel";

/**
 * Registry system for dynamically collecting and exporting loot configurations
 * This allows automatic gathering of all recipes, parts and variants without manual imports
 */

// Storage for all registered items
const registry: {
  recipeItems: Map<RecipeItemType, RecipeItem[]>;
  recipeParts: Map<RecipePartType, RecipePart[]>;
  junkPieces: Map<JunkPieceId, JunkPiece[]>;
  lootDetails: Map<LootDetailId, LootDetail[]>;
} = {
  recipeItems: new Map(),
  recipeParts: new Map(),
  junkPieces: new Map(),
  lootDetails: new Map(),
};

/**
 * Register a recipe item with the registry
 * @param type The type of the recipe item
 * @param item The recipe item to register
 */
export function registerRecipeItem(type: RecipeItemType, item: RecipeItem): void {
  if (!registry.recipeItems.has(type)) {
    registry.recipeItems.set(type, []);
  }
  registry.recipeItems.get(type)?.push(item);
}

/**
 * Register a recipe part with the registry
 * @param type The type of the recipe part
 * @param part The recipe part to register
 */
export function registerRecipePart(type: RecipePartType, part: RecipePart): void {
  if (!registry.recipeParts.has(type)) {
    registry.recipeParts.set(type, []);
  }
  registry.recipeParts.get(type)?.push(part);
}

/**
 * Register a junk piece with the registry
 * @param id The ID of the junk piece
 * @param detail The junk piece data to register
 */
export function registerJunkPiece(id: JunkPieceId, detail: Omit<JunkPiece, "id">): void {
  if (!registry.junkPieces.has(id)) {
    registry.junkPieces.set(id, []);
  }
  const existingDetails = registry.junkPieces.get(id);
  if (!existingDetails?.some((d) => d.name === detail.name)) {
    existingDetails?.push({ ...detail, id });
  }
}

/**
 * Register a loot detail with the registry
 * @param id The ID of the loot detail
 * @param detail The loot detail data to register
 */
export function registerLootDetail(id: LootDetailId, detail: Omit<LootDetail, "id">): void {
  if (!registry.lootDetails.has(id)) {
    registry.lootDetails.set(id, []);
  }
  const existingDetails = registry.lootDetails.get(id);
  if (!existingDetails?.some((d) => d.name === detail.name)) {
    existingDetails?.push({ ...detail, id });
  }
}

/**
 * Generate the final LootConfig from all registered items
 */
export function generateLootConfig(): LootConfig {
  const config: LootConfig = {
    recipeItems: {},
    recipeParts: {},
    junkPieces: {},
    lootDetails: {},
  } as LootConfig;

  // Convert Maps to the expected format in LootConfig
  registry.recipeItems.forEach((items, type) => {
    config.recipeItems[type] = items; // Fixed: Use items and type
  });

  registry.recipeParts.forEach((parts, type) => {
    config.recipeParts[type] = parts; // Fixed: Use parts and type
  });

  registry.junkPieces.forEach((details, id) => {
    config.junkPieces[id] = details;
  });

  registry.lootDetails.forEach((details, id) => {
    config.lootDetails[id] = details;
  });

  return config; // Fixed: Added return statement
}

/**
 * Validate the current configuration to ensure all required items are registered
 * @returns List of validation issues or empty array if valid
 */
export function validateLootConfig(): string[] {
  const issues: string[] = []; // Fixed: Re-added issues array declaration

  // Check for empty categories
  if (registry.recipeItems.size === 0) {
    issues.push("No recipe items registered");
  }

  if (registry.recipeParts.size === 0) {
    issues.push("No recipe parts registered");
  }

  if (registry.junkPieces.size === 0) {
    issues.push("No junk pieces registered");
  }

  if (registry.lootDetails.size === 0) {
    issues.push("No loot details registered");
  }

  // More complex validation can be added here
  // For example, checking for required relationships between items

  return issues;
}
