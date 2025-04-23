import { RefObject, useEffect } from "react";
import { EventBus } from "../../game/EventBus";
import { IRefPhaserGame } from "../../game/PhaserGame";

/**
 * Hook for handling scene changes from EventBus using the phaserRef
 * @param phaserRef - Reference to the PhaserGame component
 */
export const useSceneChangeListener = (phaserRef: RefObject<IRefPhaserGame | null>) => {
  useEffect(() => {
    // Handler for scene changes triggered by the EventBus
    const handleChangeScene = (sceneKey: string) => {
      console.log("Changing scene via EventBus:", sceneKey);

      // Get the game instance from the phaserRef
      const game = phaserRef.current?.game;

      if (game && game.scene) {
        // Stop all currently active scenes except Boot and Preloader
        const activeScenes = game.scene.scenes.filter((scene: Phaser.Scene) => scene.scene.isActive() && !["Boot", "Preloader"].includes(scene.scene.key));

        // Put active scenes to sleep
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
      } else {
        console.warn("Cannot change scene: Phaser game instance not available");
      }
    };

    // Register event listener
    EventBus.on("changeScene", handleChangeScene);

    // Cleanup when component unmounts
    return () => {
      EventBus.off("changeScene", handleChangeScene);
    };
  }, [phaserRef]);
};
