import {
    CraftingFailureReason,
    CraftingResult,
    ItemPart,
    ItemVariant,
    JunkItem,
    LootItem,
    LootItemId,
    Material,
    MaterialAnalysis,
    MaterialComposition,
    MaterialId,
    MaterialType,
    MaterialTypeId,
    Part,
    PartId,
    Rarity,
    TemperatureCompatibilityResult,
    TemperatureFailureReason,
    TemperatureRange,
} from './craftModel'
import { craftMaterialData } from './data/craftMaterialDataHelpers'

/**
 * Main item crafting function
 * @param junkItems Array of junk items
 * @param temperatureCelsius Current temperature in the furnace (Celsius)
 * @returns Crafting result with the created item or reason for failure
 */
function craftLootItem(junkItems: JunkItem[], temperatureCelsius: number): CraftingResult {
    // 1. Check for empty input data
    if (junkItems.length === 0) {
        return {
            success: false,
            reason: CraftingFailureReason.NoItems,
        }
    }

    // 2. Analyze input materials
    const materialAnalysis: MaterialAnalysis = analyzeInputMaterials(junkItems)

    // 3. Determine output item variant
    const outputItemVariant: ItemVariant = determineOutputItemVariant(junkItems)

    // 4. Check temperature compatibility with materials
    const temperatureCheck: TemperatureCompatibilityResult = checkTemperatureCompatibility(
        materialAnalysis.dominantMaterialType,
        temperatureCelsius
    )

    if (!temperatureCheck.compatible) {
        return {
            success: false,
            reason:
                temperatureCheck.reason === TemperatureFailureReason.TooLow
                    ? CraftingFailureReason.TooLowTemperature
                    : CraftingFailureReason.TooHighTemperature,
        }
    }

    // 5. Distribute materials across output item parts
    const outputParts: ItemPart[] = distributePartsAndMaterials(outputItemVariant, materialAnalysis.allMaterials)

    // 6. Calculate result rarity
    const outputRarity: Rarity = calculateOutputRarity(outputParts)

    // 7. Check chance for "Masterwork" modifier
    const isMasterwork: boolean = checkForMasterwork(temperatureCelsius, materialAnalysis)

    // 8. Generate name
    const outputName: string = generateItemName(outputItemVariant, outputParts, outputRarity, isMasterwork)

    // 9. Calculate price
    const outputPrice: number = calculatePrice(outputParts, outputRarity, isMasterwork)

    // 10. Create final object
    const lootItem: LootItem = {
        id: generateUniqueId() as LootItemId,
        name: outputName,
        variantId: outputItemVariant.id,
        rarity: outputRarity,
        parts: outputParts,
        isMasterwork: isMasterwork,
        price: outputPrice,
    }

    return {
        success: true,
        item: lootItem,
    }
}

/**
 * Analyzes input junk items to determine material composition
 */
function analyzeInputMaterials(junkItems: JunkItem[]): MaterialAnalysis {
    const allMaterials: Record<MaterialId, number> = {}
    let totalWeight: number = 0

    // For each junk item, get its part and composition
    for (const junkItem of junkItems) {
        // Get the material composition for this part from the database/storage
        const partComposition: MaterialComposition[] = getPartComposition(junkItem.partId)

        for (const composition of partComposition) {
            if (!allMaterials[composition.materialId]) {
                allMaterials[composition.materialId] = 0
            }

            const materialWeight: number = composition.percentage / 100
            allMaterials[composition.materialId] += materialWeight
            totalWeight += materialWeight
        }
    }

    // Normalize to 100%
    for (const materialId in allMaterials) {
        allMaterials[materialId] = (allMaterials[materialId] / totalWeight) * 100
    }

    // Find the dominant material
    let dominantMaterialId: MaterialId = ''
    let maxPercentage: number = 0

    for (const materialId in allMaterials) {
        if (allMaterials[materialId] > maxPercentage) {
            maxPercentage = allMaterials[materialId]
            dominantMaterialId = materialId
        }
    }

    const material: Material = getMaterialById(dominantMaterialId)
    const dominantMaterialType: MaterialType = getMaterialTypeById(material.typeId)

    return {
        allMaterials,
        dominantMaterialType,
    }
}

