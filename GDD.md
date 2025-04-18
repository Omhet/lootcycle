# 🧲 Lootcycle: Game Design Document (GDD)

## 🎮 Game Overview

**Lootcycle** is a recycling station management simulator set in a fantasy world. The player controls the owner of a station located at the exit of a dungeon. Using a mechanical crane, the player sorts, recycles, and sells the remnants of equipment discarded by heroes.

### Core Concept:

Turn heroes' trash (broken item parts) into valuable items through skillful temperature management and part combination.

### Target Audience:

-   Crafting and management simulation fans
-   Fantasy and RPG enthusiasts
-   Casual players who appreciate elegant gameplay loops

## 🌍 Game World and Context

The station is located at the exit of a famous dungeon, where heroes constantly venture in search of treasures. They often lose or discard damaged equipment, which the player can collect and recycle.

### Story and Setting:

The player is an inventor who has discovered a way to create new items from broken ones. They have received permission from the local heroes' guild to collect and recycle items discarded from the dungeon.

## 🎯 Steam Information

### Steam Tags:

1. Crafting
2. Resource Management
3. Management
4. Loot
5. Casual
6. Fantasy
7. Simulation
8. RPG
9. Economy
10. Medieval (?)

### Short Description:

"Lootcycle is a fantasy recycling simulator where you transform dungeon trash into valuable items. Manage your recycling station, control temperature, craft rare items, and upgrade your equipment. Turn adventurers' junk into your treasure!"

### Main Capsule:

TODO

## ♻️ Key Mechanics

### 1. Mechanical Claw

-   **Control**: WASD for movement, hold LMB to grab an item
-   **Scanning**: RMB with an item in the claw to analyze properties
-   **Condition**: Gradually wears out, requires repair

### 2. Temperature System

-   **Cauldron**: Heated by the Furnace below, has a thermometer showing temperature
-   **Optimal Temperature**: Determined by the specific "recipe" of the item being created and differs for different item types
-   **Visual Indicators**:
    -   Cauldron color changes when heating
    -   Cauldron shakes at high temperatures
    -   Smoke from the Cauldron (white - normal temperature, gray - approaching critical, black - burning)
    -   Thermometer scale rises and its color changes from blue to red

### 3. Recycling System

-   **Cauldron**: Attached to the top of the Furnace, has a limit on the number of items that can be recycled simultaneously, wears out over time
-   **Furnace**: Heats the Cauldron, has a limit on the number of items burning simultaneously, wears out over time
-   **Intake**: Entry point for items sent to the Furnace
-   **Conveyor**: Connects the Intake to the Furnace
-   **Cauldron Lid**: Opens/closes with the Spacebar

### 4. Items and Trash

-   **Structure**: The game only features loot items and the parts they consist of
-   **Trash**: Parts of loot items used both for recycling in the Cauldron and burning in the Furnace
-   **Stability**: Determines the degradation time of trash items in game days
-   **Categories**: Weapons, armor, magical items. More details in the crafting system

### 5. Crafting and Item Creation

-   **Deterministic System**: The same inputs always yield the same result
-   **"Masterwork" Modifier**: Chance to create an improved version of an item at the perfect temperature. The selling price of such an item is higher
-   **Crafting Result**: Created item automatically goes to inventory
-   **Recipe Book**: Available immediately and contains locked cards for all possible items; cards are unlocked after creating the corresponding item

## 🖥️ Visual Style and Interface

### General Screen Layout (2D side-view)

```
┌─────────────────────────┬───────────────────────┐
│                         │        DISPOSAL        │
│                         │         PIPE           │
│                         │                       │
│          CLAW           │                       │
│       (controllable)    │                       │
│                         │                       │
├─────────────────────────┼───────────────────────┤
│       CAULDRON          │                       │
│    (with thermometer)   │                       │
│        FURNACE          │        INTAKE         │
│                         │                       │
│                         │                       │
└─────────────────────────┴───────────────────────┘
       GROUND/DUMP (where trash falls)

```

## 📋 Gameplay Process

1. **Start of Day**: New items fall from the disposal pipe
2. **Recycling**
    1. **Sorting**: Player decides which items to send to the Cauldron and which to the Furnace
    2. **Temperature Management**: Maintaining the right temperature for different types of recycling
    3. **Item Creation**: Placing items in the Cauldron, closing/opening the lid, controlling the process
3. **Sales**: Selling created items through the inventory interface. The day ends after this
4. **Statistics**: Viewing the day's results and overall progress
5. **Upgrades**: Purchasing upgrades in the shop
6. **Moving to a New Day**

### Detailed Day Flow

1. **Trash Reception**
    - The pipe shakes and the sound of rolling trash is heard. At the beginning of the day, N items fall from the pipe (depends on dungeon upgrades)
    - Items are physical (bounce, roll over)
2. **Trash Processing**
    - **Scanning**: Obtaining information about properties and composition
    - **Sorting**: Determining which items to direct to the Furnace and which to the Cauldron
    - **Heating**: Maintaining the right temperature by burning items in the Furnace
    - **Recycling**: Placing items in the Cauldron, closing the lid, controlling the temperature
    - **Recycling Results**:
        - The crafting result is determined only when the player opens the lid
        - Optimal temperature: creation of a new item, showing a popup with the item, then the item goes to inventory
        - Low temperature: items fall back into the game area
        - High temperature: items burn up and disappear, black smoke comes from the Cauldron
