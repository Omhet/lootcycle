import { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { EventBus } from "./game/EventBus";
import { IRefPhaserGame, PhaserGame } from "./game/PhaserGame";
import { MainMenu } from "./game/scenes/MainMenu";

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

    // Subscribe to the crafting-failure event
    EventBus.on("crafting-failure", handleCraftingFailure);

    // Clean up the event listener when component unmounts
    return () => {
      EventBus.off("crafting-failure", handleCraftingFailure);
    };
  }, []);

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
                            <button
                                className="button"
                                onClick={handlePlayClick}
                            >
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
        </div>
    );
}

export default App;
