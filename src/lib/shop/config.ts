// Shop configuration
import { JunkLicense, RecipeCategory, RecipeItem, Upgrade } from "../../components/Shop/types";
import { lootConfig } from "../craft/config";
import { JunkPieceId, RecipeDetailType, RecipeItemType } from "../craft/craftModel";

// Base price multiplier for recipes (based on the item's base sell price)
const RECIPE_PRICE_MULTIPLIER = 5;

// Base price for junk licenses
const JUNK_LICENSE_BASE_PRICE = 50;

// Function to generate recipe items for the shop
export const generateRecipes = (purchasedRecipes: string[] = []): RecipeCategory[] => {
  const categories: RecipeCategory[] = [];

  // Process all recipe item types
  Object.entries(lootConfig.recipeItems).forEach(([itemType, recipes]) => {
    const typeName = itemType === RecipeItemType.BladeWeapon ? "Blade Weapons" : itemType === RecipeItemType.Axe ? "Axes" : itemType;

    const items: RecipeItem[] = recipes.map((recipe) => ({
      id: recipe.id,
      name: recipe.name,
      category: typeName,
      description: `A recipe for crafting ${recipe.name}`,
      imageUrl: `/assets/recipes/${recipe.id.toLowerCase()}.png`, // Default image
      price: recipe.baseSellPrice * RECIPE_PRICE_MULTIPLIER,
      priceForCraftedBaseItem: recipe.baseSellPrice,
      alreadyBought: purchasedRecipes.includes(recipe.id),
    }));

    if (items.length > 0) {
      categories.push({
        name: typeName,
        items,
      });
    }
  });

  return categories;
};

// Function to get a user-friendly name for a recipe detail type
const getDetailTypeName = (detailType: RecipeDetailType): string => {
  switch (detailType) {
    case RecipeDetailType.Pommel:
      return "Sword Pommel";
    case RecipeDetailType.Grip:
      return "Sword Grip";
    case RecipeDetailType.Guard:
      return "Sword Guard";
    case RecipeDetailType.ShortSwordBlade:
      return "Sword Blade";
    case RecipeDetailType.AxeHandle:
      return "Axe Handle";
    case RecipeDetailType.AxeHead:
      return "Axe Head";
    default:
      return detailType;
  }
};

// Function to format rarity with proper capitalization and color tags
const formatRarity = (rarity: string): string => {
  const capitalizedRarity = rarity.charAt(0).toUpperCase() + rarity.slice(1).toLowerCase();

  // Add color class based on rarity
  let colorClass = "";
  switch (rarity) {
    case "common":
      colorClass = "rarity-common";
      break;
    case "uncommon":
      colorClass = "rarity-uncommon";
      break;
    case "rare":
      colorClass = "rarity-rare";
      break;
    case "epic":
      colorClass = "rarity-epic";
      break;
    case "legendary":
      colorClass = "rarity-legendary";
      break;
  }

  return `<span class="${colorClass}">${capitalizedRarity}</span>`;
};

// Function to generate junk licenses for the shop
export const generateJunkLicenses = (purchasedJunkLicenses: string[] = []): JunkLicense[] => {
  const junkLicenses: JunkLicense[] = [];

  // Process all junk pieces
  Object.entries(lootConfig.junkPieces).forEach(([junkId, junkPieceArray]) => {
    if (junkPieceArray.length > 0) {
      const junkPiece = junkPieceArray[0]; // Take the first instance

      // Skip pure fluff items (items that can't be used for crafting)
      const canBeUsedForCrafting = junkPiece.suitableForRecipeDetails.length > 0;
      if (!canBeUsedForCrafting) {
        return; // Skip this junk piece
      }

      // Create a description of what this junk piece can be crafted into
      let craftingDescription = "";
      if (junkPiece.suitableForRecipeDetails.length > 0) {
        // Format the craftable items as an HTML unordered list for UI display
        const detailNames = junkPiece.suitableForRecipeDetails.map(getDetailTypeName);
        craftingDescription = `Can be used to craft:\n<ul>${detailNames.map((name) => `<li>${name}</li>`).join("")}</ul>`;
      }

      // Format the rarity and sell price information
      const rarityDisplay = formatRarity(junkPiece.rarity);
      const sellPriceInfo = `<b>Sell Value:</b> ${junkPiece.sellPriceCoefficient}x base price`;

      junkLicenses.push({
        id: junkId as JunkPieceId,
        name: junkPiece.name,
        imageUrl: `/assets/junk/${junkId}.png`, // Assuming junk images follow this pattern
        price: Math.floor(JUNK_LICENSE_BASE_PRICE * junkPiece.sellPriceCoefficient),
        description: `<b>Rarity:</b> ${rarityDisplay}<br>${sellPriceInfo}<br><br>${craftingDescription}`,
        alreadyBought: purchasedJunkLicenses.includes(junkId),
        sellPriceCoefficient: junkPiece.sellPriceCoefficient, // Store this for sorting
      });
    }
  });

  // Sort junk licenses by sell price coefficient (ascending)
  junkLicenses.sort((a, b) => a.sellPriceCoefficient - b.sellPriceCoefficient);

  return junkLicenses;
};

