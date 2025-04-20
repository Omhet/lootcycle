import { ChanceTables, Quality, Rarity } from "../craftModel";

/**
 * Default chance tables for quality and rarity distribution in junk portions
 * These tables define the probability of different quality and rarity levels
 * appearing in junk portions based on the current game level
 */
export const defaultChanceTables: ChanceTables = {
    qualityChanceTables: {
        1: {
            [Quality.Worst]: 0.4,
            [Quality.Bad]: 0.3,
            [Quality.Good]: 0.2,
            [Quality.Better]: 0.1,
            [Quality.Best]: 0.0,
        },
        2: {
            [Quality.Worst]: 0.3,
            [Quality.Bad]: 0.3,
            [Quality.Good]: 0.25,
            [Quality.Better]: 0.15,
            [Quality.Best]: 0.0,
        },
        3: {
            [Quality.Worst]: 0.2,
            [Quality.Bad]: 0.3,
            [Quality.Good]: 0.3,
            [Quality.Better]: 0.15,
            [Quality.Best]: 0.05,
        },
    },
    rarityChanceTables: {
        1: {
            [Rarity.Common]: 0.6,
            [Rarity.Uncommon]: 0.3,
            [Rarity.Rare]: 0.1,
            [Rarity.Epic]: 0.0,
            [Rarity.Legendary]: 0.0,
        },
        2: {
            [Rarity.Common]: 0.4,
            [Rarity.Uncommon]: 0.4,
            [Rarity.Rare]: 0.15,
            [Rarity.Epic]: 0.05,
            [Rarity.Legendary]: 0.0,
        },
        3: {
            [Rarity.Common]: 0.3,
            [Rarity.Uncommon]: 0.3,
            [Rarity.Rare]: 0.25,
            [Rarity.Epic]: 0.1,
            [Rarity.Legendary]: 0.05,
        },
    },
};

// Register chance tables in the config registry
let chanceTables: ChanceTables | null = null;

/**
 * Gets the current chance tables configuration
 * @returns The current chance tables configuration
 */
export function getChanceTables(): ChanceTables {
    if (!chanceTables) {
        chanceTables = defaultChanceTables;
    }
    return chanceTables;
}

/**
 * Sets custom chance tables configuration
 * @param tables The chance tables to set
 */
export function setChanceTables(tables: ChanceTables): void {
    chanceTables = tables;
}
