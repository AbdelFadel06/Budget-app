import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export interface CategoryBreakdownItem {
  categoryName: string;
  categoryType: "utile" | "plaisir" | "sans_categorie";
  total: number;
}

async function fetchCategoryBreakdown(
  budgetMonthId: string
): Promise<CategoryBreakdownItem[]> {
  const { data, error } = await supabase
    .from("expenses")
    .select("amount, category:categories(name, type)")
    .eq("budget_month_id", budgetMonthId)
    .eq("status", "realisee");

  if (error) throw error;

  // Regroupe les montants par nom de catégorie
  const totals = new Map<string, CategoryBreakdownItem>();

  for (const row of data ?? []) {
    const category = row.category as unknown as
      | { name: string; type: "utile" | "plaisir" }
      | null;

    const key = category?.name ?? "Sans catégorie";
    const existing = totals.get(key);

    if (existing) {
      existing.total += row.amount;
    } else {
      totals.set(key, {
        categoryName: key,
        categoryType: category?.type ?? "sans_categorie",
        total: row.amount,
      });
    }
  }

  return Array.from(totals.values()).sort((a, b) => b.total - a.total);
}

export function useCategoryBreakdown(budgetMonthId: string | undefined) {
  return useQuery({
    queryKey: ["category-breakdown", budgetMonthId],
    queryFn: () => fetchCategoryBreakdown(budgetMonthId!),
    enabled: !!budgetMonthId,
  });
}
