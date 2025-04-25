import { useState } from "react";
import { JunkLicensesTab } from "./JunkLicenses";
import { RecipesTab } from "./RecipesTab";
import s from "./Shop.module.css";
import { JunkLicense, RecipeCategory, Upgrade } from "./types";
import { UpgradesTab } from "./UpgradesTab";

type ShopProps = {
  recipes: RecipeCategory[];
  upgrades: Upgrade[];
  junkLicenses: JunkLicense[];
  balance: number;
  onBuy: (purchaseItemId: string) => void;
  onClose: () => void;
};

enum Tabs {
  RECIPES = "RECIPES",
  JUNK_PIPE_UPGRADES = "JUNK_PIPE_UPGRADES",
  JUNK_LICENSES = "JUNK_LICENSES",
}

export const Shop = ({ recipes, upgrades, junkLicenses, balance, onBuy, onClose }: ShopProps) => {
  const [selectedTab, setSelectedTab] = useState<Tabs>(Tabs.RECIPES);

  return (
    <div className={s.background}>
      <div className={s.shopContainer}>
        <div className={s.shopHeader}>
          <span className={s.shopHeaderTitle}>Shop</span>
          <div className={s.moneyBalance}>
            <span className={s.moneyBalanceValue}>{balance}</span>
            <img className={s.coinImage} src="/assets/junk/golden_coin.png" />
          </div>
        </div>
        <div className={s.tabs}>
          <button className={`${s.tab} ${selectedTab === Tabs.RECIPES ? s.activeTab : ""}`} onClick={() => setSelectedTab(Tabs.RECIPES)}>
            Recipes
          </button>
          <button className={`${s.tab} ${selectedTab === Tabs.JUNK_PIPE_UPGRADES ? s.activeTab : ""}`} onClick={() => setSelectedTab(Tabs.JUNK_PIPE_UPGRADES)}>
            Junk Pipe Upgrades
          </button>
          <button className={`${s.tab} ${selectedTab === Tabs.JUNK_LICENSES ? s.activeTab : ""}`} onClick={() => setSelectedTab(Tabs.JUNK_LICENSES)}>
            Junk Licenses
          </button>
        </div>
        {selectedTab === Tabs.RECIPES && <RecipesTab recipes={recipes} onBuy={onBuy} balance={balance} onClose={onClose} />}
        {selectedTab === Tabs.JUNK_PIPE_UPGRADES && <UpgradesTab upgrades={upgrades} onBuy={onBuy} balance={balance} onClose={onClose} />}
        {selectedTab === Tabs.JUNK_LICENSES && <JunkLicensesTab junkLicenses={junkLicenses} onBuy={onBuy} balance={balance} onClose={onClose} />}
      </div>
    </div>
  );
};
