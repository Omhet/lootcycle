import { useEffect, useState } from "react";
import { EventBus } from "../../game/EventBus";

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

  useEffect(() => {
    // Listen for changeScene events from the EventBus
    const handleChangeScene = (sceneKey: string) => {
      console.log("Changing scene via EventBus:", sceneKey);

      // If a Phaser game instance is available, start the requested scene
      const game = (window as any).game;
      if (game && game.scene) {
        // Stop all currently active scenes except Boot and Preloader
        const activeScenes = game.scene.scenes.filter((scene: Phaser.Scene) => scene.scene.isActive() && !["Boot", "Preloader"].includes(scene.scene.key));

        activeScenes.forEach((scene: Phaser.Scene) => {
          game.scene.sleep(scene.scene.key);
        });

        // Start the new scene if it exists and isn't already active
        if (game.scene.getScene(sceneKey) && !game.scene.isActive(sceneKey)) {
          game.scene.start(sceneKey);
        } else if (game.scene.getScene(sceneKey)) {
          game.scene.wake(sceneKey);
        } else {
          console.warn(`Scene ${sceneKey} does not exist`);
        }
      }
    };

    // Register the event listener
    EventBus.on("changeScene", handleChangeScene);

    // Cleanup function to remove the event listener
    return () => {
      EventBus.off("changeScene", handleChangeScene);
    };
  }, []);

  return {
    currentSceneKey,
    handleSceneChange,
  };
};
