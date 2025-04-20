import {
    LootConfig,
    PecipePart,
    PecipePartType,
    RecipeDetailType,
    RecipeDetailVariant,
    RecipeItem,
    RecipeItemType,
} from "../craftModel.js";

/**
 * Registry system for dynamically collecting and exporting loot configurations
 * This allows automatic gathering of all recipes, parts and variants without manual imports
 */

// Storage for all registered items
const registry: {
    recipeItems: Map<RecipeItemType, RecipeItem[]>;
    recipeParts: Map<PecipePartType, PecipePart[]>;
    recipeDetailVariants: Map<RecipeDetailType, RecipeDetailVariant[]>;
} = {
    recipeItems: new Map(),
    recipeParts: new Map(),
    recipeDetailVariants: new Map(),
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
    type: PecipePartType,
    part: PecipePart
): void {
    if (!registry.recipeParts.has(type)) {
        registry.recipeParts.set(type, []);
    }
    registry.recipeParts.get(type)?.push(part);
}

/**
 * Register a recipe detail variant with the registry
 * @param type The type of the recipe detail variant
 * @param variant The recipe detail variant to register
 */
export function registerRecipeDetailVariant(
    type: RecipeDetailType,
    variant: RecipeDetailVariant
): void {
    if (!registry.recipeDetailVariants.has(type)) {
        registry.recipeDetailVariants.set(type, []);
    }
    registry.recipeDetailVariants.get(type)?.push(variant);
}

/**
 * Generate the final LootConfig from all registered items
 */
export function generateLootConfig(): LootConfig {
    const config: LootConfig = {
        recipeItems: {},
        recipeParts: {},
        recipeDetails: {},
    } as LootConfig;

    // Convert Maps to the expected format in LootConfig
    registry.recipeItems.forEach((items, type) => {
        config.recipeItems[type] = items;
    });

    registry.recipeParts.forEach((parts, type) => {
        config.recipeParts[type] = parts;
    });

    registry.recipeDetailVariants.forEach((variants, type) => {
        config.recipeDetails[type] = variants;
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

    if (registry.recipeDetailVariants.size === 0) {
        issues.push("No recipe detail variants registered");
    }

    // More complex validation can be added here
    // For example, checking for required relationships between items

    return issues;
}
