import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

// Fait passer une dépense de "planifiee" à "realisee"
async function markExpenseAsDone(expenseId: string) {
  const today = new Date().toISOString().split("T")[0];
  const { error } = await supabase
    .from("expenses")
    .update({ status: "realisee", actual_date: today })
    .eq("id", expenseId);

  if (error) throw error;
}

async function deleteExpense(expenseId: string) {
  const { error } = await supabase.from("expenses").delete().eq("id", expenseId);
  if (error) throw error;
}

export function useMarkExpenseAsDone(month: number, year: number, budgetMonthId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markExpenseAsDone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monthly-summary", month, year] });
      queryClient.invalidateQueries({ queryKey: ["expenses-list", budgetMonthId] });
    },
  });
}

export function useDeleteExpense(month: number, year: number, budgetMonthId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monthly-summary", month, year] });
      queryClient.invalidateQueries({ queryKey: ["expenses-list", budgetMonthId] });
    },
  });
}
