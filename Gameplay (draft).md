i need to update the GDD. I will give you edits and you will update.

There are 4 main phases in the Game

1. Day Start
2. Day
3. Day End (Statistics)
4. Shop

After clicking Play in Main Menu Game loads Game scene and starts with Day Start phase (there will be a day start popup screen where there is written a current day number player is playing).
After click OK game proceeds to Day phase where the main gameplay happens.
The main elements in the game are: Claw, Pipe (Junk Pipe), Pile (Junk Pile), Cauldron, Furnace, Intake, Junk Items, Loot Items, Loot Recipies (Templates), Hybrid Loot Recipies (Templates), Deck, Stall, Money, Journal, Statistics, Shop, Loot Mixer
After Player played core gameplay he proceeds to Day End phase where he sees a statistics screen of how good he played the day (spends/profit etc) and plot of previous days
After that he proceeds to Shop phase where he can spend earned money to buy new recipies and upgrades and/or try to produce a hybrid recipe in Loot Mixer
Then he proceeds to new day start

The main goal for a player is to craft the best loot items possible from what he currently have (junk items in the Pile, state of the Claw/Furnace/Cauldron, unlocked reciepes, upgrades etc) and then sell them for money. The main challenge is to balance earns to spends maximising profit of his enterprise. The derivative challenges are:

-   to balance what junk items he will put into Intake to burn in the furnace to heat up Cauldron and what junk items he will put into Cauldron to serve as ingredients for the loot item he will craft.
-   to fix main operating elements not too late to spend less money on operations
-   to buy best upgrades possible that fit player's strategy

The core gameplay of Day phase is:

-   Player receives a first portion of junk items from the Junk Pipe (the items are falling down into the Pile)
-   Player operates a claw machine and crafting system that consists of 4 main elements: Cauldron, Intake, Furnace. Cauldron is in the bottom left corner of screen, next to Cauldron is Intake, Furnace is under the Cauldron and is connected to the Intake's bottom pipe. From the Intake till the right side of the screen there is a Pile. Pile is a container where all the junk items from the Pipe will arrive. The Pipe is in the top right corner of the screen above the Pile.
-   Player controlls Claw with: A/D to move Left/Right, Space to trigger Claw so it goes down automatically and tries to catch junk items from the Pile. By default Claw is open and doesn't have junk caught inside, in this state it moves Left/Right continuosly so player can aim. After player is satisfied with the Claw position he presses Space and it triggers Claw to go down and catch junk, If it catched at least 1 junk item it transforms into Closed state and now it moves Left or Right only discretely (either to Clauldron side or to Intake side). When on either side player can choose to press Space again to open Claw (then all junk items that were inside fall down into Cauldron/Intake) or press A/D to move to another side (if was on Cauldron then moves to Intake and vice versa)
-   The junk items that fell into Cauldron/Intake will sit there untill player starts to craft
-   When player is ready he can press Enter and it starts crafting process
-   After crafting process and asessing results player will receive a new portion of junk items from the pipe (less with each new porition) and repeat the core gameplay loop untill junk items left enough in the Pile to craft, or Claw/Cauldron/Intake are still operatable (not broken)

Crafting process in detail:

-   After player press Enter the crafting process will try to start. First it will check if there is enough junk items in the Cauldron and Intake nd the Cauldron/Intake is not broken to the point is no longer operatable. If the process cannot be started then game will warn player
-   If the process can be started, then it starts and the Claw becomes blocked (not interactive) for the time of the crafting process. Intake's bottom lid opens down and all the junk items inside Intake are starting to fall down through a bottleneck of the Intake into Furnace's entrance and start to burn in the furnace. The Cauldron's lid closes. The temperature of the Cauldron is starting to rise and the crafting process starts.
-   The process continues untill player presses Enter again or temperature exceeds limits.
-   If the temperature exceeds limits, the cauldron "explodes" (not really, just an effect), its lid flies up with black smoke coming from inside the cauldron. The junk items inside the Cauldron are destroyed
-   If player presses Enter, then the craftLootItem function is called and it deternmines the crafting result.
-   The crafting result can be failure or success. It will be failure if temperature is too high/too low.
-   If too low, then nothing will happen to the junk items inside. The "punishment" to the player is that he wasted some junk items for the burning when he tried to craft
-   If too high, then the cauldron will open with black smoke and the junk items inside the Cauldron are destroyed
-   If crafting result is success, then game will show a popup with the crafted loot item. Player can inspect the item's details and visuals and press a button in the popup to put the loot item into Stall. The junk items that were inside the Cauldron are destroyed
-   In any result, player can start the process again or operate claw machine again

Recipies deck

