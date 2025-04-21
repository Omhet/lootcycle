import {
    JunkPiece,
    JunkPieceId,
    LootConfig,
    RecipeItem,
    RecipeItemType,
    RecipePart,
    RecipePartType,
} from "../craftModel";

/**
 * Registry system for dynamically collecting and exporting loot configurations
 * This allows automatic gathering of all recipes, parts and variants without manual imports
 */

// Storage for all registered items
const registry: {
    recipeItems: Map<RecipeItemType, RecipeItem[]>;
    recipeParts: Map<RecipePartType, RecipePart[]>;
    junkPieces: Map<JunkPieceId, JunkPiece[]>;
} = {
    recipeItems: new Map(),
    recipeParts: new Map(),
    junkPieces: new Map(),
};

/**
 * Register a recipe item with the registry
 * @param type The type of the recipe item
 * @param item The recipe item to register
 */
export function registerRecipeItem(
    type: RecipeItemType,
    item: RecipeItem
): void {
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
export function registerRecipePart(
    type: RecipePartType,
    part: RecipePart
): void {
    if (!registry.recipeParts.has(type)) {
        registry.recipeParts.set(type, []);
    }
    registry.recipeParts.get(type)?.push(part);
}

/**
 * Register a junk detail with the registry
 * @param type The type of the junk detail
 * @param detail The junk detail to register
 */
export function registerJunkDetail(
    id: JunkPieceId,
    detail: Omit<JunkPiece, "id">
): void {
    if (!registry.junkPieces.has(id)) {
        registry.junkPieces.set(id, []);
    }
    registry.junkPieces.get(id)?.push({ ...detail, id });
}

/**
 * Generate the final LootConfig from all registered items
 */
export function generateLootConfig(): LootConfig {
    const config: LootConfig = {
        recipeItems: {},
        recipeParts: {},
        junkPieces: {},
    } as LootConfig;

    // Convert Maps to the expected format in LootConfig
    registry.recipeItems.forEach((items, type) => {
        config.recipeItems[type] = items;
    });

    registry.recipeParts.forEach((parts, type) => {
        config.recipeParts[type] = parts;
    });

    registry.junkPieces.forEach((details, type) => {
        config.junkPieces[type] = details;
    });

    return config;
}

/**
 * Validate the current configuration to ensure all required items are registered
 * @returns List of validation issues or empty array if valid
 */
export function validateLootConfig(): string[] {
    const issues: string[] = [];

    // Check for empty categories
    if (registry.recipeItems.size === 0) {
        issues.push("No recipe items registered");
    }

    if (registry.recipeParts.size === 0) {
        issues.push("No recipe parts registered");
    }

    if (registry.junkPieces.size === 0) {
        issues.push("No junk details registered");
    }

    // More complex validation can be added here
    // For example, checking for required relationships between items

    return issues;
}
