import { useRef, useState } from "react";
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

    // Function to handle the Play button click
    const handlePlayClick = () => {
        if (phaserRef.current) {
            const scene = phaserRef.current.scene as MainMenu; // Cast to MainMenu
            if (
                scene &&
                scene.scene.key === "MainMenu" &&
                typeof scene.startGame === "function"
            ) {
                scene.startGame(); // Call startGame method on the MainMenu scene instance
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
                            <button
                                className="button"
                                onClick={handlePlayClick}
                            >
                                Play
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
