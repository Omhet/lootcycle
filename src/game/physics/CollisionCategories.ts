/**
 * Collision categories for Matter.js physics
 * Each category is a bit flag that can be combined with others using bitwise operations
 * Used for filtering collisions between game objects
 */
export const CollisionCategories = {
  DEFAULT: 0x0001, // Default category for objects with no specific category
  JUNK: 0x0002, // Category for junk items that can be grabbed
  ENVIRONMENT: 0x0004, // Category for ground, walls, and other level boundaries
  CLAW: 0x0008, // Category for claw parts
  CAULDRON: 0x0010, // Category for cauldron and related items
  FURNACE: 0x0020, // Category for furnace and related items
  INTAKE: 0x0040, // Category for intake mechanism
  PLAYER: 0x0080, // Category for player-controlled objects (if needed)
};

/**
 * Collision masks for common game object types
 * These are presets that can be used directly in collisionFilter.mask
 */
export const CollisionMasks = {
  JUNK: CollisionCategories.JUNK | CollisionCategories.ENVIRONMENT | CollisionCategories.CLAW,
  CLAW: CollisionCategories.JUNK | CollisionCategories.ENVIRONMENT,
  ENVIRONMENT: CollisionCategories.JUNK | CollisionCategories.CLAW | CollisionCategories.PLAYER,
};
