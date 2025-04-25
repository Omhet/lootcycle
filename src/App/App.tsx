import { useEffect, useRef, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CurrentRecipeContainer } from "../containers/CurrentRecipe/CurrentRecipeContainer";
import { DayEndContainer } from "../containers/DayEndContainer/DayEndContainer";
import { DayStartContainer } from "../containers/DayStartContainer/DayStartContainer";
import { NewLootInfoContainer } from "../containers/NewLootInfoContainer/NewLootInfoContainer";
import { ShopContainer } from "../containers/ShopContainer/ShopContainer";
import { StallScreenContainer } from "../containers/StallScreenContainer/StallScreenContainer";
import { IRefPhaserGame, PhaserGame } from "../game/PhaserGame";
import { GameState, useGameFlowStore } from "../store/useGameFlowStore";
import { ScreenId } from "../store/useScreenStore";
import { useScreenEvents } from "./hooks/useScreenEvents";
import { useToastMessages } from "./hooks/useToastMessages";

function App() {
  const [currentSceneKey, setCurrentSceneKey] = useState<string | null>(null);

  // Reference to the PhaserGame component
  const phaserRef = useRef<IRefPhaserGame | null>(null);

  // Use custom hooks
  const { currentOpenedScreenId } = useScreenEvents();
  const { startGame, currentState } = useGameFlowStore();

  // Initialize toast messages handler
  useToastMessages();

  const handleSceneChange = (scene: Phaser.Scene) => {
    console.log("Current Scene: ", scene.scene.key);
    setCurrentSceneKey(scene.scene.key);
  };

  // Function to render the appropriate screen based on the current screen ID
  const renderCurrentScreen = () => {
    switch (currentOpenedScreenId) {
      case ScreenId.Stall:
        return <StallScreenContainer />;
      case ScreenId.DayStart:
        return <DayStartContainer />;
      case ScreenId.DayEnd:
        return <DayEndContainer />;
      case ScreenId.Shop:
        return <ShopContainer />;
      case ScreenId.NewLootInfo:
        return <NewLootInfoContainer />;
      case ScreenId.None:
      default:
        return null;
    }
  };

  // Modified play button handler to use our new game flow system
  const handlePlay = () => {
    startGame();
  };

  useEffect(() => {
    if (phaserRef.current && phaserRef.current.scene) {
      const scene = phaserRef.current.scene;
      if (typeof (scene as any).changeScene === "function") {
        console.log(currentState);
        if (currentState === GameState.DayInProgress) {
          (scene as unknown as any).changeScene("Game");
        } else {
          (scene as unknown as any).changeScene("Idle");
        }
      }
    }
  }, [currentState]);

  return (
    <div id="app">
      <PhaserGame ref={phaserRef} currentActiveScene={handleSceneChange} />
      {/* UI Container */}
      <div id="uiContainer">
        {currentSceneKey === "Game" && <CurrentRecipeContainer />}

        {/* Main Menu Container - Visible only when in MainMenu scene */}
        {currentSceneKey === "MainMenu" && (
          <div id="mainMenuContainer">
            <div id="menuButtonsContainer">
              <button className="button" onClick={handlePlay}>
                Play
              </button>
            </div>
          </div>
        )}

        {/* Render the current screen based on currentOpenedScreenId */}
        {currentOpenedScreenId !== ScreenId.None && <div className="screenContainer">{renderCurrentScreen()}</div>}
      </div>
      {/* Add ToastContainer for notifications */}
      <ToastContainer />
    </div>
  );
}

export default App;
