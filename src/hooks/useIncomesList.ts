import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { Income } from "../types";

async function fetchIncomes(budgetMonthId: string): Promise<Income[]> {
  const { data, error } = await supabase
    .from("incomes")
    .select("*")
    .eq("budget_month_id", budgetMonthId)
    .order("expected_date", { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data ?? [];
}

export function useIncomesList(budgetMonthId: string | undefined) {
  return useQuery({
    queryKey: ["incomes-list", budgetMonthId],
    queryFn: () => fetchIncomes(budgetMonthId!),
    enabled: !!budgetMonthId,
  });
}
