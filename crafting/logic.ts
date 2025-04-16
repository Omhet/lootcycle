/**
 * Основная функция крафта предметов
 * @param junkItems Массив предметов мусора
 * @param temperatureCelsius Текущая температура в печи (Цельсия)
 * @returns Результат крафтинга с созданным предметом или причиной неудачи
 */
function craftLootItem(junkItems: JunkItem[], temperatureCelsius: number): CraftingResult {
    // 1. Проверка на пустые входящие данные
    if (junkItems.length === 0) {
        return {
            success: false,
            reason: CraftingFailureReason.NoItems,
        }
    }

    // 2. Анализ входных материалов
    const materialAnalysis: MaterialAnalysis = analyzeInputMaterials(junkItems)

    // 3. Определение типа выходного предмета
    const outputItemVariant: ItemVariant = determineOutputItemVariant(junkItems)

    // 4. Проверка совместимости температуры с материалами
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

    // 5. Распределение материалов по частям выходного предмета
    const outputParts: ItemPart[] = distributePartsAndMaterials(outputItemVariant, materialAnalysis.allMaterials)

    // 6. Расчет редкости результата
    const outputRarity: Rarity = calculateOutputRarity(outputParts)

    // 7. Проверка шанса на "Искусный" модификатор
    const isMasterwork: boolean = checkForMasterwork(temperatureCelsius, materialAnalysis, outputItemVariant)

    // 8. Генерация названия
    const outputName: string = generateItemName(outputItemVariant, outputParts, outputRarity, isMasterwork)

    // 9. Расчет цены
    const outputPrice: number = calculatePrice(outputParts, outputRarity, isMasterwork)

    // 10. Создание итогового объекта
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
 * Анализирует входные предметы мусора для определения материального состава
 */
function analyzeInputMaterials(junkItems: JunkItem[]): MaterialAnalysis {
    const allMaterials: Record<MaterialId, number> = {}
    let totalWeight: number = 0

    // Для каждого предмета мусора получаем его часть и состав
    for (const junkItem of junkItems) {
        // Получаем состав материалов для данной части из базы данных/хранилища
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

    // Нормализуем к 100%
    for (const materialId in allMaterials) {
        allMaterials[materialId] = (allMaterials[materialId] / totalWeight) * 100
    }

    // Находим доминирующий материал
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
 * Определяет вариант предмета, который будет создан из предметов мусора
 */
function determineOutputItemVariant(junkItems: JunkItem[]): ItemVariant {
    // Собираем все части, которые есть в предметах мусора
    const partIds: PartId[] = junkItems.map((item) => item.partId)

    // Находим все варианты предметов, которые можно создать из этих частей
    const possibleVariants: ItemVariant[] = findPossibleVariants(partIds)

    // Если не нашли ни одного возможного варианта
    if (possibleVariants.length === 0) {
        // Используем дефолтный вариант, который соответствует типу первой части
        const defaultVariant: ItemVariant = getDefaultVariantForPart(junkItems[0].partId)
        return defaultVariant
    }

    // Если нашли несколько вариантов, выбираем самый лучший (наиболее полно использующий части)
    return findBestVariant(possibleVariants, partIds)
}

/**
 * Проверяет совместимость температуры с материалом
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
 * Распределяет материалы по частям выходного предмета
 */
function distributePartsAndMaterials(itemVariant: ItemVariant, materials: Record<MaterialId, number>): ItemPart[] {
    const outputParts: ItemPart[] = []

    // Получаем все необходимые части для этого варианта предмета
    const requiredParts: Part[] = itemVariant.requiredParts.map((partId) => getPartById(partId))

    // Для каждой требуемой части
    for (const part of requiredParts) {
        // Создаем новую композицию материалов для этой части
        const partComposition: MaterialComposition[] = []

        // Распределяем материалы пропорционально их общему весу
        // Учитываем только материалы, которые подходят для данной части
        let totalPartPercentage: number = 0

        for (const materialId in materials) {
            // Проверяем, подходит ли материал для этой части
            const material: Material = getMaterialById(materialId)
            const materialType: MaterialType = getMaterialTypeById(material.typeId)

            if (isCompatibleMaterialForPart(materialType, part)) {
                const percentage: number = materials[materialId]

                if (percentage > 1) {
                    // Игнорируем слишком малые доли
                    partComposition.push({
                        materialId: materialId,
                        percentage: percentage,
                    })

                    totalPartPercentage += percentage
                }
            }
        }

        // Если часть не получила материалов, добавляем дефолтный
        if (partComposition.length === 0 || totalPartPercentage < 100) {
            const defaultMaterial: Material = getDefaultMaterialForPart(part.id)

            // Если уже есть какие-то материалы, добавляем дефолтный до 100%
            if (partComposition.length > 0) {
                partComposition.push({
                    materialId: defaultMaterial.id,
                    percentage: 100 - totalPartPercentage,
                })
            } else {
                // Если материалов нет, используем только дефолтный
                partComposition.push({
                    materialId: defaultMaterial.id,
                    percentage: 100,
                })
            }
        } else if (totalPartPercentage > 100) {
            // Нормализуем проценты в композиции части до суммы 100%
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
 * Нормализует композицию материалов до суммы в 100%
 */
function normalizeComposition(composition: MaterialComposition[]): void {
    // Вычисляем общую сумму процентов
    let total: number = 0
    for (const comp of composition) {
        total += comp.percentage
    }

    // Нормализуем
    if (total > 0) {
        for (let i = 0; i < composition.length; i++) {
            composition[i].percentage = (composition[i].percentage / total) * 100
        }
    }
}

/**
 * Проверяет, подходит ли материал для части
 */
function isCompatibleMaterialForPart(materialType: MaterialType, part: Part): boolean {
    // В реальной реализации здесь будет проверка совместимости
    // Например, металл для лезвия меча, дерево для рукояти и т.д.
    // Для простоты пока считаем, что все материалы совместимы
    return true
}

/**
 * Вычисляет редкость выходного предмета на основе редкости материалов
 */
function calculateOutputRarity(parts: ItemPart[]): Rarity {
    let totalRarityScore: number = 0
    let totalWeight: number = 0

    // Для каждой части
    for (const part of parts) {
        // Для каждого материала в части
        for (const composition of part.composition) {
            const material: Material = getMaterialById(composition.materialId)
            const materialType: MaterialType = getMaterialTypeById(material.typeId)
            const rarityScore: number = getRarityScore(materialType.rarity)

            // Добавляем взвешенный вклад этого материала в общую редкость
            totalRarityScore += rarityScore * (composition.percentage / 100)
            totalWeight += composition.percentage / 100
        }
    }

    // Нормализуем итоговую оценку
    const finalRarityScore: number = totalRarityScore / totalWeight

    // Конвертируем числовую оценку обратно в перечисление Rarity
    return mapScoreToRarity(finalRarityScore)
}

/**
 * Преобразует редкость в числовое значение
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
 * Преобразует числовое значение в редкость
 */
function mapScoreToRarity(score: number): Rarity {
    if (score < 1.5) return Rarity.Common
    if (score < 2.5) return Rarity.Uncommon
    if (score < 3.5) return Rarity.Rare
    if (score < 4.5) return Rarity.Epic
    return Rarity.Legendary
}

/**
 * Проверяет шанс на получение "Искусного" предмета
 */
function checkForMasterwork(
    temperatureCelsius: number,
    materialAnalysis: MaterialAnalysis,
    itemVariant: ItemVariant
): boolean {
    // Базовый шанс на искусный предмет
    let baseChance: number = 0.05 // 5% базовый шанс

    // Проверяем, насколько идеальна температура для доминирующего материала
    const idealTemperature: number = getIdealTemperature(materialAnalysis.dominantMaterialType)
    const temperatureDifference: number = Math.abs(idealTemperature - temperatureCelsius)

    // Чем ближе температура к идеальной, тем выше шанс искусного предмета
    if (temperatureDifference < 5) {
        baseChance = 0.15 // 15% при почти идеальной температуре
    } else if (temperatureDifference < 15) {
        baseChance = 0.1 // 10% при хорошей температуре
    }

    // Учитываем редкость материалов
    let rarityModifier: number = 0
    for (const materialId in materialAnalysis.allMaterials) {
        const material: Material = getMaterialById(materialId)
        const materialType: MaterialType = getMaterialTypeById(material.typeId)
        const weight: number = materialAnalysis.allMaterials[materialId] / 100

        rarityModifier += getRarityModifier(materialType.rarity) * weight
    }

    // Финальный шанс на искусный предмет
    const finalChance: number = baseChance + rarityModifier

    // Проверяем удачу
    return Math.random() < finalChance
}

/**
 * Возвращает идеальную температуру для материала
 */
function getIdealTemperature(materialType: MaterialType): number {
    // Идеальная температура - середина оптимального диапазона
    return (materialType.optimalTemperatureRange.min + materialType.optimalTemperatureRange.max) / 2
}

/**
 * Возвращает модификатор шанса искусного предмета в зависимости от редкости
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
 * Генерирует название предмета
 */
function generateItemName(itemVariant: ItemVariant, parts: ItemPart[], rarity: Rarity, isMasterwork: boolean): string {
    // Найдем основной материал в первой (главной) части
    const mainPart: ItemPart = parts[0]
    let mainMaterialName: string = 'Неопределенный'
    let maxPercentage: number = 0

    for (const composition of mainPart.composition) {
        if (composition.percentage > maxPercentage) {
            maxPercentage = composition.percentage

            const material: Material = getMaterialById(composition.materialId)
            const materialType: MaterialType = getMaterialTypeById(material.typeId)
            mainMaterialName = materialType.name
        }
    }

    // Получаем базовое название варианта предмета
    const variantName: string = itemVariant.name

    // Формируем название с учетом материала
    let name: string = `${mainMaterialName} ${variantName}`

    // Добавляем префикс редкости для более редких предметов
    if (rarity > Rarity.Common) {
        const rarityPrefix: string = getRarityPrefix(rarity)
        name = `${rarityPrefix} ${name}`
    }

    // Добавляем "Искусный" модификатор если нужно
    if (isMasterwork) {
        name = `Искусный ${name}`
    }

    return name
}

/**
 * Возвращает текстовый префикс для редкости
 */
function getRarityPrefix(rarity: Rarity): string {
    switch (rarity) {
        case Rarity.Uncommon:
            return 'Качественный'
        case Rarity.Rare:
            return 'Превосходный'
        case Rarity.Epic:
            return 'Эпический'
        case Rarity.Legendary:
            return 'Легендарный'
        default:
            return ''
    }
}

/**
 * Рассчитывает стоимость предмета
 */
function calculatePrice(parts: ItemPart[], rarity: Rarity, isMasterwork: boolean): number {
    let basePrice: number = 0

    // Суммируем стоимость всех материалов
    for (const part of parts) {
        for (const composition of part.composition) {
            const material: Material = getMaterialById(composition.materialId)
            const materialType: MaterialType = getMaterialTypeById(material.typeId)

            basePrice += materialType.basePrice * composition.percentage
        }
    }

    // Умножаем на множитель редкости
    const rarityMultiplier: number = getRarityPriceMultiplier(rarity)
    basePrice *= rarityMultiplier

    // Добавляем бонус за "Искусный" модификатор
    if (isMasterwork) {
        basePrice *= 1.5 // Искусные предметы стоят в 1.5 раза дороже
    }

    // Округляем до целого числа
    return Math.round(basePrice)
}

/**
 * Возвращает ценовой множитель для редкости
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
 * Вспомогательные функции доступа к данным (заглушки)
 */

function getMaterialById(materialId: MaterialId): Material {
    // В реальной реализации здесь был бы запрос к хранилищу данных
    return {} as Material
}

function getMaterialTypeById(typeId: MaterialTypeId): MaterialType {
    // В реальной реализации здесь был бы запрос к хранилищу данных
    return {} as MaterialType
}

function getPartById(partId: PartId): Part {
    // В реальной реализации здесь был бы запрос к хранилищу данных
    return {} as Part
}

function getPartComposition(partId: PartId): MaterialComposition[] {
    // В реальной реализации здесь был бы запрос к хранилищу данных
    return [] as MaterialComposition[]
}

function findPossibleVariants(partIds: PartId[]): ItemVariant[] {
    // В реальной реализации здесь был бы поиск вариантов, требующих эти части
    return [] as ItemVariant[]
}

function getDefaultVariantForPart(partId: PartId): ItemVariant {
    // В реальной реализации здесь был бы поиск варианта по умолчанию
    return {} as ItemVariant
}

function findBestVariant(variants: ItemVariant[], partIds: PartId[]): ItemVariant {
    // В реальной реализации здесь был бы выбор лучшего варианта
    return variants[0]
}

function getDefaultMaterialForPart(partId: PartId): Material {
    // В реальной реализации здесь был бы выбор материала по умолчанию
    return {} as Material
}

function generateUniqueId(): string {
    // В реальной реализации здесь была бы генерация UUID
    return Math.random().toString(36).substring(2, 15)
}
