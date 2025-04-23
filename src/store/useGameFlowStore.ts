import { create } from "zustand";
import { ScreenId, useScreenStore } from "./useScreenStore";

// Game state enum
export enum GameState {
  None = "none",
  DayStart = "dayStart",
  DayInProgress = "dayInProgress",
  DayEnd = "dayEnd",
  Shop = "shop",
}

// Store state interface
interface GameFlowState {
  // Current game state
  currentState: GameState;
  // Whether a game cycle is running
  isGameInProgress: boolean;
  // Current day number
  currentDay: number;

  // Actions
  startGame: () => void;
  startDay: () => void;
  endDay: () => void;
  goToShop: () => void;
  nextDay: () => void;
  resetGame: () => void;
}

// Create the store
export const useGameFlowStore = create<GameFlowState>((set) => ({
  currentState: GameState.None,
  isGameInProgress: false,
  currentDay: 1,

  startGame: () => {
    set(() => ({
      currentState: GameState.DayStart,
      isGameInProgress: true,
      currentDay: 1,
    }));
    // Open the DayStart screen
    useScreenStore.getState().openScreen(ScreenId.DayStart);
  },

  startDay: () => {
    set(() => ({ currentState: GameState.DayInProgress }));
    // Close any open screens
    useScreenStore.getState().closeScreen();
  },

  endDay: () => {
    set(() => ({ currentState: GameState.DayEnd }));
    // Open the DayEnd screen
    useScreenStore.getState().openScreen(ScreenId.DayEnd);
  },

  goToShop: () => {
    set(() => ({ currentState: GameState.Shop }));
    // Open the Shop screen
    useScreenStore.getState().openScreen(ScreenId.Shop);
  },

  nextDay: () => {
    set((state) => ({
      currentState: GameState.DayStart,
      currentDay: state.currentDay + 1,
    }));
    // Open the DayStart screen
    useScreenStore.getState().openScreen(ScreenId.DayStart);
  },

  resetGame: () => {
    set(() => ({
      currentState: GameState.None,
      isGameInProgress: false,
      currentDay: 1,
    }));
    // Close any open screens
    useScreenStore.getState().closeScreen();
  },
}));
