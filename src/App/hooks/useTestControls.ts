import { useEffect } from "react";
import { ScreenId, useScreenStore } from "../../store/useScreenStore";

/**
 * Hook for handling test controls in development
 * This hook adds a test button to the DOM for testing screens
 */
export const useTestControls = () => {
  const openScreen = useScreenStore((state) => state.openScreen);

  useEffect(() => {
    // Create test button for Stall screen
    const testButton = document.createElement("button");
    testButton.textContent = "Test Stall Screen";
    testButton.style.position = "absolute";
    testButton.style.left = "10px";
    testButton.style.top = "10px";
    testButton.style.zIndex = "1000";
    testButton.onclick = () => openScreen(ScreenId.Stall);
    document.body.appendChild(testButton);

    // Cleanup on unmount
    return () => {
      document.body.removeChild(testButton);
    };
  }, [openScreen]);
};
