import { NewLootInfo } from "../../components/NewLootInfo/NewLootInfo";
import { ScreenContainer } from "../../components/ScreenContainer/ScreenContainer";
import { EventBus } from "../../game/EventBus";
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

  // Handle close button click
  const handleClose = () => {
    // Close the NewLootInfo screen
    closeScreen();

    // Emit event to clear the displayed item in the game
    EventBus.emit("crafting-success-inspect-finish");
  };

  return (
    <ScreenContainer>
      <NewLootInfo name={lastCraftedItem.name} onClose={handleClose} />
    </ScreenContainer>
  );
};
