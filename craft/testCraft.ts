import {
    craftLootItem,
    generateAllLootObjectsInGame,
    lootAtomConfig,
    LootItem,
    LootItemTemplate,
    lootItemTemplateConfig,
    LootItemTemplateType,
    LootJunkItem,
    lootMoleculeConfig,
} from './craftModel.js'
import {
    formatMaterialComposition,
    getAtomReadableName,
    getMoleculeIdFromPartId,
    getMoleculeReadableName,
    getTemplateIdFromItemId,
    getTemplateReadableName,
} from './craftUtils.js'

/**
 * Randomly select junk items from the available pool
 * and apply random degradation levels to them
 *
 * @param availableJunkItems Pool of all available junk items
 * @param minCount Minimum number of items to select
 * @param maxCount Maximum number of items to select
 * @returns Array of randomly selected junk items with random degradation (may contain duplicates)
 */
const getRandomJunkItems = (
    availableJunkItems: LootJunkItem[],
    minCount: number = 3,
    maxCount: number = 10
): LootJunkItem[] => {
    // Determine a random quantity between min and max
    const count = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount
    const result: LootJunkItem[] = []

    // Randomly select items from the available pool (allowing duplicates)
    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * availableJunkItems.length)

        // Create a deep copy of the selected item
        const selectedItem = { ...availableJunkItems[randomIndex] }

        // Apply random degradation between 0 and 100
        selectedItem.degradation = Math.floor(Math.random() * 101)

        result.push(selectedItem)
    }

    return result
}

/**
 * Test the crafting system with different inputs
 */
const testCraftingSystem = () => {
    console.log('=== CRAFTING SYSTEM TEST ===')

    // Generate all game objects
    console.log('\nGenerating loot objects...')
    const { lootItems, lootParts, lootDetails, lootJunkItems } = generateAllLootObjectsInGame(
        lootItemTemplateConfig,
        lootMoleculeConfig,
        lootAtomConfig
    )

    // Log generation stats
    console.log(`Generated ${Object.keys(lootItems).length} loot items`)
    console.log(`Generated ${Object.keys(lootParts).length} loot parts`)
    console.log(`Generated ${Object.keys(lootDetails).length} loot details`)
    console.log(`Generated ${Object.keys(lootJunkItems).length} junk items`)

    // Get templates for testing
    const swordTemplate = lootItemTemplateConfig[LootItemTemplateType.Sword][0]

    // Get available junk items
    const availableJunkItems = Object.values(lootJunkItems)

    // Test case 1: Sword crafting with random junk items and optimal temperature
    console.log('\n=== TEST CASE 1: SWORD WITH OPTIMAL TEMPERATURE ===')
    testCraftWithParams({
        template: swordTemplate,
        junkItems: getRandomJunkItems(availableJunkItems, 5, 10),
        temperature: 50, // Middle of common temperature range
        lootItems,
        lootParts,
    })

    // Test case 3: Sword crafting with different random junk items and higher temperature
    console.log('\n=== TEST CASE 3: SWORD WITH HIGHER TEMPERATURE ===')
    testCraftWithParams({
        template: swordTemplate,
        junkItems: getRandomJunkItems(availableJunkItems, 3, 8),
        temperature: 70,
        lootItems,
        lootParts,
    })
}

/**
 * Helper function to run a craft test with given parameters
 */
const testCraftWithParams = ({
    template,
    junkItems,
    temperature,
    lootItems,
    lootParts,
}: {
    template: LootItemTemplate
    junkItems: LootJunkItem[]
    temperature: number
    lootItems: Record<string, LootItem>
    lootParts: Record<string, any>
}) => {
    // Log inputs
    console.log('\nCrafting Inputs:')
    console.log(`- Template: ${template.name} (${template.id})`)
    console.log(`- Junk Items: ${junkItems.length} items`)
    if (junkItems.length > 0) {
        console.log('  Items:')
        // Log all junk items without slicing
        junkItems.forEach((item) => {
            const readableName = getAtomReadableName(item.atomId)
            console.log(
                `   - ${readableName} [${item.rarity}] (Degradation: ${
                    item.degradation
                }%) (Materials: ${formatMaterialComposition(item.materialComposition)})`
            )
        })
    }
    console.log(`- Temperature: ${temperature}°C`)

    // Perform crafting
    console.log('\nCrafting...')
    const result = craftLootItem({
        lootItemTemplate: template,
        availableJunkItems: junkItems,
        temperature,
        config: { lootItems, lootParts },
    })

    // Log results
    console.log('\nCrafting Result:')
    console.log(`- Success: ${result.success}`)

    if (result.success && result.item) {
        // Show readable item name instead of just ID
        const templateId = getTemplateIdFromItemId(result.item.id)
        const templateName = getTemplateReadableName(templateId)

        console.log(`- Created Item: ${templateName} [${result.item.rarity}]`)

        // Show readable part names with their subparts and material composition
        if (result.item.subparts.length > 0) {
            console.log('  Parts:')
            result.item.subparts.forEach((partId) => {
                const part = lootParts[partId]
                const moleculeId = getMoleculeIdFromPartId(partId)
                const moleculeName = getMoleculeReadableName(moleculeId)

                // Add material composition for this part
                console.log(`   - ${moleculeName} - Materials: ${formatMaterialComposition(part.materialComposition)}`)

                // List all subparts (atoms) in this part
                if (part && part.subparts && part.subparts.length > 0) {
                    console.log('     Details:')
                    part.subparts.forEach((atomId) => {
                        const atomName = getAtomReadableName(atomId)
                        console.log(`       • ${atomName}`)
                    })
                }
            })
        }

        console.log(`- Overall Material Composition: ${formatMaterialComposition(result.item.materialComposition)}`)
        console.log(`- Quality: ${result.quality!.toFixed(2)}%`)
        console.log(`- Sell Price: ${result.sellPrice} coins`)
        console.log(
            `- Temperature Range: ${result.item.temperatureRange.min}°C - ${result.item.temperatureRange.max}°C`
        )
        console.log(
            `- Master Range: ${result.item.masterQualityTemperatureRange.min}°C - ${result.item.masterQualityTemperatureRange.max}°C`
        )
    } else if (!result.success && result.failure) {
        console.log(`- Failure Reason: ${result.failure.reason}`)
        console.log('  Try with different junk items or adjust temperature.')
    }
}

// Run the test
testCraftingSystem()
