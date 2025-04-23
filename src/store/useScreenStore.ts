import { create } from "zustand";

// Screen IDs enum to ensure type safety and consistency
export enum ScreenId {
  None = "none",
  DayStart = "dayStart",
  NewLootInfo = "newLootInfo",
  Stall = "stall",
  DayEnd = "dayEnd",
  Shop = "shop",
}

// Store state interface
interface ScreenState {
  currentOpenedScreenId: ScreenId;
  openScreen: (screenId: ScreenId) => void;
  closeScreen: () => void;
}

// Create the store
export const useScreenStore = create<ScreenState>((set) => ({
  currentOpenedScreenId: ScreenId.None,

  openScreen: (screenId) => {
    set({ currentOpenedScreenId: screenId });
  },

  closeScreen: () => {
    set({ currentOpenedScreenId: ScreenId.None });
  },
}));
