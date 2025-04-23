import { useEffect } from "react";
import { EventBus } from "../../game/EventBus";
import { ScreenId, useScreenStore } from "../../store/useScreenStore";

/**
 * Hook for handling all screen-related events from the EventBus
 */
export const useScreenEvents = () => {
  // Get screen management functions from store using separate selectors to avoid infinite loops
  const currentOpenedScreenId = useScreenStore((state) => state.currentOpenedScreenId);
  const openScreen = useScreenStore((state) => state.openScreen);
  const closeScreen = useScreenStore((state) => state.closeScreen);

  useEffect(() => {
    // Convert string screen ID to enum
    const getScreenIdFromString = (screenId: string): ScreenId | null => {
      switch (screenId.toLowerCase()) {
        case "stall":
          return ScreenId.Stall;
        case "daystart":
          return ScreenId.DayStart;
        case "newlootinfo":
          return ScreenId.NewLootInfo;
        case "dayend":
          return ScreenId.DayEnd;
        case "shop":
          return ScreenId.Shop;
        default:
          console.warn(`Unknown screen ID: ${screenId}`);
          return null;
      }
    };

    // Handle open screen requests
    const handleOpenScreen = (screenId: string) => {
      console.log(`Opening screen: ${screenId}`);
      const targetScreenId = getScreenIdFromString(screenId);
      if (targetScreenId) {
        openScreen(targetScreenId);
      }
    };

    // Handle toggle screen requests
    const handleToggleScreen = (screenId: string) => {
      console.log(`Toggling screen: ${screenId}`);
      const targetScreenId = getScreenIdFromString(screenId);

      if (!targetScreenId) return;

      // If screen is already open, close it; otherwise open it
      if (currentOpenedScreenId === targetScreenId) {
        closeScreen();
      } else {
        openScreen(targetScreenId);
      }
    };

    // Handle close screen requests
    const handleCloseScreen = () => {
      console.log("Closing current screen");
      closeScreen();
    };

    // Subscribe to events
    EventBus.on("open-screen", handleOpenScreen);
    EventBus.on("toggle-screen", handleToggleScreen);
    EventBus.on("close-screen", handleCloseScreen);

    // Cleanup on unmount
    return () => {
      EventBus.off("open-screen", handleOpenScreen);
      EventBus.off("toggle-screen", handleToggleScreen);
      EventBus.off("close-screen", handleCloseScreen);
    };
  }, [openScreen, closeScreen, currentOpenedScreenId]);

  return {
    currentOpenedScreenId,
  };
};