/**
 * Determines the item variant that will be created from junk items
 */
function determineOutputItemVariant(junkItems: JunkItem[]): ItemVariant {
    // Collect all parts contained in junk items
    const partIds: PartId[] = junkItems.map((item) => item.partId)

    // Find all possible item variants that can be created from these parts
    const possibleVariants: ItemVariant[] = findPossibleVariants(partIds)

    // If no possible variants were found
    if (possibleVariants.length === 0) {
        // Use a default variant corresponding to the first part's type
        const defaultVariant: ItemVariant = getDefaultVariantForPart(junkItems[0].partId)
        return defaultVariant
    }

    // If multiple variants were found, choose the best one (using parts most completely)
    return findBestVariant(possibleVariants, partIds)
}

/**
 * Checks temperature compatibility with material
 */
function checkTemperatureCompatibility(
    materialType: MaterialType,
    temperatureCelsius: number
): TemperatureCompatibilityResult {
    const tempRange: TemperatureRange = materialType.optimalTemperatureRange

    if (temperatureCelsius < tempRange.min) {
        return {
            compatible: false,
            reason: TemperatureFailureReason.TooLow,
        }
    }

    if (temperatureCelsius > tempRange.max) {
        return {
            compatible: false,
            reason: TemperatureFailureReason.TooHigh,
        }
    }

    return { compatible: true }
}

/**
 * Distributes materials across output item parts
 */
function distributePartsAndMaterials(itemVariant: ItemVariant, materials: Record<MaterialId, number>): ItemPart[] {
    const outputParts: ItemPart[] = []

    // Get all required parts for this item variant
    const requiredParts: Part[] = itemVariant.requiredParts.map((partId) => getPartById(partId))

    // For each required part
    for (const part of requiredParts) {
        // Create new material composition for this part
        const partComposition: MaterialComposition[] = []

        // Distribute materials proportionally to their total weight
        // Consider only materials suitable for this part
        let totalPartPercentage: number = 0

        for (const materialId in materials) {
            // Check if material is suitable for this part
            const material: Material = getMaterialById(materialId)
            const materialType: MaterialType = getMaterialTypeById(material.typeId)

            if (isCompatibleMaterialForPart(materialType, part)) {
                const percentage: number = materials[materialId]

                if (percentage > 1) {
                    // Ignore too small fractions
                    partComposition.push({
                        materialId: materialId,
                        percentage: percentage,
                    })

                    totalPartPercentage += percentage
                }
            }
        }

        // If part received no materials, add default material
        if (partComposition.length === 0 || totalPartPercentage < 100) {
            const defaultMaterial: Material = getDefaultMaterialForPart(part.id)

            // If there are already some materials, add default up to 100%
            if (partComposition.length > 0) {
                partComposition.push({
                    materialId: defaultMaterial.id,
                    percentage: 100 - totalPartPercentage,
                })
            } else {
                // If no materials, use only default
                partComposition.push({
                    materialId: defaultMaterial.id,
                    percentage: 100,
                })
            }
        } else if (totalPartPercentage > 100) {
            // Normalize percentages in part composition to sum of 100%
            normalizeComposition(partComposition)
        }

        outputParts.push({
            partId: part.id,
            composition: partComposition,
        })
    }

    return outputParts
}

/**
 * Normalizes material composition to sum of 100%
 */
function normalizeComposition(composition: MaterialComposition[]): void {
    // Calculate total percentage sum
    let total: number = 0
    for (const comp of composition) {
        total += comp.percentage
    }

    // Normalize
    if (total > 0) {
        for (let i = 0; i < composition.length; i++) {
            composition[i].percentage = (composition[i].percentage / total) * 100
        }
    }
}

/**
 * Checks if material is suitable for the part
 */
