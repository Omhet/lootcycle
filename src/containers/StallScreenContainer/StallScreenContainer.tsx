import { ScreenContainer } from "../../components/ScreenContainer/ScreenContainer";
import { Stall } from "../../components/Stall/Stall";
import { ItemCategoryId, LootItem, initialItemCategories, initialItemSubCategories } from "../../lib/craft/craftModel";
import { useScreenStore } from "../../store/useScreenStore";
import { useStallStore } from "../../store/useStallStore";

/**
 * Transforms LootItem[] from store into the format needed by the Stall component
 */
const transformLootItemsToStallFormat = (lootItems: LootItem[]) => {
  // Create a map to group items by their category
  const groupMap = new Map();

  lootItems.forEach((item) => {
    const categoryId = item.category;

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
      category: getSubCategoryName(item.subCategory),
      // These are mocked for now, will be updated later
      imageUrl: `/assets/craftedLootItems/${item.id}.png`,
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
 * Helper function to get category name
 */
const getCategoryName = (categoryId: ItemCategoryId): string => {
  const category = initialItemCategories.find((cat) => cat.id === categoryId);
  return category?.name || "Miscellaneous";
};

/**
 * Helper function to get subcategory name
 */
const getSubCategoryName = (subCategoryId: string): string => {
  const subCategory = initialItemSubCategories.find((subCat) => subCat.id === subCategoryId);
  return subCategory?.name || "Miscellaneous";
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