// Junk pipe upgrade types and their levels
export enum JunkPipeUpgradeType {
  PORTION_SIZE = "portion_size",
  NEXT_PORTION_PERCENT = "next_portion_percent",
  FLUFF_RATIO = "fluff_ratio",
}

// Defining the upgrade levels for each pipe upgrade type
export const JUNK_PIPE_UPGRADES: Record<JunkPipeUpgradeType, { levels: Array<{ value: number; price: number }> }> = {
  [JunkPipeUpgradeType.PORTION_SIZE]: {
    levels: [
      { value: 50, price: 0 }, // Default level (free)
      { value: 75, price: 100 },
      { value: 100, price: 200 },
      { value: 150, price: 400 },
      { value: 200, price: 800 },
    ],
  },
  [JunkPipeUpgradeType.NEXT_PORTION_PERCENT]: {
    levels: [
      { value: 0.2, price: 0 }, // Default level (free)
      { value: 0.3, price: 150 },
      { value: 0.4, price: 300 },
      { value: 0.6, price: 600 },
      { value: 0.8, price: 1200 },
    ],
  },
  [JunkPipeUpgradeType.FLUFF_RATIO]: {
    levels: [
      { value: 0.95, price: 0 }, // Default level (free) - 95% fluff
      { value: 0.85, price: 200 },
      { value: 0.75, price: 400 },
      { value: 0.65, price: 800 },
      { value: 0.5, price: 1600 }, // 50% fluff, 50% useful junk
    ],
  },
};

// Function to generate upgrades for the shop UI
export const generateUpgrades = (purchasedUpgradeLevels: Record<string, number> = {}): Upgrade[] => {
  const upgrades: Upgrade[] = [];

  // Create UI-friendly upgrade objects
  Object.entries(JUNK_PIPE_UPGRADES).forEach(([upgradeType, { levels }]) => {
    const currentLevel = purchasedUpgradeLevels[upgradeType] || 0;

    // Only show the next available level for purchase
    const nextLevel = currentLevel + 1;

    if (nextLevel < levels.length) {
      const upgrade = levels[nextLevel];
      const currentValue = levels[currentLevel].value;

      let name = "";
      let description = "";
      let imageUrl = "";

      // Set name, description and image based on upgrade type
      if (upgradeType === JunkPipeUpgradeType.PORTION_SIZE) {
        name = "Junk Portion Size";
        description = `Increases the amount of junk received at once from ${currentValue} to ${upgrade.value} pieces`;
        imageUrl = "/assets/junk/green_fluff.png";
      } else if (upgradeType === JunkPipeUpgradeType.NEXT_PORTION_PERCENT) {
        name = "Next Portion Speed";
        description = `Increases the rate at which new junk arrives from ${currentValue * 100}% to ${upgrade.value * 100}%`;
        imageUrl = "/assets/junk/yellow_fluff.png";
      } else if (upgradeType === JunkPipeUpgradeType.FLUFF_RATIO) {
        const currentUsefulPercent = Math.round((1 - currentValue) * 100);
        const newUsefulPercent = Math.round((1 - upgrade.value) * 100);
        name = "Junk Quality";
        description = `Increases the quality of useful junk from ${currentUsefulPercent}% to ${newUsefulPercent}%`;
        imageUrl = "/assets/junk/blue_fluff.png";
      }

      upgrades.push({
        id: `${upgradeType}_${nextLevel}`,
        name,
        description,
        imageUrl,
        price: upgrade.price,
        value: upgrade.value,
        upgradeType: upgradeType as JunkPipeUpgradeType,
        level: nextLevel,
        alreadyBought: false,
      });
    }
  });

  return upgrades;
};
