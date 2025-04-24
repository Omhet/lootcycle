import { create } from "zustand";
import { EventBus } from "../game/EventBus";
import { LootItem } from "../lib/craft/craftModel";

interface CraftState {
  lastCraftedItem: LootItem | null;
  setLastCraftedItem: (item: LootItem) => void;
  clearLastCraftedItem: () => void;
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

    // Subscribe to the crafting-success event
    EventBus.on("crafting-success", handleCraftingSuccess);

    // No need to clean up since the store persists for the lifetime of the application
  };

  // Initialize event listeners immediately
  initEventListeners();

  return {
    lastCraftedItem: null,

    setLastCraftedItem: (item) => {
      set({ lastCraftedItem: item });
    },

    clearLastCraftedItem: () => {
      set({ lastCraftedItem: null });
    },

    // Expose the initialization function for potential reuse
    initEventListeners,
  };
});
