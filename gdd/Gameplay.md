# Gameplay Details

This document outlines the detailed gameplay flow and mechanics for Lootcycle.

## Game Phases

The game progresses through four distinct phases in a loop:

1.  **Day Start:**

    -   Triggered after clicking "Play" in the Main Menu (loading the Game scene) or after finishing the Shop phase.
    -   A popup screen displays the current day number.
    -   The recipe queue is filled/refilled with 3 random non-unique templates from the player's Deck.
    -   Clicking "OK" proceeds to the Day phase.

2.  **Day:**

    -   The core gameplay loop occurs here.
    -   Player receives junk, operates the Claw, crafts items, and manages resources.
    -   Ends when the player chooses to sell items via the Stall or potentially when critical equipment breaks down completely or resources run out.

3.  **Day End (Statistics):**

    -   Triggered after selling items in the Stall.
    -   A popup screen shows statistics for the completed day: profit/loss, junk received vs. used, craft attempts (successes/failures), equipment wear.
    -   Includes a historical plot comparing the current day's profit to previous days.
    -   Clicking "OK" proceeds to the Shop phase.

4.  **Shop:**
    -   A popup screen where the player spends money earned during the Day phase.
    -   Available actions:
        -   Fix/Clean core gameplay elements (Claw, Cauldron, Furnace, Intake).
        -   Buy upgrades for equipment or the dungeon source.
        -   Buy new base recipes to add to the Deck.
        -   Use the Loot Mixer to attempt creating hybrid recipes.
    -   After finishing Shop activities, the game proceeds to the next Day Start phase.

## Core Gameplay Loop (Day Phase)

1.  **Junk Delivery:** The first portion of junk items falls from the Junk Pipe (top right) into the Pile (bottom right). Subsequent, smaller portions may arrive after successful crafts.
2.  **Claw Operation:**
    -   The Claw moves continuously left/right above the Pile. Player uses A/D keys to position it.
    -   Pressing Space triggers the Claw to descend, attempt a catch, and ascend.
    -   **Empty Claw (Open State):** Moves continuously. A/D aims. Space triggers descent.
    -   **Full Claw (Closed State):** If junk is caught, the Claw stops continuous movement. It can now only be moved discretely between two positions: above the Cauldron (bottom left) and above the Intake (next to Cauldron).
        -   Use A/D to move between the Cauldron and Intake positions.
        -   Press Space while positioned above either the Cauldron or Intake to open the Claw, dropping the held junk items inside. The Claw returns to the Open State above the Pile.
3.  **Sorting:** Player decides whether junk items caught by the Claw should go into the Cauldron (as crafting ingredients) or the Intake (as fuel for the Furnace).
4.  **Crafting Attempt:**
    -   When ready (sufficient items in Cauldron and Intake, desired recipe in queue), the player presses Enter to initiate crafting.
    -   The game checks if crafting is possible (enough ingredients, equipment not critically broken). If not, a warning is shown.
    -   If possible, the Claw becomes inactive. The Intake opens, dropping fuel items into the Furnace. The Cauldron lid closes.
    -   The Furnace burns the fuel, and the Cauldron's temperature begins to rise.
5.  **Crafting Resolution:**
    -   The process continues until the player presses Enter again or the temperature exceeds safe limits.
    -   **Temperature Limit Exceeded:** Cauldron "explodes" (visual effect: lid flies off, black smoke). Junk items inside the Cauldron are destroyed. Craft fails.
    -   **Player Presses Enter:** The `craftLootItem` logic determines the outcome based on the current temperature and ingredients vs. the active recipe.
        -   **Failure (Temperature Too Low):** No item is crafted. Ingredients remain in the Cauldron. Fuel used for heating is wasted.
        -   **Failure (Temperature Too High):** Same visual effect as exceeding limits. Junk items inside the Cauldron are destroyed. Craft fails.
        -   **Success:** A popup displays the crafted Loot Item. The player inspects it and clicks a button to move it to the Stall. Junk items used in the craft are consumed/destroyed. The recipe queue shifts, and a new recipe is added.
6.  **Repeat:** After the crafting result, the Claw becomes active again. The player can operate the Claw or initiate another craft. A new portion of junk may arrive from the Pipe. The loop continues until the player ends the day or cannot continue.

## Key Elements Detailed

### Claw

-   **Control:** A/D for movement (continuous when empty, discrete when full), Space to descend/drop.
-   **Wear:** Becomes glitchy/jerky during aiming (Open State), reduced chance of successfully grabbing items. Fixed in Shop.
-   **Upgrades:** Durability, movement speed, catch easiness.

