import { useRef } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { StallScreenContainer } from "../containers/StallScreenContainer/StallScreenContainer";
import { IRefPhaserGame, PhaserGame } from "../game/PhaserGame";
import { ScreenId } from "../store/useScreenStore";
import { useGameControls } from "./hooks/useGameControls";
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
        // Will be implemented later
        return <div>Day Start Screen</div>;
      case ScreenId.NewLootInfo:
        // Will be implemented later
        return <div>New Loot Info Screen</div>;
      case ScreenId.DayEnd:
        // Will be implemented later
        return <div>Day End Screen</div>;
      case ScreenId.Shop:
        // Will be implemented later
        return <div>Shop Screen</div>;
      case ScreenId.None:
      default:
        return null;
    }
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
              <button className="button" onClick={handlePlayClick}>
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