function isCompatibleMaterialForPart(materialType: MaterialType, part: Part): boolean {
    // In a real implementation, there would be compatibility checks
    // For example, metal for a sword blade, wood for a handle, etc.
    // For simplicity, assume all materials are compatible
    return true
}

/**
 * Calculates output item rarity based on material rarities
 */
function calculateOutputRarity(parts: ItemPart[]): Rarity {
    let totalRarityScore: number = 0
    let totalWeight: number = 0

    // For each part
    for (const part of parts) {
        // For each material in the part
        for (const composition of part.composition) {
            const material: Material = getMaterialById(composition.materialId)
            const materialType: MaterialType = getMaterialTypeById(material.typeId)
            const rarityScore: number = getRarityScore(materialType.rarity)

            // Add weighted contribution of this material to total rarity
            totalRarityScore += rarityScore * (composition.percentage / 100)
            totalWeight += composition.percentage / 100
        }
    }

    // Normalize final score
    const finalRarityScore: number = totalRarityScore / totalWeight

    // Convert numeric score back to Rarity enum
    return mapScoreToRarity(finalRarityScore)
}

/**
 * Converts rarity to numeric value
 */
function getRarityScore(rarity: Rarity): number {
    switch (rarity) {
        case Rarity.Common:
            return 1
        case Rarity.Uncommon:
            return 2
        case Rarity.Rare:
            return 3
        case Rarity.Epic:
            return 4
        case Rarity.Legendary:
            return 5
        default:
            return 1
    }
}

/**
 * Converts numeric value to rarity
 */
function mapScoreToRarity(score: number): Rarity {
    if (score < 1.5) return Rarity.Common
    if (score < 2.5) return Rarity.Uncommon
    if (score < 3.5) return Rarity.Rare
    if (score < 4.5) return Rarity.Epic
    return Rarity.Legendary
}

/**
 * Checks chance for getting a "Masterwork" item
 */
function checkForMasterwork(temperatureCelsius: number, materialAnalysis: MaterialAnalysis): boolean {
    // Base chance for a masterwork item
    let baseChance: number = 0.05 // 5% base chance

    // Check how ideal the temperature is for the dominant material
    const idealTemperature: number = getIdealTemperature(materialAnalysis.dominantMaterialType)
    const temperatureDifference: number = Math.abs(idealTemperature - temperatureCelsius)

    // The closer the temperature to ideal, the higher the chance for a masterwork item
    if (temperatureDifference < 5) {
        baseChance = 0.15 // 15% for nearly ideal temperature
    } else if (temperatureDifference < 15) {
        baseChance = 0.1 // 10% for good temperature
    }

    // Consider material rarities
    let rarityModifier: number = 0
    for (const materialId in materialAnalysis.allMaterials) {
        const material: Material = getMaterialById(materialId)
        const materialType: MaterialType = getMaterialTypeById(material.typeId)
        const weight: number = materialAnalysis.allMaterials[materialId] / 100

        rarityModifier += getRarityModifier(materialType.rarity) * weight
    }

    // Final chance for a masterwork item
    const finalChance: number = baseChance + rarityModifier

    // Check luck
    return Math.random() < finalChance
}

/**
 * Returns ideal temperature for material
 */
function getIdealTemperature(materialType: MaterialType): number {
    // Ideal temperature is the midpoint of the optimal range
    return (materialType.optimalTemperatureRange.min + materialType.optimalTemperatureRange.max) / 2
}

/**
 * Returns masterwork chance modifier based on rarity
 */
function getRarityModifier(rarity: Rarity): number {
    switch (rarity) {
        case Rarity.Common:
            return 0
        case Rarity.Uncommon:
            return 0.03
        case Rarity.Rare:
            return 0.06
        case Rarity.Epic:
            return 0.1
        case Rarity.Legendary:
            return 0.15
        default:
            return 0
    }
}

/**
 * Generates item name
 */
