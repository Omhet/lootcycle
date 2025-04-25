import { create } from "zustand";
import { EventBus } from "../game/EventBus";
import { JunkPipeUpgradeType } from "../lib/shop/config";
import { useMoneyStore } from "./useMoneyStore";
import { useStatisticsStore } from "./useStatisticsStore";

interface PlayerProgressState {
  // Recipes purchased by the player
  purchasedRecipes: string[];
  // Junk licenses purchased by the player
  purchasedJunkLicenses: string[];
  // Junk pipe upgrade levels (by upgrade type)
  junkPipeUpgradeLevels: Record<string, number>;

  // Actions
  purchaseRecipe: (recipeId: string, price: number) => boolean;
  purchaseJunkLicense: (junkId: string, price: number) => boolean;
  purchasePipeUpgrade: (upgradeType: string, level: number, price: number) => boolean;

  // Getters
  hasRecipe: (recipeId: string) => boolean;
  hasJunkLicense: (junkId: string) => boolean;
  getPipeUpgradeLevel: (upgradeType: string) => number;

  // Reset player progress
  resetProgress: () => void;

  // Initialize event listeners
  initEventListeners: () => void;
}

export const usePlayerProgressStore = create<PlayerProgressState>((set, get) => {
  // Initialize event listeners when the store is created
  const initEventListeners = () => {
    // Handle shop purchase event
    const handleShopPurchase = (purchaseData: {
      type: "recipe" | "junk-license" | "pipe-upgrade";
      id: string;
      price: number;
      level?: number;
      upgradeType?: string;
    }) => {
      const { type, id, price } = purchaseData;

      if (type === "recipe") {
        get().purchaseRecipe(id, price);
      } else if (type === "junk-license") {
        get().purchaseJunkLicense(id, price);
      } else if (type === "pipe-upgrade" && purchaseData.upgradeType && purchaseData.level !== undefined) {
        get().purchasePipeUpgrade(purchaseData.upgradeType, purchaseData.level, price);
      }
    };

    // Subscribe to shop purchase events
    EventBus.on("shop-purchase", handleShopPurchase);
  };

  // Initialize event listeners immediately
  initEventListeners();

  return {
    purchasedRecipes: ["axe"],
    purchasedJunkLicenses: ["bone"],
    junkPipeUpgradeLevels: {
      [JunkPipeUpgradeType.PORTION_SIZE]: 0,
      [JunkPipeUpgradeType.NEXT_PORTION_PERCENT]: 0,
      [JunkPipeUpgradeType.FLUFF_RATIO]: 0,
    },

    purchaseRecipe: (recipeId, price) => {
      const moneyStore = useMoneyStore.getState();

      // Check if player can afford the recipe
      if (moneyStore.balance < price) {
        return false;
      }

      // Check if recipe is already purchased
      if (get().hasRecipe(recipeId)) {
        return false;
      }

      // Deduct money
      moneyStore.subtractMoney(price);

      // Add recipe to purchased list
      set((state) => ({
        purchasedRecipes: [...state.purchasedRecipes, recipeId],
      }));

      // Add to statistics
      useStatisticsStore.getState().addProfit(-price);

      // Emit event for other systems to react
      EventBus.emit("recipe-purchased", recipeId);

      return true;
    },

    purchaseJunkLicense: (junkId, price) => {
      const moneyStore = useMoneyStore.getState();

      // Check if player can afford the license
      if (moneyStore.balance < price) {
        return false;
      }

      // Check if license is already purchased
      if (get().hasJunkLicense(junkId)) {
        return false;
      }

      // Deduct money
      moneyStore.subtractMoney(price);

      // Add license to purchased list
      set((state) => ({
        purchasedJunkLicenses: [...state.purchasedJunkLicenses, junkId],
      }));

      // Add to statistics
      useStatisticsStore.getState().addProfit(-price);

      // Emit event for other systems to react
      EventBus.emit("junk-license-purchased", junkId);

      return true;
    },

    purchasePipeUpgrade: (upgradeType, level, price) => {
      const moneyStore = useMoneyStore.getState();

      // Check if player can afford the upgrade
      if (moneyStore.balance < price) {
        return false;
      }

      // Check if current level is one less than requested level
      const currentLevel = get().getPipeUpgradeLevel(upgradeType);
      if (currentLevel !== level - 1) {
        return false; // Can't skip levels
      }

      // Deduct money
      moneyStore.subtractMoney(price);

      // Update upgrade level
      set((state) => ({
        junkPipeUpgradeLevels: {
          ...state.junkPipeUpgradeLevels,
          [upgradeType]: level,
        },
      }));

      // Add to statistics
      useStatisticsStore.getState().addProfit(-price);

      // Emit event for other systems to react
      EventBus.emit("pipe-upgrade-purchased", { upgradeType, level });

      return true;
    },

    hasRecipe: (recipeId) => {
      return get().purchasedRecipes.includes(recipeId);
    },

    hasJunkLicense: (junkId) => {
      return get().purchasedJunkLicenses.includes(junkId);
    },

    getPipeUpgradeLevel: (upgradeType) => {
      return get().junkPipeUpgradeLevels[upgradeType] ?? 0;
    },

    resetProgress: () => {
      set({
        purchasedRecipes: ["axe"],
        purchasedJunkLicenses: ["bone"],
        junkPipeUpgradeLevels: {
          [JunkPipeUpgradeType.PORTION_SIZE]: 0,
          [JunkPipeUpgradeType.NEXT_PORTION_PERCENT]: 0,
          [JunkPipeUpgradeType.FLUFF_RATIO]: 0,
        },
      });
    },

    initEventListeners,
  };
});
