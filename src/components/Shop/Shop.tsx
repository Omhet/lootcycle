import { useState } from "react";
import s from "./Shop.module.css";
import { RecipesTab } from "./RecipesTab";
import { EquipmentFix, RecipeCategory, Upgrade } from "./types";
import { UpgradesTab } from "./UpgradesTab";
import { EquipmentFixTab } from "./EquipmentFixTab";

type ShopProps = {
    recipes: RecipeCategory[];
    upgrades: Upgrade[];
    equipmentFixes: EquipmentFix[];
    balance: number;
    onBuy: (purchaseItemId: string) => void;
    onClose: () => void;
};

enum Tabs {
    RECIPES = "RECIPES",
    UPGRADES = "UPGRADES",
    EQUIPMENT_FIXES = "EQUIPMENT_FIXES",
}

export const Shop = ({
    recipes,
    upgrades,
    equipmentFixes,
    balance,
    onBuy,
    onClose,
}: ShopProps) => {
    const [selectedTab, setSelectedTab] = useState<Tabs>(Tabs.RECIPES);

    return (
        <div className={s.shopContainer}>
            <div className={s.shopHeader}>
                <span className={s.shopHeaderTitle}>Shop</span>
                <span>Balance: {balance}</span>
            </div>
            <div className={s.tabs}>
                <button
                    className={`${s.tab} ${
                        selectedTab === Tabs.RECIPES ? s.activeTab : ""
                    }`}
                    onClick={() => setSelectedTab(Tabs.RECIPES)}
                >
                    Recipes
                </button>
                <button
                    className={`${s.tab} ${
                        selectedTab === Tabs.UPGRADES ? s.activeTab : ""
                    }`}
                    onClick={() => setSelectedTab(Tabs.UPGRADES)}
                >
                    Upgrades
                </button>
                <button
                    className={`${s.tab} ${
                        selectedTab === Tabs.EQUIPMENT_FIXES ? s.activeTab : ""
                    }`}
                    onClick={() => setSelectedTab(Tabs.EQUIPMENT_FIXES)}
                >
                    Equipment Fixes
                </button>
            </div>
            {selectedTab === Tabs.RECIPES && (
                <RecipesTab
                    recipes={recipes}
                    onBuy={onBuy}
                    balance={balance}
                    onClose={onClose}
                />
            )}
            {selectedTab === Tabs.UPGRADES && (
                <UpgradesTab
                    upgrades={upgrades}
                    onBuy={onBuy}
                    balance={balance}
                    onClose={onClose}
                />
            )}
            {selectedTab === Tabs.EQUIPMENT_FIXES && (
                <EquipmentFixTab
                    equipmentFixes={equipmentFixes}
                    onBuy={onBuy}
                    balance={balance}
                    onClose={onClose}
                />
            )}
        </div>
    );
};
