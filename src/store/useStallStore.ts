import { create } from "zustand";
import { EventBus } from "../game/EventBus";
import { LootItem } from "../lib/craft/craftModel";

interface StallState {
  craftedLootItems: LootItem[];
  addCraftedLootItem: (item: LootItem) => void;
  clearCraftedLootItems: () => void;
  initEventListeners: () => void;
}

export const useStallStore = create<StallState>((set) => {
  // Initialize event listeners when the store is created
  const initEventListeners = () => {
    // Handler function for add-crafted-item event
    const handleAddCraftedItem = (item: LootItem) => {
      set((state) => ({
        craftedLootItems: [...state.craftedLootItems, item],
      }));
    };

    // Subscribe to the add-crafted-item event
    EventBus.on("add-crafted-item", handleAddCraftedItem);

    // No need to clean up since the store persists for the lifetime of the application
    // If cleanup is needed in the future, we would return a cleanup function
  };

  // Initialize event listeners immediately
  initEventListeners();

  return {
    craftedLootItems: [],

    addCraftedLootItem: (item) => {
      set((state) => ({
        craftedLootItems: [...state.craftedLootItems, item],
      }));
    },

    clearCraftedLootItems: () => {
      set({ craftedLootItems: [] });
    },

    // Expose the initialization function for potential reuse or manual triggering
    initEventListeners,
  };
});
