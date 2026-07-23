import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

interface NewIncomeInput {
  budgetMonthId: string;
  label: string;
  amount: number;
  expectedDate: string | null; // "YYYY-MM-DD"
  alreadyReceived: boolean;
  isRecurring: boolean;
}

async function addIncome(input: NewIncomeInput) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Utilisateur non connecté");

  const { data, error } = await supabase
    .from("incomes")
    .insert({
      user_id: user.id,
      budget_month_id: input.budgetMonthId,
      label: input.label,
      amount: input.amount,
      expected_date: input.expectedDate,
      received_date: input.alreadyReceived ? input.expectedDate : null,
      is_recurring: input.isRecurring,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export function useAddIncome(month: number, year: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addIncome,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["monthly-summary", month, year],
      });
    },
  });
}
