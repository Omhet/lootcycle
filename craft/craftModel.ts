// ======= BASIC TYPES AND ENUMERATIONS =======

// Typed identifiers
export type MaterialCategoryId = string;
export type MaterialTypeId = string;
export type MaterialId = string;

// System enumerations
export enum Rarity {
    Common = "common",
    Uncommon = "uncommon",
    Rare = "rare",
    Epic = "epic",
    Legendary = "legendary",
}

// Operation results
export enum CraftingFailureReason {
    NoJunkItems = "NO_JUNK_ITEMS",
    TooLowTemperature = "TOO_LOW_TEMPERATURE",
    TooHighTemperature = "TOO_HIGH_TEMPERATURE",
}

// ======= MATERIALS =======

// Temperature range for materials
export interface TemperatureRange {
    min: number; // Minimum temperature in Celsius
    max: number; // Maximum temperature in Celsius
}

export enum Durability {
    Low = "low",
    Medium = "medium",
    High = "high",
}

// Material category
export interface MaterialCategory {
    id: MaterialCategoryId;
    name: string;
}

// Material type
export interface MaterialType {
    id: MaterialTypeId;
    categoryId: MaterialCategoryId;
    name: string;
    rarity: Rarity;
    durability: Durability;
    basePrice: number; // Price for 1% content in an item part
    optimalTemperatureRange: TemperatureRange;
}

// Specific material
export interface Material {
    id: MaterialId;
    typeId: MaterialTypeId;
}

// Material composition in an item part
export interface MaterialComposition {
    materialId: MaterialId;
    percentage: number; // 0-100
}

export enum MaterialCategoryIdEnum {
    Metal = "metal",
    Wood = "wood",
    // Can be easily extended with new categories
}

// Initial material categories
export const initialMaterialCategories: MaterialCategory[] = [
    { id: MaterialCategoryIdEnum.Metal, name: "Metal" },
    { id: MaterialCategoryIdEnum.Wood, name: "Wood" },
];

// Initial material types with one of each rarity per category
export const initialMaterialTypes: MaterialType[] = [
    // Metal types
    {
        id: "copper",
        name: "Copper",
        categoryId: MaterialCategoryIdEnum.Metal,
        rarity: Rarity.Common,
        durability: Durability.Medium,
        basePrice: 2,
        optimalTemperatureRange: { min: 30, max: 80 },
    },
    {
        id: "iron",
        name: "Iron",
        categoryId: MaterialCategoryIdEnum.Metal,
        rarity: Rarity.Uncommon,
        durability: Durability.Medium,
        basePrice: 4,
        optimalTemperatureRange: { min: 50, max: 100 },
    },
    {
        id: "silver",
        name: "Silver",
        categoryId: MaterialCategoryIdEnum.Metal,
        rarity: Rarity.Rare,
        durability: Durability.Low,
        basePrice: 8,
        optimalTemperatureRange: { min: 40, max: 90 },
    },
    // Wood types
    {
        id: "pine",
        name: "Pine",
        categoryId: MaterialCategoryIdEnum.Wood,
        rarity: Rarity.Common,
        durability: Durability.Low,
        basePrice: 1,
        optimalTemperatureRange: { min: 10, max: 60 },
    },
    {
        id: "oak",
        name: "Oak",
        categoryId: MaterialCategoryIdEnum.Wood,
        rarity: Rarity.Uncommon,
        durability: Durability.Medium,
        basePrice: 3,
        optimalTemperatureRange: { min: 20, max: 70 },
    },
    {
        id: "elvenmwood",
        name: "Elvenwood",
        categoryId: MaterialCategoryIdEnum.Wood,
        rarity: Rarity.Rare,
        durability: Durability.High,
        basePrice: 7,
        optimalTemperatureRange: { min: 15, max: 65 },
    },
];

// ======= ITEMS =======
// TODO: Refactor to divide exact templates types that will be in config with corresponding molecules and atoms in its own files
// (for example, sword template with sword molecules and atoms, axe template with axe molecules and atoms)

