/**
 * Apply custom overrides to an object
 * @param item The base object
 * @param overrides Optional overrides to apply
 * @returns The object with overrides applied
 */
export function applyOverrides<T>(item: T, overrides: Partial<T> | undefined): T {
    if (!overrides) return item
    return { ...item, ...overrides }
}
