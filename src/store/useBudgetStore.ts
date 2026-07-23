import { create } from "zustand";

interface BudgetStore {
  selectedMonth: number; // 1-12
  selectedYear: number;
  setSelectedMonth: (month: number, year: number) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
}

const now = new Date();

export const useBudgetStore = create<BudgetStore>((set, get) => ({
  selectedMonth: now.getMonth() + 1, // getMonth() est 0-indexé
  selectedYear: now.getFullYear(),

  setSelectedMonth: (month, year) =>
    set({ selectedMonth: month, selectedYear: year }),

  goToPreviousMonth: () => {
    const { selectedMonth, selectedYear } = get();
    if (selectedMonth === 1) {
      set({ selectedMonth: 12, selectedYear: selectedYear - 1 });
    } else {
      set({ selectedMonth: selectedMonth - 1 });
    }
  },

  goToNextMonth: () => {
    const { selectedMonth, selectedYear } = get();
    if (selectedMonth === 12) {
      set({ selectedMonth: 1, selectedYear: selectedYear + 1 });
    } else {
      set({ selectedMonth: selectedMonth + 1 });
    }
  },
}));
