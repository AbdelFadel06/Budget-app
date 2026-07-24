import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { ExpenseStatus } from "../types";

interface NewExpenseInput {
  budgetMonthId: string;
  categoryId: string | null;
  label: string;
  amount: number;
  status: ExpenseStatus;
  plannedDate: string | null; // format "YYYY-MM-DD"
  isUnforeseen: boolean;
}

async function addExpense(input: NewExpenseInput) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Utilisateur non connecté");

  const { data, error } = await supabase
    .from("expenses")
    .insert({
      user_id: user.id,
      budget_month_id: input.budgetMonthId,
      category_id: input.categoryId,
      label: input.label,
      amount: input.amount,
      status: input.status,
      planned_date: input.plannedDate,
      actual_date: input.status === "realisee" ? input.plannedDate : null,
      is_unforeseen: input.isUnforeseen,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export function useAddExpense(month: number, year: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addExpense,
    onSuccess: () => {
      // Rafraîchit le solde, la liste des transactions et les totaux par catégorie
      queryClient.invalidateQueries({ queryKey: ["monthly-summary", month, year] });
      queryClient.invalidateQueries({ queryKey: ["expenses-list"] });
      queryClient.invalidateQueries({ queryKey: ["category-breakdown"] });
      queryClient.invalidateQueries({ queryKey: ["category-spending"] });
    },
  });
}
