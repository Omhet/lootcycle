# Crafting System

This document details the crafting mechanics in Lootcycle, explaining how the player transforms junk items into valuable loot through the crafting process.

## Recipes

To craft any item, you need a recipe. Recipes are sold in the shop for money. Examples include:

-   **Blade Category**: One-handed sword, two-handed sword, katana, dagger
-   **Axe Category**: Hatchet, battle axe
-   And others

### Recipe Components

Each recipe has the following components:

-   **Template**: The pattern according to which items are assembled from parts
-   **Default Configuration**: What will be created if the cauldron doesn't have the necessary parts (everything gets melted into this default configuration)
-   **Base Price**: Used to calculate the price of the resulting item
-   **Ideal Temperature**: Hitting this temperature makes the item masterfully crafted and increases its price
-   **Temperature Offset**: Sets minimum and maximum boundaries for crafting
-   **Item Parts**: Defines which parts of the item influence base characteristics to varying degrees (e.g., a one-handed sword's blade contributes 60% to the price, while the handle contributes 40%)

All recipe characteristics are manually curated to be meaningful and balanced.

## Junk (Parts)

Junk consists of JunkParts that serve as crafting components. Some JunkParts contain multiple JunkDetails (like a bone), while others are simpler with fewer details.

### Junk Categories

-   **Recipe-Specific Parts**: Suitable for a specific recipe (e.g., blades for a one-handed sword)
-   **Universal Parts**: Can be used in different recipes (e.g., sword handle parts can fit recipes for various swords)

### Junk Management

The composition of junk is determined by favorite recipes, which can be changed between days. Players can like one, several, or all purchased recipes, but:

-   More liked recipes = greater variety in the junk pile
-   More liked recipes = harder to grab parts that fit a specific recipe
-   Strategic recommendation: Like only a couple of recipes and actively manage them based on customer requests, news, and quests

### Junk Distribution

The junk pile contains items suitable for crafting only your favorite recipes. For example, if you've liked one-handed sword and battle axe recipes, the junk will contain parts suitable for crafting either of these, but not, for example, a helmet.

### Quality Control

To keep gameplay interesting:

-   Each part type has a coefficient affecting how frequently it appears in the pile
-   Medium-quality parts (like steel and silver blades) appear most often
-   Low-quality (wooden) and high-quality (gold) parts appear less frequently
-   This ensures reasonable earnings and variety in crafted items

### Junk Progression

As the game progresses:

-   In the full game, clients venture deeper into the dungeon, killing rarer monsters
-   These monsters' remains end up in the junk pile
-   More expensive parts from defeated heroes also appear in the pile
-   For the game jam version: A simple modal announces that clients opened a new room in the dungeon, bringing new parts

### Junk Properties

Each JunkDetail has characteristics that affect the resulting item:

-   **Price Coefficient**: Affects the item's price positively or negatively (e.g., wooden blade decreases price, diamond blade increases it)
-   **Temperature Coefficient**: Affects the minimum and maximum temperature boundaries for crafting (e.g., wooden parts burn quickly - coefficient <1, diamond parts are very sturdy - coefficient >1)
-   **Stat Coefficients**: Affect the D&D characteristics of the item

### Junk Synergies

JunkDetails can synergize with each other, creating successful or unsuccessful combinations:

-   Matching sets (e.g., all details from an elven sword) create a complete themed item
-   Complete sets are more expensive and have improved characteristics

## Crafting Process

The crafting cauldron follows a specific algorithm for transforming junk into valuable items.

### Recipe Queue

The cauldron has a queue of items to be crafted:

-   Shows players in advance what the cauldron will be making
-   Allows players to select appropriate junk
-   Queue is randomly filled from favorite recipes
-   Example: If a player liked one-handed and two-handed sword recipes, they might see: [one-handed sword, one-handed sword, two-handed sword] in the queue

### Crafting Algorithm

When a player puts the required amount of junk in and starts crafting:

1. **Recipe Selection**: The cauldron checks which item it should craft (first recipe in queue)
2. **Part Mapping**: The cauldron creates a map for each RecipeDetail needed (e.g., blade, guard, grip, pommel) plus an "other" category for non-matching parts
3. **Junk Analysis**: The cauldron analyzes the available junk and distributes JunkDetails into the appropriate categories
    - Example: Wooden blade → blade slot, elven guard → guard slot, bone → grip & pommel slots, wooden handle → pommel slot, ring → "other" category
    - If JunkDetails are missing for a component, remaining junk is transformed into basic details from the recipe
4. **Part Selection**: The cauldron sorts parts by value and selects the optimal configuration
    - Basic implementation: Choose the most expensive JunkDetail for each RecipeDetail
    - Advanced implementation (potential upgrade): Better finding synergies and evaluating total item value
5. **Temperature Calculation**: The cauldron calculates temperature offset for the mini-game
    - Example: Recipe has perfect_temp=50°, base_offset=20° (resulting in base min=30°, max=70°)
    - JunkDetail coefficients modify this: wooden blade (0.5), elven guard (1.5), bone grip & pommel (0.7 each)
    - Calculation: 20*0.5*0.7*0.7*1.5=7.35° → temperature offset of 7° (rounded)
6. **Price Calculation**: The cauldron calculates the item's price while the player plays the mini-game
    - Recipe has base_price (e.g., 10 coins)
    - Different RecipeParts contribute differently (e.g., blade: 60%, handle: 40%)
    - Apply JunkDetail coefficients (e.g., wooden blade: 0.5, elven guard: 2.0, bone grip & pommel: 0.8 each)
    - Calculation: 6*0.5 + 4*(2*0.8*0.8)=8.12 → 8 coins (rounded)
    - Note: Item price cannot be less than 1 coin

## Additional Considerations

-   D&D characteristics are calculated using similar coefficient systems (not implemented in the game jam version)
-   Clients can influence an item's price based on whether it matches their desired stats
-   Potential feature: Daily boosts, such as a potion that turns all blades golden

## Links to Related Documents

-   [Main Game Design Document](GDD.md)
-   [Gameplay Details](Gameplay.md)