3. **End of Day**
    - **Sales**: Automatic calculation of the value of created items by pressing a button in the inventory
    - **Statistics**: Display of earnings, number of recycled items
    - **Upgrades**: Purchasing station upgrades with earned money

## 💼 Detailed Interface Overview

### Inventory TODO: Rename this to Counter

```
┌───────────────────────────────────┬────────────────────────┐
│ INVENTORY        [X] Close        │     ITEM INFORMATION   │
├───────┬───────┬───────┬───────────┤                        │
│[Slot1]│[Slot2]│[Slot3]│[Slot4]    │  [Icon] [Name]         │
├───────┼───────┼───────┼───────────┤                        │
│       │       │       │           │  Rarity: [Common]      │
│       │       │       │           │  Type: [Sword]         │
│       │       │       │           │                        │
│       │       │       │           │  Value: XXX gold       │
│       │       │       │           │                        │
│       │       │       │           │  [DESTROY ITEM]        │
├───────┴───────┴───────┴───────────┴────────────────────────┤
│           [SELL ALL AND END DAY]                           │
└────────────────────────────────────────────────────────────┘

```

-   **Functions**:
    -   Display of all created items
    -   Viewing detailed information about the selected item
    -   Ability to destroy unwanted items
    -   Button to sell all items and end the day

### Recipe Book

```
┌───────────────────────────────────┬────────────────────────┐
│ RECIPE BOOK       [X] Close       │   RECIPE INFORMATION   │
├───────┬───────┬───────┬───────────┤                        │
│[Sword]│[Helm] │[Staff]│[Ring]     │  [Icon] [Name]         │
├───────┴───────┴───────┴───────────┤                        │
│                                   │  Required materials:    │
│  [Item 1] [Item 2] [....]         │  - [Material 1]        │
│                                   │  - [Material 2]        │
│  [?????] [?????] [?????] [?????]  │                        │
│                                   │  Optimal temp.: MIN - MAX│
│  [?????] [?????] [?????] [?????]  │                        │
│                                   │  [Discovered/Locked]   │
└───────────────────────────────────┴────────────────────────┘

```

-   **Functions**:
    -   Display of all possible items in the game
    -   Locked items shown as "?????"
    -   Information about required materials and creation conditions
    -   Filtering by item categories

### Statistics Screen

```
┌──────────────────────────────────────┐
│           DAY SUMMARY                │
├──────────────────────────────────────┤
│ Trash recycled: XX                   │
│ Trash burned: XX                     │
│ New loot items created: XX           │
│                                      │
│ Gold earned: XXX                     │
│ Spent on repairs: XX                 │
│                                      │
│ Total profit: XXX                    │
│                                      │
│ ┌────────────────────────────────┐   │
│ │       PROGRESS CHART           │   │
│ │                                │   │
│ │                                │   │
│ └────────────────────────────────┘   │
│                                      │
│           [CONTINUE]                 │
└──────────────────────────────────────┘

```

-   **Functions**:
    -   Detailed information about the day's results
    -   Comparison with previous days
    -   Chart of income and productivity changes
    -   Display of unlocked recipes

### Upgrades Screen

```
┌────────────────────────┬────────────────────────────┐
│ AVAILABLE UPGRADES     │ UPGRADE DETAILS            │
├────────────────────────┤                            │
│ CLAW                   │ Name: "Titanium Grip"      │
│ ├─ Movement speed      │                            │
│ └─ Durability increase │ Description: "Increases    │
│                        │ claw durability by 50%"    │
│ CAULDRON               │                            │
│ └─ Durability increase │ Price: 300 gold            │
│                        │                            │
│ FURNACE                │ Level: 1 → 2               │
│ └─ Durability increase │                            │
│                        │ [BUY]                      │
│ INTAKE AND CONVEYOR    │                            │
│ └─ Conveyor speed up   │                            │
│                        │                            │
│ INVENTORY (COUNTER)    │                            │
│ └─ Size expansion (number of slots) │                │
│                        │                            │
│ DUNGEON                │                            │
│ └─ Improve quality and quantity of dropped trash │   │
└────────────────────────┴────────────────────────────┘
     [START NEW DAY]

```

-   **Functions**:
    -   View available upgrades by category
    -   Display of cost and effect of each upgrade
    -   Ability to purchase selected upgrades
    -   Move to a new day

## 💰 Progression System (Upgrades)

### Available Upgrades

1. **Claw**
    - Movement speed improvement
    - Durability increase
2. **Cauldron**
    - Durability increase
    - Cooling slowdown
3. **Furnace**
    - Durability increase
    - Cooling slowdown
4. **Intake and Conveyor**
    - Conveyor speed up
5. **Tools**
    - Inventory expansion
6. Dungeon
    1. Increase the quantity and quality of dropped trash (chance tables)

### Repair System

-   All station components (Claw, Cauldron, Furnace) gradually wear out. TODO: Possibly the conveyor also wears out
-   Mandatory repair to maintain efficiency
-   Repair cost depends on the degree of wear

## 💎 Game Economy

### Money Sources

-   Selling created items. Cost depends on: rarity, materials, "Masterwork" modifier

### Expenses

-   Buying upgrades
-   Equipment repair
-   Trash recycling tax (percentage of profit, like VAT)
