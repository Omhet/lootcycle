import { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { StallScreenContainer } from "./containers/StallScreenContainer/StallScreenContainer";
import { EventBus } from "./game/EventBus";
import { IRefPhaserGame, PhaserGame } from "./game/PhaserGame";
import { MainMenu } from "./game/scenes/MainMenu";
import { CraftingFailureReason } from "./lib/craft/craftModel";
import { ScreenId, useScreenStore } from "./store/useScreenStore";

function App() {
  // References to the PhaserGame component (game and scene are exposed)
  const phaserRef = useRef<IRefPhaserGame | null>(null);
  // State to hold the current scene key
  const [currentSceneKey, setCurrentSceneKey] = useState<string | null>(null);

  // Get current opened screen from Zustand store
  const currentOpenedScreenId = useScreenStore((state) => state.currentOpenedScreenId);
  const openScreen = useScreenStore((state) => state.openScreen);
  const closeScreen = useScreenStore((state) => state.closeScreen);

  // Event emitted from the PhaserGame component
  const currentScene = (scene: Phaser.Scene) => {
    console.log("Current Scene: ", scene.scene.key);
    setCurrentSceneKey(scene.scene.key); // Update state with scene key
  };

  // Set up event listeners for crafting failures and screen management
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

    // Handle open screen requests from the game
    const handleOpenScreen = (screenId: string) => {
      console.log(`Opening screen: ${screenId}`);
      // Map the string screen ID to our enum
      switch (screenId.toLowerCase()) {
        case "stall":
          openScreen(ScreenId.Stall);
          break;
        case "daystart":
          openScreen(ScreenId.DayStart);
          break;
        case "newlootinfo":
          openScreen(ScreenId.NewLootInfo);
          break;
        case "dayend":
          openScreen(ScreenId.DayEnd);
          break;
        case "shop":
          openScreen(ScreenId.Shop);
          break;
        default:
          console.warn(`Unknown screen ID: ${screenId}`);
      }
    };

    // Handle toggle screen requests from the game
    const handleToggleScreen = (screenId: string) => {
      console.log(`Toggling screen: ${screenId}`);

      // Convert string to enum
      let targetScreenId: ScreenId;
      switch (screenId.toLowerCase()) {
        case "stall":
          targetScreenId = ScreenId.Stall;
          break;
        case "daystart":
          targetScreenId = ScreenId.DayStart;
          break;
        case "newlootinfo":
          targetScreenId = ScreenId.NewLootInfo;
          break;
        case "dayend":
          targetScreenId = ScreenId.DayEnd;
          break;
        case "shop":
          targetScreenId = ScreenId.Shop;
          break;
        default:
          console.warn(`Unknown screen ID: ${screenId}`);
          return;
      }

      // If the screen is already open, close it; otherwise open it
      if (currentOpenedScreenId === targetScreenId) {
        closeScreen();
      } else {
        openScreen(targetScreenId);
      }
    };

    // Handle close screen requests (from ESC key)
    const handleCloseScreen = () => {
      console.log("Closing current screen");
      closeScreen();
    };

    // Subscribe to the events
    EventBus.on("crafting-failure", handleCraftingFailure);
    EventBus.on("open-screen", handleOpenScreen);
    EventBus.on("toggle-screen", handleToggleScreen);
    EventBus.on("close-screen", handleCloseScreen);

    // Clean up the event listeners when component unmounts
    return () => {
      EventBus.off("crafting-failure", handleCraftingFailure);
      EventBus.off("open-screen", handleOpenScreen);
      EventBus.off("toggle-screen", handleToggleScreen);
      EventBus.off("close-screen", handleCloseScreen);
    };
  }, [openScreen, closeScreen, currentOpenedScreenId]);

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

  // For testing purposes - open Stall screen
  const openStallForTesting = useScreenStore((state) => state.openScreen);
  useEffect(() => {
    // Will be removed later when proper game flow is implemented
    const testButton = document.createElement("button");
    testButton.textContent = "Test Stall Screen";
    testButton.style.position = "absolute";
    testButton.style.left = "10px";
    testButton.style.top = "10px";
    testButton.style.zIndex = "1000";
    testButton.onclick = () => openStallForTesting(ScreenId.Stall);
    document.body.appendChild(testButton);

    return () => {
      document.body.removeChild(testButton);
    };
  }, [openStallForTesting]);

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

        {/* Render the current screen based on currentOpenedScreenId */}
        {currentOpenedScreenId !== ScreenId.None && <div className="screenContainer">{renderCurrentScreen()}</div>}
      </div>
      {/* Add ToastContainer for notifications */}
      <ToastContainer />
    </div>
  );
}

export default App;