### Cauldron

-   **Function:** Holds ingredients for crafting. Heated by the Furnace.
-   **Wear (Dirtiness):** Gets dirty. Reduces the final sale price of crafted loot items (money debuff). Cleaned in Shop.
-   **Upgrades:** Durability, final price buff (counteracts/overcomes dirtiness debuff).

### Furnace

-   **Function:** Burns junk items from the Intake to heat the Cauldron.
-   **Wear:** Heats the Cauldron more slowly (time debuff). Fixed in Shop.
-   **Upgrades:** Durability, heat-up speed.

### Intake

-   **Function:** Funnel for junk items intended as fuel for the Furnace.
-   **Wear (Clogging):** Bottleneck gets clogged (binary: clean/clogged). If clogged, junk items cannot fall into the Furnace when crafting starts, preventing heating and crafting. Cleaned in Shop.
-   **Upgrades:** Durability.

### Junk Items

-   Raw materials falling from the Pipe.
-   Used as ingredients (in Cauldron) or fuel (in Intake/Furnace).
-   Different types may have different properties (e.g., fuel value, suitability for recipes).
-   Composed of molecules that may contain multiple atoms (details).
-   Available junk is determined by player's favorite recipes.

For detailed information about the junk system, see the [Complete Crafting System Documentation](Crafting.md#junk-parts).

### Loot Items

-   Valuable items created through successful crafting.
-   Stored in the Stall until sold.
-   Value determined by recipe base price, parts coefficients, and potential synergies.
-   Quality affected by hitting the ideal temperature during crafting.
-   Final price is also affected by Cauldron upgrades/cleanliness.

For detailed information about loot item creation and pricing, see the [Complete Crafting System Documentation](Crafting.md#crafting-process).

### Recipes (Templates)

-   **Base Recipes:** Standard item templates (e.g., Sword, Axe, Shield). Purchased in the Shop, added permanently to the Deck.
-   **Hybrid Recipes:** Combinations of two base recipes (e.g., Swordaxe). Created via the Loot Mixer in the Shop, added permanently to the Deck.
-   **Deck:** The player's collection of all acquired recipes. Limitless. Recipes cannot be removed.
-   **Recipe Queue:** UI element (left of Cauldron) showing the next 3 recipes drawn randomly (non-unique) from the Deck. The leftmost recipe is the target for the current craft. Shifts after a craft attempt (success or failure that consumes ingredients). Refilled at Day Start and as slots become empty.
-   **Favorite Recipes:** Players can "like" recipes to determine which parts appear in the junk pile.

For comprehensive details about recipes and their properties, see the [Complete Crafting System Documentation](Crafting.md#recipes).

### Stall

-   Inventory screen (popup grid). Displays crafted Loot Items.
-   Shows details of the selected item.
-   Contains a "Sell All and Call it a Day" button, which sells all items in the Stall, calculates profit, and transitions the game to the Day End phase.

### Loot Mixer

-   Shop feature. A lottery-like machine.
-   **Input:** Money + a player-selected set of 2+ owned Base Recipes.
-   **Process:** Visual animation of recipes mixing.
-   **Output:** A Hybrid Recipe (e.g., Sword + Axe -> Swordaxe; Axe + Sword -> Axesword). The order matters. The resulting hybrid recipe is added to the Deck.

## Game Start and Onboarding

1.  **Main Menu:** Shows game logo, "Play" button, "How to Play" button.
2.  **First Play:**
    -   Starts with the Shop screen.
    -   Player has enough initial money to buy one of two starting Base Recipes (e.g., Sword or Axe) and nothing else.
    -   After purchase, the player has little money left and their first recipe in the Deck.
    -   Proceeds to the first Day Start.
3.  **First Day:**
    -   Mandatory onboarding sequence: a series of informational modals explaining core mechanics (Claw, Cauldron, Intake, Furnace, Crafting, Recipes, Stall).
    -   Cannot be skipped initially. Must click through all modals.
    -   After onboarding, normal Day phase gameplay begins.
    -   The onboarding modals can be reviewed later via the "How to Play" button in the Main Menu.
4.  **Subsequent Plays:** Loads saved progress and starts at the beginning of the next day or the day that was interrupted.

## Progress Saving

-   Game progress is saved locally, likely automatically at the transition between phases (e.g., after Shop, before Day Start).
-   Saves the current day number, acquired recipes (Deck), purchased upgrades, current money, and potentially the state of equipment wear.
-   Loading the game resumes from the start of the next logical day based on the save file.