-   Player has a set of aquired base receipes (templates). This set is called Deck.
-   The deck is limitless and templates can only be added to the deck (no removing)
-   The next loot item for the craft process gets chosen from the deck. There is a queue of 3 slots in UI to the left of the Cauldron. All the queue slots are filled with a random non-unique template from the Deck on a Day start. After crafting result, the queue shifts and a new random non-unique template from the Deck goes to the end of the queue

Stall

-   Stall is basically an inventory screen that looks like a popup with grid of loot items on the left and selected items details card on the right
-   There is one button "Sell all and call it a day" that sells all items from the stall and ends the Day phase and after that Game proceeds to the Day End phase

Day End phase (statistics)

-   It's a popup screen where player can see the resuts of the current ended day (profit, how much junk he received, how much he used, how many craft attempts there were, how many failures/successes, wearing of Claw/Cauldron/Furnace/Intake) and a history of results from the previous played days and how curent is compared to them (plot of profits)
-   After inspecting and clicking OK Game proceeds to Shop phase

Shop

-   It's a popup screen where player can spend money to aquire different new stuff. \
-   He can spend money on to:
-   Fix core gameplay elements
-   Buy upgrades
-   Buy new base recipies
-   Use Loot Mixer

Wearing/Fixing of core gameplay elements

-   Cauldron gets dirty because of the usage. It needs to be cleaned for money in the shop. The dirtiness of the cauldron impacts final price of crafted loot item (debuff to money)
-   Intake (its botleneck) gets dirty because of the usage. It needs to be cleaned for money in the shop. The dirtiness of the Intake's botleneck is binary (clean/clogged) and impacts "throughput" of Intake and thus the possibility of burning junk and thus craft. If it's clogged the junk items doesn't fall into the Furnace on craft start. (play restriction)
-   Furnace gets worn because of the usage. It needs to be fixed for money in the shop. The wearing of the Furnace impacts Cauldron heating up that makes player wait for the result longer (debuff to time)
-   Claw gets worn because of the usage. It needs to be fixed for money in the shop. The wearing of the Claw impacts how smooth it moves while in Open state (it can glitch and disturb player's attempt to aim) and how easily it catches junk items from the pile (mechanical debuff impacts gameplay's easiness)

Upgrades

-   Cauldron: durability, final price buff
-   Intake: durability,
-   Furnace: durability, heat up speed
-   Claw: durability, movement speed, catch easiness
-   Dungeon: more junk on each new portion in one day (+% to the start portion amount), new junk items variants (new and better materials, new and better loot details)

Base loot recipies (Base loot templates)

-   A base loot template is a template of a particular kind of weapon, e.g. One-handed Blade (Sword) or One-handed Axe or One-handed Shield etc
-   Player buys new templates for money in the Shop. All the aquired templates go to the Deck.

Hybrid loot recipies (Hybrid loot templates)

-   A hybrid loot template is a template that is a variant of a mix of 2 base templates. For example, Swordaxe or Axesword
-   Player can try to win new templates for money in the Loot mixer. All the aquired templates go to the Deck.

Loot Mixer

-   It's a lottery machine that gets base templates and money as the input and returns a hybrid template as an output
-   Loot mixer set is automatically filled by game from all player's aquired base templates and has a minimum of 2 and maximum of N items length. Player can change the set's contents to his liking before starting the mixer
-   It looks like a big barell with bumps on it's inner circle inside. There is a lid at the top and lit at the bottom. Is starts when money is paid and top lid opens up and base templates from the loot mixer set fall down inside, the top lids closes and the bottom one opens up and the barrel starts to rotate. Sometimes some of the items inside will drop from the bottom lid into slots under the barrel. Thos slots when filled determine the hybrid template result of the mixer. The order is important and determines final result, e.g. Sword, Axe -> Swordaxe, Axe, Sword -> Axesword

Game start

-   Player start with Main Menu (there is a game logo, Play button, How to play button)
-   After Play the first time the game starts from the start (after next times from the saved progress)
-   The very first game will start with Shop screen where player is asked to buy a base template from the available ones. The player has initial money that is enough only for one of the 2 first templates (Sword or Axe) and not enough for anything else (although he can inspect what is available in the shop). After purchase he will be left with little amount of money and the first base template in Deck and nothing left for him to do but start a game Day
-   On his very first day he will see an onboarding that will be implemented as a simple series of N modals where all the needed gameplay info is located. He cannot skip them and has to click through all and then proceed to gameplay. He can later look the onboarding modals in How to play button in Main Menu

Progress save

-   Players progress saved locally by days played. He will always start with the last day he played and didn't finish or the next day to the day he finished
