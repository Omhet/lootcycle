import { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { EventBus } from "./game/EventBus";
import { IRefPhaserGame, PhaserGame } from "./game/PhaserGame";
import { MainMenu } from "./game/scenes/MainMenu";
import { CraftingFailureReason } from "./lib/craft/craftModel";

function App() {
  // The sprite can only be moved in the MainMenu Scene

  // References to the PhaserGame component (game and scene are exposed)
  const phaserRef = useRef<IRefPhaserGame | null>(null);
  // State to hold the current scene key
  const [currentSceneKey, setCurrentSceneKey] = useState<string | null>(null);

  // Event emitted from the PhaserGame component
  const currentScene = (scene: Phaser.Scene) => {
    console.log("Current Scene: ", scene.scene.key);
    setCurrentSceneKey(scene.scene.key); // Update state with scene key
  };

  // Set up event listeners for crafting failures
  useEffect(() => {
    const handleCraftingFailure = (failure: { reason: CraftingFailureReason; message?: string }) => {
      // Create user-friendly messages based on failure reasons
      let toastMessage = failure.message || "Crafting failed";

      // Show the toast notification
      toast.error(toastMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    };

    // Subscribe to the crafting-failure event
    EventBus.on("crafting-failure", handleCraftingFailure);

    // Clean up the event listener when component unmounts
    return () => {
      EventBus.off("crafting-failure", handleCraftingFailure);
    };
  }, []);

  // Function to handle the Play button click
  const handlePlayClick = () => {
    if (phaserRef.current && phaserRef.current.scene) {
      const scene = phaserRef.current.scene;
      if (
        scene.scene.key === "MainMenu" &&
        typeof (scene as any).startGame === "function" // Check if method exists before casting
      ) {
        // Cast safely after check
        (scene as unknown as MainMenu).startGame();
      }
    }
  };

  // Function to handle the Download Loot Images button click
  const handleDownloadLootImagesClick = () => {
    if (phaserRef.current && phaserRef.current.scene) {
      const scene = phaserRef.current.scene;
      if (
        scene.scene.key === "MainMenu" &&
        typeof (scene as any).downloadRecipeImages === "function" // Check if method exists before casting
      ) {
        // Cast safely after check
        (scene as unknown as MainMenu).downloadRecipeImages();
      } else {
        console.warn("Download function not available on the current scene or scene is not MainMenu.");
      }
    }
  };

  return (
    <div id="app">
      <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
      {/* UI Container */}
      <div id="uiContainer">
        {/* Main Menu Container - Visible only when in MainMenu scene */}
        {currentSceneKey === "MainMenu" && (
          <div id="mainMenuContainer">
            {/* Can add title or other elements here */}
            <div id="menuButtonsContainer">
              <button className="button" onClick={handlePlayClick}>
                Play
              </button>
              {/* Add the new download button */}
              <button
                className="button"
                onClick={handleDownloadLootImagesClick} // Attach the new handler
              >
                Download Loot Images
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Add ToastContainer for notifications */}
      <ToastContainer />
    </div>
  );
}

export default App;
