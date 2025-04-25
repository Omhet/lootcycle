import { create } from "zustand";
import { EventBus } from "../game/EventBus";
import { useGameFlowStore } from "./useGameFlowStore";

// Define the statistics that we want to track for each day
export interface DayStatistics {
  junkRecycled: number;
  junkBurnt: number;
  lootCrafted: number;
  lootScrewedUp: number;
  profit: number;
  junkReceived: number;
  // Derived statistic: how much junk is left at the end of the day
  readonly junkLeft: number;
}

// Default/empty statistics for a new day
export const defaultDayStatistics: DayStatistics = {
  junkRecycled: 0,
  junkBurnt: 0,
  lootCrafted: 0,
  lootScrewedUp: 0,
  profit: 0,
  junkReceived: 0,
  // Getter for the derived statistic
  get junkLeft() {
    return this.junkReceived - (this.junkRecycled + this.junkBurnt);
  },
};

interface StatisticsState {
  // Statistics mapped by day number
  statisticsByDay: Record<number, DayStatistics>;

  // Actions
  incrementJunkRecycled: (amount?: number) => void;
  incrementJunkBurnt: (amount?: number) => void;
  incrementLootCrafted: (amount?: number) => void;
  incrementLootScrewedUp: (amount?: number) => void;
  incrementJunkReceived: (amount?: number) => void;
  addProfit: (amount: number) => void;

  // Get statistics for a specific day
  getDayStatistics: (day: number) => DayStatistics;

  // Initialize day statistics
  initDayStatistics: (day: number) => void;

  // Reset statistics for all days
  resetAllStatistics: () => void;

  // Initialize event listeners
  initEventListeners: () => void;
}

export const useStatisticsStore = create<StatisticsState>((set, get) => {
  // Initialize event listeners when the store is created
  const initEventListeners = () => {
    // Handle junk recycled event
    const handleJunkRecycled = (amount = 1) => {
      get().incrementJunkRecycled(amount);
    };

    // Handle junk burnt event
    const handleJunkBurnt = (amount = 1) => {
      get().incrementJunkBurnt(amount);
    };

    // Handle loot crafted event
    const handleLootCrafted = (amount = 1) => {
      get().incrementLootCrafted(amount);
    };

    // Handle loot screwed up event
    const handleLootScrewedUp = (amount = 1) => {
      get().incrementLootScrewedUp(amount);
    };

    // Handle junk received event
    const handleJunkReceived = (amount = 1) => {
      get().incrementJunkReceived(amount);
    };

    // Subscribe to events
    EventBus.on("junk-recycled", handleJunkRecycled);
    EventBus.on("junk-burnt", handleJunkBurnt);
    EventBus.on("loot-crafted", handleLootCrafted);
    EventBus.on("loot-screwed-up", handleLootScrewedUp);
    EventBus.on("junk-received", handleJunkReceived);

    // No need to clean up since the store persists for the lifetime of the application
  };

  // Helper to get current day from gameFlowStore
  const getCurrentDay = () => useGameFlowStore.getState().currentDay;

  // Initialize event listeners immediately
  initEventListeners();

  return {
    statisticsByDay: {},

    incrementJunkRecycled: (amount = 1) => {
      const currentDay = getCurrentDay();
      set((state) => {
        const currentStats = state.statisticsByDay[currentDay] || { ...defaultDayStatistics };
        return {
          statisticsByDay: {
            ...state.statisticsByDay,
            [currentDay]: {
              ...currentStats,
              junkRecycled: currentStats.junkRecycled + amount,
            },
          },
        };
      });
    },

    incrementJunkBurnt: (amount = 1) => {
      const currentDay = getCurrentDay();
      set((state) => {
        const currentStats = state.statisticsByDay[currentDay] || { ...defaultDayStatistics };
        return {
          statisticsByDay: {
            ...state.statisticsByDay,
            [currentDay]: {
              ...currentStats,
              junkBurnt: currentStats.junkBurnt + amount,
            },
          },
        };
      });
    },

    incrementLootCrafted: (amount = 1) => {
      const currentDay = getCurrentDay();
      set((state) => {
        const currentStats = state.statisticsByDay[currentDay] || { ...defaultDayStatistics };
        return {
          statisticsByDay: {
            ...state.statisticsByDay,
            [currentDay]: {
              ...currentStats,
              lootCrafted: currentStats.lootCrafted + amount,
            },
          },
        };
      });
    },

    incrementLootScrewedUp: (amount = 1) => {
      const currentDay = getCurrentDay();
      set((state) => {
        const currentStats = state.statisticsByDay[currentDay] || { ...defaultDayStatistics };
        return {
          statisticsByDay: {
            ...state.statisticsByDay,
            [currentDay]: {
              ...currentStats,
              lootScrewedUp: currentStats.lootScrewedUp + amount,
            },
          },
        };
      });
    },

    incrementJunkReceived: (amount = 1) => {
      const currentDay = getCurrentDay();
      set((state) => {
        const currentStats = state.statisticsByDay[currentDay] || { ...defaultDayStatistics };
        return {
          statisticsByDay: {
            ...state.statisticsByDay,
            [currentDay]: {
              ...currentStats,
              junkReceived: currentStats.junkReceived + amount,
            },
          },
        };
      });
    },

    addProfit: (amount) => {
      const currentDay = getCurrentDay();
      set((state) => {
        const currentStats = state.statisticsByDay[currentDay] || { ...defaultDayStatistics };
        return {
          statisticsByDay: {
            ...state.statisticsByDay,
            [currentDay]: {
              ...currentStats,
              profit: currentStats.profit + amount,
            },
          },
        };
      });
    },

    getDayStatistics: (day) => {
      const stats = get().statisticsByDay[day] || { ...defaultDayStatistics };

      // Calculate junkLeft manually here to ensure it's always correct
      const junkLeft = stats.junkReceived - (stats.junkRecycled + stats.junkBurnt);

      return {
        ...stats,
        junkLeft,
      };
    },

    initDayStatistics: (day) => {
      set((state) => {
        // Only initialize if not already present
        if (!state.statisticsByDay[day]) {
          return {
            statisticsByDay: {
              ...state.statisticsByDay,
              [day]: { ...defaultDayStatistics },
            },
          };
        }
        return state;
      });
    },

    resetAllStatistics: () => {
      set({ statisticsByDay: {} });
    },

    // Expose the initialization function for potential reuse
    initEventListeners,
  };
});