function generateItemName(itemVariant: ItemVariant, parts: ItemPart[], rarity: Rarity, isMasterwork: boolean): string {
    // Find main material in first (main) part
    const mainPart: ItemPart = parts[0]
    let mainMaterialName: string = 'Undefined'
    let maxPercentage: number = 0

    for (const composition of mainPart.composition) {
        if (composition.percentage > maxPercentage) {
            maxPercentage = composition.percentage

            const material: Material = getMaterialById(composition.materialId)
            const materialType: MaterialType = getMaterialTypeById(material.typeId)
            mainMaterialName = materialType.name
        }
    }

    // Get base name for item variant
    const variantName: string = itemVariant.name

    // Form name considering material
    let name: string = `${mainMaterialName} ${variantName}`

    // Add rarity prefix for rarer items
    if (rarity > Rarity.Common) {
        const rarityPrefix: string = getRarityPrefix(rarity)
        name = `${rarityPrefix} ${name}`
    }

    // Add "Masterwork" modifier if needed
    if (isMasterwork) {
        name = `Masterwork ${name}`
    }

    return name
}

/**
 * Returns text prefix for rarity
 */
function getRarityPrefix(rarity: Rarity): string {
    switch (rarity) {
        case Rarity.Uncommon:
            return 'Quality'
        case Rarity.Rare:
            return 'Superior'
        case Rarity.Epic:
            return 'Epic'
        case Rarity.Legendary:
            return 'Legendary'
        default:
            return ''
    }
}

/**
 * Calculates item price
 */
function calculatePrice(parts: ItemPart[], rarity: Rarity, isMasterwork: boolean): number {
    let basePrice: number = 0

    // Sum up the cost of all materials
    for (const part of parts) {
        for (const composition of part.composition) {
            const material: Material = getMaterialById(composition.materialId)
            const materialType: MaterialType = getMaterialTypeById(material.typeId)

            basePrice += materialType.basePrice * composition.percentage
        }
    }

    // Multiply by rarity multiplier
    const rarityMultiplier: number = getRarityPriceMultiplier(rarity)
    basePrice *= rarityMultiplier

    // Add bonus for "Masterwork" modifier
    if (isMasterwork) {
        basePrice *= 1.5 // Masterwork items are 1.5 times more expensive
    }

    // Round to the nearest integer
    return Math.round(basePrice)
}

/**
 * Returns price multiplier for rarity
 */
function getRarityPriceMultiplier(rarity: Rarity): number {
    switch (rarity) {
        case Rarity.Common:
            return 1.0
        case Rarity.Uncommon:
            return 2.0
        case Rarity.Rare:
            return 4.0
        case Rarity.Epic:
            return 8.0
        case Rarity.Legendary:
            return 16.0
        default:
            return 1.0
    }
}

/**
 * Helper data access functions (stubs)
 */

function getMaterialById(materialId: MaterialId): Material {
    return craftMaterialData.materials.get(materialId) || ({} as Material)
}

function getMaterialTypeById(typeId: MaterialTypeId): MaterialType {
    return craftMaterialData.materialTypes.get(typeId) || ({} as MaterialType)
}

function getPartById(partId: PartId): Part {
    // In a real implementation, this would query the data store
    return {} as Part
}

function getPartComposition(partId: PartId): MaterialComposition[] {
    // In a real implementation, this would query the data store
    return [] as MaterialComposition[]
}

function findPossibleVariants(partIds: PartId[]): ItemVariant[] {
    // In a real implementation, this would find variants requiring these parts
    return [] as ItemVariant[]
}

function getDefaultVariantForPart(partId: PartId): ItemVariant {
    // In a real implementation, this would find the default variant
    return {} as ItemVariant
}

function findBestVariant(variants: ItemVariant[], partIds: PartId[]): ItemVariant {
    // In a real implementation, this would choose the best variant
    return variants[0]
}

function getDefaultMaterialForPart(partId: PartId): Material {
    // In a real implementation, this would choose the default material
    return {} as Material
}

function generateUniqueId(): string {
    // In a real implementation, this would generate a UUID
    return Math.random().toString(36).substring(2, 15)
}
