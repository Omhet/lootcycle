import { Rarity } from "./craftModel";

// ======= CONSTANTS =======

export const RarityMultipliers: Record<Rarity, number> = {
    [Rarity.Common]: 1.0,
    [Rarity.Uncommon]: 1.5,
    [Rarity.Rare]: 2.5,
    [Rarity.Epic]: 4.0,
    [Rarity.Legendary]: 6.0,
};
