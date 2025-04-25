import { create } from "zustand";
import { EventBus } from "../game/EventBus";
import { LootItem } from "../lib/craft/craftModel";

interface CraftState {
  lastCraftedItem: LootItem | null;
  currentRecipeId: string | null;
  setLastCraftedItem: (item: LootItem) => void;
  clearLastCraftedItem: () => void;
  setCurrentRecipeId: (recipeId: string) => void;
  initEventListeners: () => void;
}

export const useCraftStore = create<CraftState>((set) => {
  // Initialize event listeners when the store is created
  const initEventListeners = () => {
    // Handler function for crafting-success event
    const handleCraftingSuccess = (item: LootItem) => {
      set({ lastCraftedItem: item });

      // Open the NewLootInfo screen
      EventBus.emit("open-screen", "newLootInfo");
    };

    // Handler for recipe selection updates from the game
    const handleRecipeSelected = (recipeId: string) => {
      set({ currentRecipeId: recipeId });
    };

    // Subscribe to events
    EventBus.on("crafting-success", handleCraftingSuccess);
    EventBus.on("recipe-selected", handleRecipeSelected);

    // No need to clean up since the store persists for the lifetime of the application
  };

  // Initialize event listeners immediately
  initEventListeners();

  return {
    lastCraftedItem: null,
    currentRecipeId: null,

    setLastCraftedItem: (item) => {
      set({ lastCraftedItem: item });
    },

    clearLastCraftedItem: () => {
      set({ lastCraftedItem: null });
    },

    setCurrentRecipeId: (recipeId) => {
      set({ currentRecipeId: recipeId });
    },

    // Expose the initialization function for potential reuse
    initEventListeners,
  };
});
