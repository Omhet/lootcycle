import { NewLootInfo } from "../../components/NewLootInfo/NewLootInfo";
import { ScreenContainer } from "../../components/ScreenContainer/ScreenContainer";
import { EventBus } from "../../game/EventBus";
import { lootConfig } from "../../lib/craft/config";
import { useCraftStore } from "../../store/useCraftStore";
import { useScreenStore } from "../../store/useScreenStore";

/**
 * Container for the NewLootInfo component
 * Connects to the craft store and handles the display logic
 */
export const NewLootInfoContainer = () => {
  const { lastCraftedItem } = useCraftStore();
  const closeScreen = useScreenStore((state) => state.closeScreen);

  // If no item, return null (shouldn't happen with proper flow)
  if (!lastCraftedItem) {
    return null;
  }

  // Transform LootItem data into the format needed by NewLootInfo
  const details = lastCraftedItem.details.map((detailId) => {
    // Find the detail in the loot config
    const detailArray = lootConfig.lootDetails[detailId] || [];
    const detail = detailArray.length > 0 ? detailArray[0] : null;

    // Get the junk piece used for this specific detail using detailToJunkMap
    let junkPieceName: string | undefined = undefined;

    // Use the map to find which junk piece was actually used for this detail
    const junkPieceId = lastCraftedItem.detailToJunkMap[detailId];
    if (junkPieceId) {
      const junkArray = lootConfig.junkPieces[junkPieceId] || [];
      if (junkArray.length > 0) {
        junkPieceName = junkArray[0].name;
      }
    }

    return {
      lootDetailName: detail ? detail.name : `Detail ${detailId}`,
      junkImageUrl: "/assets/game/details/junk-details-sprites.png",
      junkPieceName,
    };
  });

  // Get subcategory name
  const getSubCategoryName = (_subCategoryId: string): string => {
    const subCategory = lastCraftedItem.subCategory ? { id: lastCraftedItem.subCategory, name: lastCraftedItem.subCategory } : null;
    return subCategory?.name || "Miscellaneous";
  };

  // Handle close button click
  const handleClose = () => {
    // Close the NewLootInfo screen
    closeScreen();

    // Emit event to clear the displayed item in the game
    EventBus.emit("crafting-success-inspect-finish");
  };

  return (
    <ScreenContainer>
      <NewLootInfo name={lastCraftedItem.name} category={getSubCategoryName(lastCraftedItem.subCategory)} details={details} onClose={handleClose} />
    </ScreenContainer>
  );
};
