import { ScreenContainer } from "../../components/ScreenContainer/ScreenContainer";
import { Shop } from "../../components/Shop/Shop";
import { generateJunkLicenses, generateRecipes, generateUpgrades } from "../../lib/shop/config";
import { useGameFlowStore } from "../../store/useGameFlowStore";
import { useMoneyStore } from "../../store/useMoneyStore";
import { usePlayerProgressStore } from "../../store/usePlayerProgressStore";

export const ShopContainer = () => {
  const { nextDay } = useGameFlowStore();
  const { balance } = useMoneyStore();
  const { purchasedRecipes, purchasedJunkLicenses, junkPipeUpgradeLevels, purchaseRecipe, purchaseJunkLicense, purchasePipeUpgrade } = usePlayerProgressStore();

  // Generate shop items using real game data
  const recipes = generateRecipes(purchasedRecipes);
  const junkLicenses = generateJunkLicenses(purchasedJunkLicenses);
  const upgrades = generateUpgrades(junkPipeUpgradeLevels);

  const handleBuy = (purchaseItemId: string) => {
    // Find the item by ID across all shop categories
    const recipe = recipes.flatMap((category) => category.items).find((item) => item.id === purchaseItemId);
    const junkLicense = junkLicenses.find((license) => license.id === purchaseItemId);
    const upgrade = upgrades.find((upgrade) => upgrade.id === purchaseItemId);

    if (recipe) {
      // Use the store action to purchase the recipe
      purchaseRecipe(recipe.id, recipe.price);
    } else if (junkLicense) {
      // Use the store action to purchase the junk license
      purchaseJunkLicense(junkLicense.id, junkLicense.price);
    } else if (upgrade) {
      // Use the store action to purchase the junk pipe upgrade
      purchasePipeUpgrade(upgrade.upgradeType, upgrade.level, upgrade.price);
    }
  };

  const handleClose = () => {
    // Move to the next day
    nextDay();
  };

  return (
    <ScreenContainer>
      <Shop recipes={recipes} junkLicenses={junkLicenses} upgrades={upgrades} balance={balance} onBuy={handleBuy} onClose={handleClose} />
    </ScreenContainer>
  );
};