export type Pinpoint = {
    coords: {
        x: number;
        y: number;
    };
    localOffset: {
        x: number;
        y: number;
    };
    localRotationAngle: number;
    zIndex: number;
};

// Item category enum
export enum ItemCategoryId {
    Weapon = "weapon",
    // Future categories would go here: Armor, Magic, Accessories, etc.
}

// Item subcategory enum
export enum ItemSubCategoryId {
    MeleeWeapon = "melee_weapon",
    // Future subcategories would go here: Range Weapon, Light Armor, Heavy Armor, etc.
}

export type ItemCategory = {
    id: ItemCategoryId;
    name: string;
};

export type ItemSubCategory = {
    id: ItemSubCategoryId;
    name: string;
    categoryId: ItemCategoryId;
};

// Initial item categories
export const initialItemCategories: ItemCategory[] = [
    { id: ItemCategoryId.Weapon, name: "Weapon" },
];

// Initial item subcategories
export const initialItemSubCategories: ItemSubCategory[] = [
    {
        id: ItemSubCategoryId.MeleeWeapon,
        name: "Melee Weapon",
        categoryId: ItemCategoryId.Weapon,
    },
    // Future subcategories would go here: Range Weapon, Light Armor, Heavy Armor, etc.
];

// export type JunkItemId = string
export type LootItemTemplateId = string;
export type LootMoleculeId = string;
export type LootAtomId = string;

export enum LootItemTemplateType {
    Sword = "sword",
}

export interface LootItemTemplate {
    id: LootItemTemplateId;
    subCategory: ItemSubCategoryId;
    type: LootItemTemplateType;
    name: string;
    sockets: LootMoleculeSocket[];
}

export type LootMoleculeSocket = {
    acceptType: LootMoleculeType;
    acceptTags: LootMoleculeTag[];
    relativeWeight?: number;
    pinpoint: Pinpoint;
};

export enum LootMoleculeType {
    SwordHilt = "sword_hilt",
    SwordBlade = "sword_blade",
}

export enum LootMoleculeTag {
    Handheld = "handheld",
    Sharp = "sharp",
}

export type LootMolecule = {
    id: LootMoleculeId;
    type: LootMoleculeType;
    name: string;
    tags: LootMoleculeTag[];
    sockets: LootAtomSocket[];
};

export type LootAtomSocket = {
    acceptType: LootAtomType;
    relativeWeight?: number;
    pinpoint: Pinpoint;
};

export enum LootAtomType {
    Pommel = "pommel",
    Grip = "grip",
    Guard = "guard",
    Blade = "blade",
}

export type LootAtom = {
    id: LootAtomId;
    type: LootAtomType;
    name: string;
    rarirty: Rarity;
    assetPath: string;
};

// ======= LOOT ITEMS =======

