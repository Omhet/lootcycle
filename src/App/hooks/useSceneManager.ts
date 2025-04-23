import { useState } from "react";

/**
 * Hook for handling scene management
 * @returns Current scene key and scene change callback
 */
export const useSceneManager = () => {
  const [currentSceneKey, setCurrentSceneKey] = useState<string | null>(null);

  // Event handler for scene changes
  const handleSceneChange = (scene: Phaser.Scene) => {
    console.log("Current Scene: ", scene.scene.key);
    setCurrentSceneKey(scene.scene.key);
  };

  return {
    currentSceneKey,
    handleSceneChange,
  };
};
