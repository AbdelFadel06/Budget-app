import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { Expense } from "../types";

async function fetchExpenses(budgetMonthId: string): Promise<Expense[]> {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("budget_month_id", budgetMonthId)
    .order("planned_date", { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data ?? [];
}

export function useExpensesList(budgetMonthId: string | undefined) {
  return useQuery({
    queryKey: ["expenses-list", budgetMonthId],
    queryFn: () => fetchExpenses(budgetMonthId!),
    enabled: !!budgetMonthId,
  });
}
