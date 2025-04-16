// ======= БАЗОВЫЕ ТИПЫ И ПЕРЕЧИСЛЕНИЯ =======

// Типизированные идентификаторы
type MaterialCategoryId = string
type MaterialTypeId = string
type MaterialId = string
type ItemCategoryId = string
type ItemTypeId = string
type ItemVariantId = string
type PartId = string
type JunkItemId = string
type LootItemId = string

// Системные перечисления
enum Rarity {
    Common,
    Uncommon,
    Rare,
    Epic,
    Legendary,
}

// Результаты операций
enum CraftingFailureReason {
    NoItems = 'NO_ITEMS',
    InvalidTemperature = 'INVALID_TEMPERATURE',
    IncompatibleMaterials = 'INCOMPATIBLE_MATERIALS',
    TooLowTemperature = 'TOO_LOW_TEMPERATURE',
    TooHighTemperature = 'TOO_HIGH_TEMPERATURE',
}

enum TemperatureFailureReason {
    TooLow = 'TOO_LOW_TEMPERATURE',
    TooHigh = 'TOO_HIGH_TEMPERATURE',
}

// ======= МАТЕРИАЛЫ =======

// Температурный диапазон для материалов
interface TemperatureRange {
    min: number // Минимальная температура в Цельсиях
    max: number // Максимальная температура в Цельсиях
}

// Категория материала
interface MaterialCategory {
    id: MaterialCategoryId
    name: string
}

// Тип материала
interface MaterialType {
    id: MaterialTypeId
    name: string
    category: MaterialCategory
    rarity: Rarity
    basePrice: number // Цена за 1% содержания в части
    heatValue: number // Тепло за 1 сек горения
    burnRate: number // Секунд горения для 1 юнита
    optimalTemperatureRange: TemperatureRange
}

// Конкретный материал
interface Material {
    id: MaterialId
    typeId: MaterialTypeId
}

// Композиция материалов в части предмета
interface MaterialComposition {
    materialId: MaterialId
    percentage: number // 0-100
}

// ======= ЧАСТИ ПРЕДМЕТОВ =======

// Часть предмета (шаблон)
interface Part {
    id: PartId
    name: string
    // Визуализация части
    assetPath: string
}

// Часть предмета с материалами
interface ItemPart {
    partId: PartId
    composition: MaterialComposition[]
}

// Мусор (входной материал для крафта)
interface JunkItem {
    id: JunkItemId
    partId: PartId
    stability: number // 1-5
}

// ======= ПРЕДМЕТЫ =======

// Категория предметов
interface ItemCategory {
    id: ItemCategoryId
    name: string
}

// Тип предмета
interface ItemType {
    id: ItemTypeId
    name: string
    categoryId: ItemCategoryId
}

// Вариант предмета
interface ItemVariant {
    id: ItemVariantId
    name: string
    typeId: ItemTypeId
    requiredParts: PartId[] // Список необходимых частей
}

// Готовый предмет лута (результат крафта)
interface LootItem {
    id: LootItemId
    name: string
    variantId: ItemVariantId
    rarity: Rarity
    parts: ItemPart[]
    isMasterwork: boolean
    price: number
}

// ======= РЕЗУЛЬТАТЫ АНАЛИЗА И ОПЕРАЦИЙ =======

// Результат анализа материалов
interface MaterialAnalysis {
    allMaterials: Record<MaterialId, number> // materialId -> процентное содержание
    dominantMaterialType: MaterialType
}

// Результат проверки совместимости с температурой
interface TemperatureCompatibilityResult {
    compatible: boolean
    reason?: TemperatureFailureReason
}

// Результат процесса крафтинга
interface CraftingResult {
    success: boolean
    reason?: CraftingFailureReason
    item?: LootItem
}

// ======= ДРУГИЕ СИСТЕМЫ =======

// Запись в книге рецептов (отдельная модель)
interface RecipeBookEntry {
    recipeId: string
    inputs: JunkItemId[]
    temperatureRange: TemperatureRange
    resultId: LootItemId
    discovered: boolean
}
