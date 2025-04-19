import {
    LootConfig,
    PecipePart,
    PecipePartType,
    RecipeDetailType,
    RecipeDetailVariant,
    RecipeItem,
    RecipeItemType,
} from "../craftModel.js";

// Import configurations from specific template files
import { swordDetailVariants, swordParts, swordRecipes } from "./sword.js";
// import { axeDetailVariants, axeParts, axeRecipes } from "./axe.js"; // Example for future expansion

// Combine all imported configurations
const allDetailVariants: RecipeDetailVariant[] = [
    ...swordDetailVariants,
    // ...axeDetailVariants,
];

const allParts: PecipePart[] = [
    ...swordParts,
    // ...axeParts,
];

const allRecipes: RecipeItem[] = [
    ...swordRecipes,
    // ...axeRecipes,
];

// Helper function to group items by their type into a Record
function groupByType<T extends { type: string }, K extends string>(
    items: T[],
    typeEnum: Record<string, K>
): Record<K, T[]> {
    const grouped: Partial<Record<K, T[]>> = {};

    // Initialize empty arrays for each type
    Object.values(typeEnum).forEach((typeValue) => {
        grouped[typeValue] = [];
    });

    items.forEach((item) => {
        const itemType = item.type as K;
        if (grouped[itemType]) {
            grouped[itemType]!.push(item);
        } else {
            console.warn(
                `Item with type ${item.type} does not match any known type enum value.`
            );
        }
    });

    return grouped as Record<K, T[]>;
}

// Group the RecipeDetailVariants by their detailId to match the expected structure
function groupDetailVariantsByType(
    items: RecipeDetailVariant[]
): Record<RecipeDetailType, RecipeDetailVariant[]> {
    const grouped: Partial<Record<RecipeDetailType, RecipeDetailVariant[]>> =
        {};

    // Initialize empty arrays for each detail type
    Object.values(RecipeDetailType).forEach((detailType) => {
        grouped[detailType] = [];
    });

    items.forEach((item) => {
        const detailType = inferDetailTypeFromId(item.detailId);
        if (grouped[detailType]) {
            grouped[detailType]!.push(item);
        } else {
            console.warn(
                `RecipeDetailVariant with detailId ${item.detailId} could not be matched to a known type.`
            );
        }
    });

    return grouped as Record<RecipeDetailType, RecipeDetailVariant[]>;
}

// Helper function to infer the RecipeDetailType from a detailId
// This is a placeholder - you'll need to implement this based on your specific naming conventions
function inferDetailTypeFromId(detailId: string): RecipeDetailType {
    if (detailId.includes("pommel")) return RecipeDetailType.Pommel;
    if (detailId.includes("grip")) return RecipeDetailType.Grip;
    if (detailId.includes("guard")) return RecipeDetailType.Guard;
    if (detailId.includes("blade")) return RecipeDetailType.ShortSwordBlade;

    // Default fallback - you should adjust this based on your needs
    console.warn(`Could not infer RecipeDetailType from detailId: ${detailId}`);
    return RecipeDetailType.Pommel;
}

// Assemble the final LootConfig object
export const lootConfig: LootConfig = {
    RecipeItems: groupByType(allRecipes, RecipeItemType),
    PecipeParts: groupByType(allParts, PecipePartType),
    RecipeDetails: groupDetailVariantsByType(allDetailVariants),
};

// Optional: Log the assembled config for debugging
// console.log("Assembled Loot Config:", JSON.stringify(lootConfig, null, 2));
