import { ScreenContainer } from "../../components/ScreenContainer/ScreenContainer";
import { Stall } from "../../components/Stall/Stall";
import { ItemCategoryId, LootItem } from "../../lib/craft/craftModel";
import { useScreenStore } from "../../store/useScreenStore";
import { useStallStore } from "../../store/useStallStore";

/**
 * Transforms LootItem[] from store into the format needed by the Stall component
 */
const transformLootItemsToStallFormat = (lootItems: LootItem[]) => {
  // Create a map to group items by their category
  const groupMap = new Map();

  lootItems.forEach((item) => {
    // Extract category from recipeId or use a default
    const categoryId = getCategoryFromRecipeId(item.recipeId);

    // Create group if it doesn't exist
    if (!groupMap.has(categoryId)) {
      const groupName = getCategoryName(categoryId);
      groupMap.set(categoryId, {
        name: groupName,
        items: [],
      });
    }

    // Add item to appropriate group
    groupMap.get(categoryId).items.push({
      id: item.id,
      name: item.name,
      category: getSubCategoryName(item.recipeId),
      // These are mocked for now, will be updated later
      imageUrl: "/assets/game/details/loot-details-sprites.png",
      price: item.sellPrice,
      lootDetails: item.details.map((detailId) => ({
        lootDetailName: `Detail ${detailId}`,
        junkImageUrl: "/assets/game/details/junk-details-sprites.png",
      })),
    });
  });

  // Convert map to array
  return Array.from(groupMap.values());
};

/**
 * Helper function to get category from recipeId
 */
const getCategoryFromRecipeId = (recipeId: string): ItemCategoryId => {
  // For now just return Weapon as default
  // This will be improved when we have proper mapping
  return ItemCategoryId.Weapon;
};

/**
 * Helper function to get category name
 */
const getCategoryName = (categoryId: ItemCategoryId): string => {
  switch (categoryId) {
    case ItemCategoryId.Weapon:
      return "Weapons";
    default:
      return "Miscellaneous";
  }
};

/**
 * Helper function to get subcategory name from recipeId
 */
const getSubCategoryName = (recipeId: string): string => {
  // This is a placeholder - in the future we'll have a proper mapping
  if (recipeId.includes("sword")) {
    return "One-handed Blade";
  }
  return "Miscellaneous";
};

export const StallScreenContainer = () => {
  const closeScreen = useScreenStore((state) => state.closeScreen);
  const { craftedLootItems, clearCraftedLootItems } = useStallStore();

  // If no crafted items, use a fallback item for development
  const items = craftedLootItems || [];

  const stallGroups = transformLootItemsToStallFormat(items);

  const handleSellAndClose = () => {
    // Clear the crafted items after selling
    clearCraftedLootItems();

    // Close the screen
    closeScreen();
  };

  const handleClose = () => {
    // Just close the screen without selling anything
    closeScreen();
  };

  return (
    <ScreenContainer>
      <Stall groups={stallGroups} onSellAndClose={handleSellAndClose} onClose={handleClose} />
    </ScreenContainer>
  );
};
