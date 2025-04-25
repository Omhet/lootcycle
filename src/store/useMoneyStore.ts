import { create } from "zustand";
import { EventBus } from "../game/EventBus";

interface MoneyState {
  balance: number;
  addMoney: (amount: number) => void;
  subtractMoney: (amount: number) => void;
  setBalance: (amount: number) => void;
  initEventListeners: () => void;
}

export const useMoneyStore = create<MoneyState>((set) => {
  // Initialize event listeners when the store is created
  const initEventListeners = () => {
    // Handler function for money-earned event
    const handleMoneyEarned = (amount: number) => {
      set((state) => ({
        balance: state.balance + amount,
      }));
    };

    // Handler function for money-spent event
    const handleMoneySpent = (amount: number) => {
      set((state) => ({
        balance: Math.max(0, state.balance - amount),
      }));
    };

    // Subscribe to money events
    EventBus.on("money-earned", handleMoneyEarned);
    EventBus.on("money-spent", handleMoneySpent);

    // No need to clean up since the store persists for the lifetime of the application
  };

  // Initialize event listeners immediately
  initEventListeners();

  return {
    balance: 500,

    addMoney: (amount) => {
      if (amount <= 0) return;
      set((state) => ({
        balance: state.balance + amount,
      }));
    },

    subtractMoney: (amount) => {
      if (amount <= 0) return;
      set((state) => ({
        balance: Math.max(0, state.balance - amount),
      }));
    },

    setBalance: (amount) => {
      if (amount < 0) return;
      set({ balance: amount });
    },

    // Expose the initialization function for potential reuse or manual triggering
    initEventListeners,
  };
});
