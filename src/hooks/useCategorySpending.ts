import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

async function fetchCategorySpending(
  budgetMonthId: string
): Promise<Map<string, number>> {
  const { data, error } = await supabase
    .from("expenses")
    .select("category_id, amount")
    .eq("budget_month_id", budgetMonthId)
    .eq("status", "realisee");

  if (error) throw error;

  const totals = new Map<string, number>();
  for (const row of data ?? []) {
    if (!row.category_id) continue;
    totals.set(row.category_id, (totals.get(row.category_id) ?? 0) + row.amount);
  }
  return totals;
}

export function useCategorySpending(budgetMonthId: string | undefined) {
  return useQuery({
    queryKey: ["category-spending", budgetMonthId],
    queryFn: () => fetchCategorySpending(budgetMonthId!),
    enabled: !!budgetMonthId,
  });
}
