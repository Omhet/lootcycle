import {
    JunkDetail,
    JunkDetailType,
    JunkPart,
    JunkPartType,
    LootConfig,
    PecipePart,
    PecipePartType,
    RecipeItem,
    RecipeItemType,
} from "../craftModel";

/**
 * Registry system for dynamically collecting and exporting loot configurations
 * This allows automatic gathering of all recipes, parts and variants without manual imports
 */

// Storage for all registered items
const registry: {
    recipeItems: Map<RecipeItemType, RecipeItem[]>;
    recipeParts: Map<PecipePartType, PecipePart[]>;
    junkParts: Map<JunkPartType, JunkPart[]>;
    junkDetails: Map<JunkDetailType, JunkDetail[]>;
} = {
    recipeItems: new Map(),
    recipeParts: new Map(),
    junkParts: new Map(),
    junkDetails: new Map(),
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
 * Register a junk part with the registry
 * @param type The type of the junk part
 * @param part The junk part to register
 */
export function registerJunkPart(type: JunkPartType, part: JunkPart): void {
    if (!registry.junkParts.has(type)) {
        registry.junkParts.set(type, []);
    }
    registry.junkParts.get(type)?.push(part);
}

/**
 * Register a junk detail with the registry
 * @param type The type of the junk detail
 * @param detail The junk detail to register
 */
export function registerJunkDetail(
    type: JunkDetailType,
    detail: JunkDetail
): void {
    if (!registry.junkDetails.has(type)) {
        registry.junkDetails.set(type, []);
    }
    registry.junkDetails.get(type)?.push(detail);
}

/**
 * Generate the final LootConfig from all registered items
 */
export function generateLootConfig(): LootConfig {
    const config: LootConfig = {
        recipeItems: {},
        recipeParts: {},
        junkParts: {},
        junkDetails: {},
    } as LootConfig;

    // Convert Maps to the expected format in LootConfig
    registry.recipeItems.forEach((items, type) => {
        config.recipeItems[type] = items;
    });

    registry.recipeParts.forEach((parts, type) => {
        config.recipeParts[type] = parts;
    });

    registry.junkParts.forEach((parts, type) => {
        config.junkParts[type] = parts;
    });

    registry.junkDetails.forEach((details, type) => {
        config.junkDetails[type] = details;
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

    if (registry.junkParts.size === 0) {
        issues.push("No junk parts registered");
    }

    if (registry.junkDetails.size === 0) {
        issues.push("No junk details registered");
    }

    // More complex validation can be added here
    // For example, checking for required relationships between items

    return issues;
}
