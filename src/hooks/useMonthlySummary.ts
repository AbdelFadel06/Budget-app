import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { MonthlySummary } from "../types";

async function fetchMonthlySummary(
  month: number,
  year: number
): Promise<MonthlySummary | null> {
  const { data, error } = await supabase
    .from("monthly_summary")
    .select("*")
    .eq("month", month)
    .eq("year", year)
    .maybeSingle(); // renvoie null si le mois n'existe pas encore (au lieu de planter)

  if (error) throw error;
  return data;
}

export function useMonthlySummary(month: number, year: number) {
  return useQuery({
    queryKey: ["monthly-summary", month, year],
    queryFn: () => fetchMonthlySummary(month, year),
  });
}
