import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { CategoryType } from "../types";

interface NewCategoryInput {
  name: string;
  type: CategoryType;
  monthlyBudget: number | null;
}

async function addCategory(input: NewCategoryInput) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Utilisateur non connecté");

  const { data, error } = await supabase
    .from("categories")
    .insert({
      user_id: user.id,
      name: input.name,
      type: input.type,
      monthly_budget: input.monthlyBudget,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export function useAddCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
