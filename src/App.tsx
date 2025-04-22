import { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { EventBus } from "./game/EventBus";
import { IRefPhaserGame, PhaserGame } from "./game/PhaserGame";
import { MainMenu } from "./game/scenes/MainMenu";
import { TestModalContainer } from "./components/TestModalContainer/TestModalContainer";
import { NewLootInfo } from "./components/NewLootInfo/NewLootInfo";
import { Stall } from "./components/Stall/Stall";
import { DayResults } from "./components/DayResults/DayResults";
import { Shop } from "./components/Shop/Shop";

function App() {
  // The sprite can only be moved in the MainMenu Scene

  // References to the PhaserGame component (game and scene are exposed)
  const phaserRef = useRef<IRefPhaserGame | null>(null);
  // State to hold the current scene key
  const [currentSceneKey, setCurrentSceneKey] = useState<string | null>(null);

    // State to control the visibility of the test modal. Remove this in the final version.
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);

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
                            <button
                                className="button"
                                onClick={() => setIsTestModalOpen(true)} // Open the test modal
                            >
                                Open Modal
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {isTestModalOpen && (
                <TestModalContainer isOpen={isTestModalOpen}>
                    <Shop
                        recipes={[
                            {
                                name: "swords",
                                items: [
                                    {
                                        id: "recipe1",
                                        name: "sword",
                                        category: "sword",
                                        description:
                                            "A basic sword, nothing special.",
                                        imageUrl:
                                            "https://example.com/sword.png",
                                        price: 10,
                                        priceForCraftedBaseItem: 5,
                                        alreadyBought: true,
                                    },
                                    {
                                        id: "recipe2",
                                        name: "katana",
                                        category: "sword",
                                        description:
                                            "A sharp katana, perfect for slicing.",

                                        imageUrl:
                                            "https://example.com/sword.png",
                                        price: 30,
                                        priceForCraftedBaseItem: 10,
                                        alreadyBought: false,
                                    },
                                ],
                            },
                            {
                                name: "axes",
                                items: [
                                    {
                                        id: "recipe3",
                                        name: "battle axe",
                                        category: "axe",
                                        description:
                                            "A heavy battle axe, great for combat.",

                                        imageUrl:
                                            "https://example.com/sword.png",
                                        price: 10,
                                        priceForCraftedBaseItem: 5,
                                        alreadyBought: false,
                                    },
                                    {
                                        id: "recipe4",
                                        name: "throwing axe",
                                        category: "axe",
                                        description:
                                            "A lightweight axe for throwing.",

                                        imageUrl:
                                            "https://example.com/sword.png",
                                        price: 30,
                                        priceForCraftedBaseItem: 10,
                                        alreadyBought: false,
                                    },
                                ],
                            },
                        ]}
                        upgrades={[
                            {
                                id: "upgrade1",
                                name: "Upgrade 1",
                                imageUrl: "https://example.com/sword.png",
                                price: 10,
                                description:
                                    "An upgrade that improves your crafting speed.",
                            },
                            {
                                id: "upgrade2",
                                name: "Upgrade 2",
                                imageUrl: "https://example.com/sword.png",
                                price: 10,
                                description:
                                    "An upgrade that improves your claw speed.",
                            },
                        ]}
                        equipmentFixes={[
                            {
                                id: "claw",
                                name: "Claw Fix",
                                imageUrl: "https://example.com/sword.png",
                                price: 10,
                                description: "Fixes your claw.",
                            },
                            {
                                id: "stove",
                                name: "Stove Fix",
                                imageUrl: "https://example.com/sword.png",
                                price: 10,
                                description: "Fixes your stove.",
                            },
                            {
                                id: "cauldron",
                                name: "Cauldron Fix",
                                imageUrl: "https://example.com/sword.png",
                                price: 20,
                                description: "Fixes your cauldron.",
                            },
                        ]}
                        balance={10}
                        onBuy={(purchaseItemId: string) => {
                            console.log("Item bought:", purchaseItemId);
                        }}
                        onClose={() => setIsTestModalOpen(false)}
                    />
                    {/* <DayResults
                        dayNumber={1}
                        onClose={() => setIsTestModalOpen(false)}
                        balance={123}
                        junkRecycled={6}
                        junkBurnt={7}
                        lootCrafted={2}
                        lootScrewedUp={1}
                        profit={40}
                        clawWearout={54}
                        cauldronWearout={91}
                        stoveWearout={32}
                    /> */}
                    {/* <Stall
                        groups={[
                            {
                                name: "swords",
                                items: [
                                    {
                                        name: "shiny sword",
                                        category: "swords",
                                        imageUrl:
                                            "https://example.com/sword.png",
                                        price: 10,
                                        lootDetails: [
                                            {
                                                lootDetailName: "blade",
                                                junkImageUrl:
                                                    "https://example.com/sword.png",
                                            },
                                            {
                                                lootDetailName: "guard",
                                                junkImageUrl:
                                                    "https://example.com/sword.png",
                                            },
                                            {
                                                lootDetailName: "grip",
                                                junkImageUrl:
                                                    "https://example.com/sword.png",
                                            },
                                            {
                                                lootDetailName: "pommel",
                                                junkImageUrl:
                                                    "https://example.com/sword.png",
                                            },
                                        ],
                                    },
                                    {
                                        name: "elven sword",
                                        category: "swords",
                                        imageUrl:
                                            "https://example.com/sword.png",
                                        price: 10,
                                        lootDetails: [
                                            {
                                                lootDetailName: "blade",
                                                junkImageUrl:
                                                    "https://example.com/sword.png",
                                            },
                                            {
                                                lootDetailName: "guard",
                                                junkImageUrl:
                                                    "https://example.com/sword.png",
                                            },
                                            {
                                                lootDetailName: "grip",
                                                junkImageUrl:
                                                    "https://example.com/sword.png",
                                            },
                                            {
                                                lootDetailName: "pommel",
                                                junkImageUrl:
                                                    "https://example.com/sword.png",
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                name: "shields",
                                items: [
                                    {
                                        name: "oak shield",
                                        category: "shields",
                                        imageUrl:
                                            "https://example.com/sword.png",
                                        price: 10,
                                        lootDetails: [
                                            {
                                                lootDetailName: "blade",
                                                junkImageUrl:
                                                    "https://example.com/sword.png",
                                            },
                                            {
                                                lootDetailName: "guard",
                                                junkImageUrl:
                                                    "https://example.com/sword.png",
                                            },
                                            {
                                                lootDetailName: "grip",
                                                junkImageUrl:
                                                    "https://example.com/sword.png",
                                            },
                                            {
                                                lootDetailName: "pommel",
                                                junkImageUrl:
                                                    "https://example.com/sword.png",
                                            },
                                        ],
                                    },
                                    {
                                        name: "iron shield",
                                        category: "shields",
                                        imageUrl:
                                            "https://example.com/sword.png",
                                        price: 10,
                                        lootDetails: [
                                            {
                                                lootDetailName: "blade",
                                                junkImageUrl:
                                                    "https://example.com/sword.png",
                                            },
                                            {
                                                lootDetailName: "guard",
                                                junkImageUrl:
                                                    "https://example.com/sword.png",
                                            },
                                            {
                                                lootDetailName: "grip",
                                                junkImageUrl:
                                                    "https://example.com/sword.png",
                                            },
                                            {
                                                lootDetailName: "pommel",
                                                junkImageUrl:
                                                    "https://example.com/sword.png",
                                            },
                                        ],
                                    },
                                ],
                            },
                        ]}
                        onSellAndClose={() => setIsTestModalOpen(false)}
                    /> */}
                    {/* <NewLootInfo
                        name={"shiny sword"}
                        category={"swords"}
                        details={[
                            {
                                lootDetailName: "blade",
                                junkImageUrl: "https://example.com/sword.png",
                            },
                            {
                                lootDetailName: "guard",
                                junkImageUrl: "https://example.com/sword.png",
                            },
                            {
                                lootDetailName: "grip",
                                junkImageUrl: "https://example.com/sword.png",
                            },
                            {
                                lootDetailName: "pommel",
                                junkImageUrl: "https://example.com/sword.png",
                            },
                        ]}
                        onClose={() => setIsTestModalOpen(false)}
                    /> */}
                </TestModalContainer>
            )}
        </div>
    );
}

export default App;
