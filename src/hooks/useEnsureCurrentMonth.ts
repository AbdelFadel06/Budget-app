import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { BudgetMonth } from "../types";

async function ensureCurrentMonthExists(
  month: number,
  year: number
): Promise<BudgetMonth> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("Utilisateur non connecté");

  // 1. Vérifie si le mois existe déjà
  const { data: existing, error: fetchError } = await supabase
    .from("budget_months")
    .select("*")
    .eq("month", month)
    .eq("year", year)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (existing) return existing;

  // 2. Sinon, on le crée
  const { data: created, error: insertError } = await supabase
    .from("budget_months")
    .insert({
      user_id: user.id,
      month,
      year,
      unforeseen_envelope: 0,
    })
    .select()
    .single();

  if (insertError) throw insertError;
  return created;
}

export function useEnsureCurrentMonth(month: number, year: number) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["ensure-month", month, year],
    queryFn: async () => {
      const result = await ensureCurrentMonthExists(month, year);
      // Une fois le mois garanti, on rafraîchit le résumé mensuel
      queryClient.invalidateQueries({
        queryKey: ["monthly-summary", month, year],
      });
      return result;
    },
    staleTime: Infinity, // pas besoin de re-vérifier sans cesse dans la session
  });
}
