import { useRef } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DayEndContainer } from "../containers/DayEndContainer/DayEndContainer";
import { DayStartContainer } from "../containers/DayStartContainer/DayStartContainer";
import { ShopContainer } from "../containers/ShopContainer/ShopContainer";
import { StallScreenContainer } from "../containers/StallScreenContainer/StallScreenContainer";
import { IRefPhaserGame, PhaserGame } from "../game/PhaserGame";
import { useGameFlowStore } from "../store/useGameFlowStore";
import { ScreenId } from "../store/useScreenStore";
import { useGameControls } from "./hooks/useGameControls";
import { useSceneChangeListener } from "./hooks/useSceneChangeListener";
import { useSceneManager } from "./hooks/useSceneManager";
import { useScreenEvents } from "./hooks/useScreenEvents";
import { useTestControls } from "./hooks/useTestControls";
import { useToastMessages } from "./hooks/useToastMessages";

function App() {
  // Reference to the PhaserGame component
  const phaserRef = useRef<IRefPhaserGame | null>(null);

  // Use custom hooks
  const { currentSceneKey, handleSceneChange } = useSceneManager();
  const { currentOpenedScreenId } = useScreenEvents();
  const { handlePlayClick, handleDownloadLootImagesClick, handleDownloadJunkImagesClick } = useGameControls(phaserRef);
  const { startGame } = useGameFlowStore();

  // Add scene change listener using phaserRef
  useSceneChangeListener(phaserRef);

  // Add test button for development
  useTestControls();

  // Initialize toast messages handler
  useToastMessages();

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
        // Will be implemented later
        return <div>New Loot Info Screen</div>;
      case ScreenId.None:
      default:
        return null;
    }
  };

  // Modified play button handler to use our new game flow system
  const handlePlay = () => {
    startGame();
    // handlePlayClick();
  };

  return (
    <div id="app">
      <PhaserGame ref={phaserRef} currentActiveScene={handleSceneChange} />
      {/* UI Container */}
      <div id="uiContainer">
        {/* Main Menu Container - Visible only when in MainMenu scene */}
        {currentSceneKey === "MainMenu" && (
          <div id="mainMenuContainer">
            <div id="menuButtonsContainer">
              <button className="button" onClick={handlePlay}>
                Play
              </button>
              <button className="button" onClick={handleDownloadLootImagesClick}>
                Download Loot Images
              </button>
              <button className="button" onClick={handleDownloadJunkImagesClick}>
                Download Junk Images
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
