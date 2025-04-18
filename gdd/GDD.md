# 🧲 Lootcycle: Game Design Document (GDD)

## 🎮 Game Overview

**Lootcycle** is a crafting and management simulation set in a fantasy world. The player operates a recycling station, transforming junk items retrieved from a dungeon into valuable loot items using a unique crafting system involving a claw machine, cauldron, and furnace.

### Core Concept:

Craft the best possible loot items from available junk, manage resources, upgrade the station, and maximize profit by selling crafted loot. Balance heating the cauldron and providing ingredients for crafting.

### Target Audience:

-   Crafting and management simulation fans
-   Fantasy and RPG enthusiasts
-   Players who enjoy optimizing systems and progression

## 🌍 Game World and Context

The station processes junk left behind by adventurers. The player aims to build a profitable enterprise by mastering the crafting process and making smart investments.

### Story and Setting:

The player runs a unique recycling business, turning discarded adventuring gear (junk) into desirable loot items.

## 🎯 Steam Information

### Steam Tags:

1.  Crafting
2.  Resource Management
3.  Management
4.  Loot
5.  Casual
6.  Fantasy
7.  Simulation
8.  RPG
9.  Economy
10. Physics

### Short Description:

"Master the art of magical recycling in Lootcycle! Operate a fantasy workshop, using a claw machine to sort junk, a cauldron to craft loot, and a furnace to fuel the process. Turn discarded scraps into legendary gear, manage your resources, unlock recipes, and upgrade your station to maximize profits!"

### Main Capsule:

TODO

## ♻️ Key Mechanics

### 1. Core Gameplay Elements

-   **Claw:** Player-controlled machine to pick up junk items from the Pile.
-   **Pipe (Junk Pipe):** Delivers junk items into the Pile.
-   **Pile (Junk Pile):** Area where junk items accumulate.
-   **Cauldron:** Main crafting vessel where junk items are transformed into loot. Requires heating.
-   **Furnace:** Burns junk items supplied via the Intake to heat the Cauldron.
-   **Intake:** Chute where player drops junk items destined for the Furnace.
-   **Junk Items:** Raw materials used for both crafting (in Cauldron) and fuel (in Furnace).
-   **Loot Items:** Valuable items crafted from Junk Items in the Cauldron.
-   **Recipes (Templates):** Blueprints required for crafting specific Loot Items. Stored in the Deck.
-   **Deck:** Player's collection of acquired recipes. Supplies the crafting queue.
-   **Stall:** Inventory where crafted Loot Items are stored before selling.
-   **Money:** Currency earned from selling Loot Items, used for purchases in the Shop.
-   **Shop:** Interface for buying recipes, upgrades, and fixing equipment.
-   **Loot Mixer:** A feature in the Shop to create Hybrid Recipes.

### 2. Crafting System

-   Player selects junk items with the Claw and drops them into either the Cauldron (ingredients) or the Intake (fuel).
-   Starting the craft burns fuel in the Furnace, heating the Cauldron.
-   Player stops the process at the desired temperature.
-   Success depends on correct temperature range and ingredients matching a recipe from the queue.
-   Results: Successful craft (Loot Item), failure (too hot/cold, ingredients lost or returned), or wasted fuel.

### 3. Wearing and Fixing

-   Core elements (Claw, Cauldron, Furnace, Intake) degrade with use, impacting performance (e.g., Claw glitches, Cauldron dirtiness affects price, Furnace heats slower, Intake clogs).
-   Requires spending money in the Shop to fix/clean.

## 🖥️ Visual Style and Interface

-   **Main View:** 2D side-view showing the Claw operating above the Pile, the Cauldron/Intake/Furnace assembly, and the Junk Pipe.
-   **Key UI Elements:** Recipe queue, temperature gauge, Stall access, Day/Money indicators.
-   **Popups:** Day Start, Day End (Statistics), Shop, Stall, Crafting Result, Onboarding Modals.

## 📋 Gameplay Process (Phases)

1.  **Day Start**: Shows current day number. Refills recipe queue.
2.  **Day**: Core gameplay loop - receive junk, operate Claw, sort junk into Cauldron/Intake, craft items, place loot in Stall. Repeat until choosing to end the day or resources/equipment prevent continuation.
3.  **Day End (Statistics)**: Review performance (profit/loss, items crafted, etc.), compare with previous days.
4.  **Shop**: Spend earned money to fix equipment, buy base recipes, buy upgrades, or use the Loot Mixer. Proceeds to the next Day Start.

## 💰 Progression System

### Upgrades (Purchased in Shop)

-   **Claw:** Durability, movement speed, catch ease.
-   **Cauldron:** Durability, final price buff.
-   **Furnace:** Durability, heat-up speed.
-   **Intake:** Durability.
-   **Dungeon:** Increases quantity/quality of junk received per day.

### Recipes (Acquired in Shop)

-   **Base Recipes:** Purchased directly. Added to the Deck.
-   **Hybrid Recipes:** Created via the Loot Mixer (requires money and base recipes). Added to the Deck.

### Repair System

-   Equipment wears down, negatively affecting gameplay.
-   Repairs cost money and are performed in the Shop.

## 💎 Game Economy

### Money Sources

-   Selling crafted Loot Items from the Stall. Value depends on the item, recipe, and potentially Cauldron cleanliness/upgrades.

### Expenses

-   Fixing worn equipment (Claw, Cauldron, Furnace, Intake).
-   Buying upgrades for equipment and the dungeon source.
-   Buying new base recipes.
-   Using the Loot Mixer to attempt hybrid recipe creation.
