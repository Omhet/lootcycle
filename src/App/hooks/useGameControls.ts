import { MutableRefObject } from "react";
import { IRefPhaserGame } from "../../game/PhaserGame";
import { MainMenu } from "../../game/scenes/MainMenu";

/**
 * Hook for handling game-related controls
 * @param phaserRef Reference to the PhaserGame component
 */
export const useGameControls = (phaserRef: MutableRefObject<IRefPhaserGame | null>) => {
  // Handle Download Loot Images button click
  const handleDownloadLootImagesClick = () => {
    if (phaserRef.current && phaserRef.current.scene) {
      const scene = phaserRef.current.scene;
      if (scene.scene.key === "MainMenu" && typeof (scene as any).downloadRecipeImages === "function") {
        (scene as unknown as MainMenu).downloadRecipeImages();
      } else {
        console.warn("Download function not available on the current scene or scene is not MainMenu.");
      }
    }
  };

  // Handle Download Junk Images button click
  const handleDownloadJunkImagesClick = () => {
    if (phaserRef.current && phaserRef.current.scene) {
      const scene = phaserRef.current.scene;
      if (scene.scene.key === "MainMenu" && typeof (scene as any).downloadJunkImages === "function") {
        (scene as unknown as MainMenu).downloadJunkImages();
      } else {
        console.warn("Download junk images function not available on the current scene or scene is not MainMenu.");
      }
    }
  };

  return {
    handleDownloadLootImagesClick,
    handleDownloadJunkImagesClick,
  };
};