const swordTemplate: LootItemTemplate = {
    id: "sword",
    subCategory: ItemSubCategoryId.MeleeWeapon,
    type: LootItemTemplateType.Sword,
    name: "Basic Sword",
    sockets: [
        {
            acceptType: LootMoleculeType.SwordHilt,
            acceptTags: [LootMoleculeTag.Handheld],
            relativeWeight: 3,
            pinpoint: {
                coords: { x: 0, y: 0 },
                localOffset: { x: 0, y: -0.5 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
        {
            acceptType: LootMoleculeType.SwordBlade,
            acceptTags: [LootMoleculeTag.Sharp],
            relativeWeight: 7,
            pinpoint: {
                coords: { x: 0, y: 0 },
                localOffset: { x: 0, y: 0.5 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
    ],
};

export type LootItemTemplateConfig = Record<
    LootItemTemplateType,
    LootItemTemplate[]
>;

// All loot item templates available in the game
export const lootItemTemplateConfig: LootItemTemplateConfig = {
    [LootItemTemplateType.Sword]: [swordTemplate],
};

// ======= LOOT MOLECULES =======

// Sword molecules and atoms
const swordHiltMolecule: LootMolecule = {
    id: "sword_hilt",
    type: LootMoleculeType.SwordHilt,
    tags: [LootMoleculeTag.Handheld],
    name: "Basic Sword Hilt",
    sockets: [
        {
            acceptType: LootAtomType.Guard,
            relativeWeight: 2,
            pinpoint: {
                coords: { x: 0, y: 0.5 },
                localOffset: { x: 0, y: -0.5 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
        {
            acceptType: LootAtomType.Grip,
            relativeWeight: 1,
            pinpoint: {
                coords: { x: 0, y: 0 },
                localOffset: { x: 0, y: 0 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
        {
            acceptType: LootAtomType.Pommel,
            relativeWeight: 1,
            pinpoint: {
                coords: { x: 0, y: -0.5 },
                localOffset: { x: 0, y: 75 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
    ],
};

const swordBladeMolecule: LootMolecule = {
    id: "sword_blade",
    type: LootMoleculeType.SwordBlade,
    tags: [LootMoleculeTag.Sharp],
    name: "Basic Sword Blade",
    sockets: [
        {
            acceptType: LootAtomType.Blade,
            relativeWeight: 1,
            pinpoint: {
                coords: { x: 0, y: 0 },
                localOffset: { x: 0, y: 0 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
    ],
};

// Elven sword molecules
const elvenSwordHiltMolecule: LootMolecule = {
    id: "elven_sword_hilt",
    type: LootMoleculeType.SwordHilt,
    tags: [LootMoleculeTag.Handheld],
    name: "Elven Sword Hilt",
    sockets: [
        {
            acceptType: LootAtomType.Guard,
            relativeWeight: 2,
            pinpoint: {
                coords: { x: 0, y: 0.5 },
                localOffset: { x: 0, y: -0.5 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
        {
            acceptType: LootAtomType.Grip,
            relativeWeight: 1,
            pinpoint: {
                coords: { x: 0, y: 0 },
                localOffset: { x: 0, y: 0 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
        {
            acceptType: LootAtomType.Pommel,
            relativeWeight: 1,
            pinpoint: {
                coords: { x: 0, y: -0.5 },
                localOffset: { x: 0, y: 0.75 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
    ],
};

const elvenSwordBladeMolecule: LootMolecule = {
    id: "elven_sword_blade",
    type: LootMoleculeType.SwordBlade,
    tags: [LootMoleculeTag.Sharp],
    name: "Elven Sword Blade",
    sockets: [
        {
            acceptType: LootAtomType.Blade,
            relativeWeight: 1,
            pinpoint: {
                coords: { x: 0, y: 0 },
                localOffset: { x: 0, y: 0 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
    ],
};

const swordBasicGuardAtom: LootAtom = {
    id: "sword_basic_guard",
    type: LootAtomType.Guard,
    name: "Basic Sword Guard",
    rarirty: Rarity.Common,
    assetPath: "assets/sword/guards/basic-guard.png",
};
const swordBasicGripAtom: LootAtom = {
    id: "sword_basic_grip",
    type: LootAtomType.Grip,
    name: "Basic Sword Grip",
    rarirty: Rarity.Common,
    assetPath: "assets/sword/grips/basic-grip.png",
};
const swordBasicPommelAtom: LootAtom = {
    id: "sword_basic_pommel",
    type: LootAtomType.Pommel,
    name: "Basic Sword Pommel",
    rarirty: Rarity.Common,
    assetPath: "assets/sword/pommels/basic-pommel.png",
};
const swordBasicBladeAtom: LootAtom = {
    id: "sword_basic_blade",
    type: LootAtomType.Blade,
    name: "Basic Sword Blade",
    rarirty: Rarity.Common,
    assetPath: "assets/sword/blades/basic-blade.png",
};

// Elven sword atoms
const elvenSwordGuardAtom: LootAtom = {
    id: "elven_sword_guard",
    type: LootAtomType.Guard,
    name: "Elven Sword Guard",
    rarirty: Rarity.Rare,
    assetPath: "assets/sword/guards/elven-guard.png",
};

const elvenSwordGripAtom: LootAtom = {
    id: "elven_sword_grip",
    type: LootAtomType.Grip,
    name: "Elven Sword Grip",
    rarirty: Rarity.Rare,
    assetPath: "assets/sword/grips/elven-grip.png",
};

const elvenSwordPommelAtom: LootAtom = {
    id: "elven_sword_pommel",
    type: LootAtomType.Pommel,
    name: "Elven Sword Pommel",
    rarirty: Rarity.Rare,
    assetPath: "assets/sword/pommels/elven-pommel.png",
};

const elvenSwordBladeAtom: LootAtom = {
    id: "elven_sword_blade",
    type: LootAtomType.Blade,
    name: "Elven Sword Blade",
    rarirty: Rarity.Rare,
    assetPath: "assets/sword/blades/elven-blade.png",
};

export type LootMoleculeConfig = Record<LootMoleculeType, LootMolecule[]>;
// All molecules and atoms available in the game
export const lootMoleculeConfig: Record<LootMoleculeType, LootMolecule[]> = {
    [LootMoleculeType.SwordHilt]: [swordHiltMolecule, elvenSwordHiltMolecule],
    [LootMoleculeType.SwordBlade]: [
        swordBladeMolecule,
        elvenSwordBladeMolecule,
    ],
};

export type LootAtomConfig = Record<LootAtomType, LootAtom[]>;
export const lootAtomConfig: Record<LootAtomType, LootAtom[]> = {
    [LootAtomType.Guard]: [swordBasicGuardAtom, elvenSwordGuardAtom],
    [LootAtomType.Grip]: [swordBasicGripAtom, elvenSwordGripAtom],
    [LootAtomType.Pommel]: [swordBasicPommelAtom, elvenSwordPommelAtom],
    [LootAtomType.Blade]: [swordBasicBladeAtom, elvenSwordBladeAtom],
};

// ======= LOOT OBJECTS TYPES (that will be generated in build time and then used in runtime) =======

export type LootItemId = string;
export type LootPartId = string;
export type LootDetailId = LootAtomId;

export type LootItem = {
    id: LootItemId;
    templateId: LootItemTemplateId;
    subparts: LootPartId[];
    materialComposition: MaterialComposition[];
    rarity: Rarity;
    temperatureRange: TemperatureRange;
    masterQualityTemperatureRange: TemperatureRange;
};

export type LootPart = {
    id: LootPartId;
    moleculeId: LootMoleculeId;
    subparts: LootDetailId[];
    materialComposition: MaterialComposition[];
    rarity: Rarity;
};

export type LootDetail = {
    id: LootDetailId;
    atomId: LootAtomId;
    materialComposition: MaterialComposition[];
    rarity: Rarity;
};

export type LootJunk = LootDetail & {
    durability: number;
    overrideAssetPath?: string;
};

export type LootJunkItem = LootJunk & {
    degradation: number; // Degradation remains in the type for runtime use
};

// Helper to combine material compositions with weights
const combineMaterialCompositions = (
    compositions: Array<{ composition: MaterialComposition[]; weight: number }>
): MaterialComposition[] => {
    const materialMap = new Map<MaterialId, number>();
    let totalWeight = 0;

    // Sum all weights and accumulate material percentages
    compositions.forEach(({ composition, weight }) => {
        totalWeight += weight;
        composition.forEach(({ materialId, percentage }) => {
            const weightedPercentage = (percentage * weight) / 100;
            materialMap.set(
                materialId,
                (materialMap.get(materialId) || 0) + weightedPercentage
            );
        });
    });

    // Normalize percentages based on total weight
    const result: MaterialComposition[] = [];
    materialMap.forEach((weightedPercentage, materialId) => {
        const normalizedPercentage = (weightedPercentage / totalWeight) * 100;
        result.push({
            materialId,
            percentage: parseFloat(normalizedPercentage.toFixed(2)),
        });
    });

    // Ensure percentages sum to exactly 100%
    if (result.length > 0) {
        const sum = result.reduce((acc, { percentage }) => acc + percentage, 0);
        const adjustment = 100 - sum;
        result[0].percentage += parseFloat(adjustment.toFixed(2));
    }

    return result;
};

// ======= CRAFTING FUNCTION =======

export interface CraftingResult {
    success: boolean;
    item?: LootItem;
    quality?: number; // 0-100 quality percentage
    sellPrice?: number;
    failure?: {
        reason: CraftingFailureReason;
    };
}

export function craftLootItem(params: {
    lootItemTemplate: LootItemTemplate;
    availableJunkItems: LootJunkItem[];
    temperature: number;
    config: {
        lootItems: Record<LootItemId, LootItem>;
        lootParts: Record<LootPartId, LootPart>;
    };
}): CraftingResult {
    const {
        lootItemTemplate,
        availableJunkItems,
        temperature,
        config: { lootItems, lootParts },
    } = params;

    // Step 1: Check if there are any junk items (keep this check as required)
    if (availableJunkItems.length === 0) {
        return {
            success: false,
            failure: { reason: CraftingFailureReason.NoJunkItems },
        };
    }

    // Step 2: Organize junk items by atom type for selection
    const junkItemsByType: Partial<Record<LootAtomType, LootJunkItem[]>> = {};
    availableJunkItems.forEach((junkItem) => {
        // Use the explicit atomId instead of parsing from the id string
        const atomId = junkItem.atomId;
        const atom = Object.values(lootAtomConfig)
            .flat()
            .find((a) => a.id === atomId);
        if (atom) {
            if (!junkItemsByType[atom.type]) {
                junkItemsByType[atom.type] = [];
            }
            junkItemsByType[atom.type]?.push(junkItem);
        }
    });

    // Step 3: Select junk items based on template requirements
    let selectedJunkItems: LootJunkItem[] = [];
    let socketWeights: number[] = [];

    // Try to find the best molecule configuration across all sockets
    const moleculeSelections: Array<{
        socketIndex: number;
        molecule: LootMolecule;
        junkItems: LootJunkItem[];
        weights: number[];
        qualityScore: number;
    }> = [];

    // For each socket in the template, evaluate all compatible molecules
    for (
        let socketIndex = 0;
        socketIndex < lootItemTemplate.sockets.length;
        socketIndex++
    ) {
        const socket = lootItemTemplate.sockets[socketIndex];
        const compatibleMolecules = lootMoleculeConfig[socket.acceptType] || [];

        if (compatibleMolecules.length === 0) continue;

        // Try each compatible molecule
        for (const molecule of compatibleMolecules) {
            // Check if all atom sockets can be filled with available junk items
            const selectedJunks: LootJunkItem[] = [];
            const weights: number[] = [];
            let canFillAllSockets = true;

            // Clone junkItemsByType to avoid modifying the original during evaluation
            const availableJunksByType = { ...junkItemsByType };

            // Make deep copies of the arrays
            Object.keys(availableJunksByType).forEach((key) => {
                const atomType = key as LootAtomType;
                availableJunksByType[atomType] = [
                    ...(junkItemsByType[atomType] || []),
                ];
            });

            // For each atom socket in the molecule, try to select a junk item
            for (const atomSocket of molecule.sockets) {
                const availableJunksOfType =
                    availableJunksByType[atomSocket.acceptType] || [];

                if (availableJunksOfType.length === 0) {
                    canFillAllSockets = false;
                    break;
                }

                // Select the junk with lowest degradation for better quality
                availableJunksOfType.sort(
                    (a, b) => a.degradation - b.degradation
                );
                const selectedJunk = availableJunksOfType.shift(); // Take and remove the best one

                if (selectedJunk) {
                    selectedJunks.push(selectedJunk);
                    weights.push(atomSocket.relativeWeight || 1);
                } else {
                    canFillAllSockets = false;
                    break;
                }
            }

            if (canFillAllSockets) {
                // Calculate a quality score for this molecule selection
                const totalWeight = weights.reduce((sum, w) => sum + w, 0);
                const qualityScore = selectedJunks.reduce(
                    (score, junk, i) =>
                        score +
                        (100 - junk.degradation) * (weights[i] / totalWeight),
                    0
                );

                moleculeSelections.push({
                    socketIndex,
                    molecule,
                    junkItems: selectedJunks,
                    weights,
                    qualityScore,
                });
            }
        }
    }

    // If we couldn't find any valid molecule configuration, use any available junk items
    if (moleculeSelections.length === 0) {
        // Just use the best junk items we have, regardless of strict compatibility
        const bestJunks = Object.values(junkItemsByType)
            .flat()
            .sort((a, b) => a.degradation - b.degradation)
            .slice(0, Math.min(5, availableJunkItems.length)); // Take up to 5 best junk items

        selectedJunkItems = bestJunks;
        socketWeights = bestJunks.map(() => 1); // Equal weight for all
    } else {
        // Sort molecule selections by quality score (descending)
        moleculeSelections.sort((a, b) => b.qualityScore - a.qualityScore);

        // Group the best molecules by socket
        const bestMoleculesBySocket: Record<
            number,
            (typeof moleculeSelections)[0]
        > = {};

        for (const selection of moleculeSelections) {
            if (
                !bestMoleculesBySocket[selection.socketIndex] ||
                selection.qualityScore >
                    bestMoleculesBySocket[selection.socketIndex].qualityScore
            ) {
                bestMoleculesBySocket[selection.socketIndex] = selection;
            }
        }

        // Combine all selected junk items from the best molecule per socket
        Object.values(bestMoleculesBySocket).forEach((selection) => {
            selectedJunkItems.push(...selection.junkItems);
            socketWeights.push(...selection.weights);
        });
    }

    // Step 4: Calculate combined material composition
    const materialCompositions = selectedJunkItems.map((junkItem, index) => ({
        composition: junkItem.materialComposition,
        weight: socketWeights[index] || 1, // Default to 1 if no weight specified
    }));

    const combinedMaterialComposition =
        combineMaterialCompositions(materialCompositions);

    // Step 5: Find the most compatible item from potential items

    // Track the molecules we've selected (if any)
    const selectedMolecules = new Set<string>();
    if (moleculeSelections.length > 0) {
        Object.values(moleculeSelections).forEach((selection) => {
            selectedMolecules.add(selection.molecule.id);
        });
    }

    // Filter potential items that match the template
    let potentialItems = Object.values(lootItems).filter(
        (item) => item.templateId === lootItemTemplate.id
    );

    // If we found molecules, further refine by checking if any parts use our selected molecules
    if (selectedMolecules.size > 0) {
        potentialItems = potentialItems.filter((item) => {
            return item.subparts.some((partId) => {
                const part = lootParts[partId];
                if (!part) return false;
                return selectedMolecules.has(part.moleculeId);
            });
        });
    }

    // If still no potential items, just use any item that matches the template
    if (potentialItems.length === 0) {
        potentialItems = Object.values(lootItems).filter(
            (item) => item.templateId === lootItemTemplate.id
        );
    }

    let bestMatch: LootItem;

    if (potentialItems.length === 0) {
        throw new Error("No potential items found for crafting.");
    } else {
        // Find the item with the closest material composition
        bestMatch = potentialItems[0];
        let bestScore = calculateMaterialSimilarity(
            bestMatch.materialComposition,
            combinedMaterialComposition
        );

        for (const item of potentialItems) {
            const score = calculateMaterialSimilarity(
                item.materialComposition,
                combinedMaterialComposition
            );
            if (score > bestScore) {
                bestMatch = item;
                bestScore = score;
            }
        }
    }

    // Step 6: Check if temperature is appropriate for crafting (keep this check as required)
    if (temperature < bestMatch.temperatureRange.min) {
        return {
            success: false,
            failure: {
                reason: CraftingFailureReason.TooLowTemperature,
            },
        };
    }

    if (temperature > bestMatch.temperatureRange.max) {
        return {
            success: false,
            failure: {
                reason: CraftingFailureReason.TooHighTemperature,
            },
        };
    }

    // Step 7: Calculate quality based on junk item degradation and temperature
    const avgDegradation =
        selectedJunkItems.reduce(
            (sum, junk, index) =>
                sum + junk.degradation * (socketWeights[index] || 1),
            0
        ) / socketWeights.reduce((sum, weight) => sum + (weight || 1), 0);

    let quality = 100 - avgDegradation;

    // Adjust quality based on temperature within optimal range
    const inMasterRange =
        temperature >= bestMatch.masterQualityTemperatureRange.min &&
        temperature <= bestMatch.masterQualityTemperatureRange.max;

    if (inMasterRange) {
        // Boost quality if temperature is in master range
        quality = Math.min(100, quality * 1.5);
    } else {
        // Penalty based on how far from master temperature range
        const distanceToMasterRange = Math.min(
            Math.abs(temperature - bestMatch.masterQualityTemperatureRange.min),
            Math.abs(temperature - bestMatch.masterQualityTemperatureRange.max)
        );

        const maxDistance = Math.max(
            bestMatch.temperatureRange.max -
                bestMatch.masterQualityTemperatureRange.max,
            bestMatch.masterQualityTemperatureRange.min -
                bestMatch.temperatureRange.min
        );

        // Quality penalty (up to 30%)
        const penalty = (distanceToMasterRange / maxDistance) * 30;
        quality = Math.max(10, quality - penalty);
    }

    // Step 8: Calculate final sell price
    const rarityMultipliers: Record<Rarity, number> = {
        [Rarity.Common]: 1,
        [Rarity.Uncommon]: 2,
        [Rarity.Rare]: 4,
        [Rarity.Epic]: 8,
        [Rarity.Legendary]: 16,
    };

    const rarityFactor = rarityMultipliers[bestMatch.rarity];

    // Calculate material value
    const materialValue = combinedMaterialComposition.reduce(
        (value, { materialId, percentage }) => {
            const materialType = initialMaterialTypes.find(
                (mt) => mt.id === materialId
            );
            if (materialType) {
                return value + materialType.basePrice * (percentage / 100);
            }
            return value;
        },
        0
    );

    // Quality affects price (higher quality = higher price)
    const qualityFactor = 0.5 + (quality / 100) * 1.5; // 0.5 to 2.0

    const sellPrice = Math.round(
        materialValue * rarityFactor * qualityFactor * 10
    );

    return {
        success: true,
        item: bestMatch,
        quality,
        sellPrice,
    };
}

// Helper function to calculate similarity between material compositions
function calculateMaterialSimilarity(
    composition1: MaterialComposition[],
    composition2: MaterialComposition[]
): number {
    let similarity = 0;

    // Create maps of material percentages for easier comparison
    const map1 = new Map(
        composition1.map((mc) => [mc.materialId, mc.percentage])
    );
    const map2 = new Map(
        composition2.map((mc) => [mc.materialId, mc.percentage])
    );

    // Combine all material IDs
    const allMaterials = new Set([...map1.keys(), ...map2.keys()]);

    // For each material, calculate the similarity (100 - absolute difference)
    allMaterials.forEach((materialId) => {
        const percentage1 = map1.get(materialId) || 0;
        const percentage2 = map2.get(materialId) || 0;

        const materialSimilarity = 100 - Math.abs(percentage1 - percentage2);
        similarity += materialSimilarity;
    });

    // Normalize by the number of materials
    return similarity / allMaterials.size;
}
