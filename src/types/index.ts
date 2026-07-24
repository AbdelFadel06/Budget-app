// Types alignés sur le schéma SQL (supabase_schema.sql)

export type CategoryType = "utile" | "plaisir";
export type ExpenseStatus = "planifiee" | "realisee" | "annulee";

export interface BudgetMonth {
  id: string;
  user_id: string;
  month: number; // 1-12
  year: number;
  unforeseen_envelope: number;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: CategoryType;
  monthly_budget: number | null;
  icon: string | null;
  created_at: string;
}

export interface Income {
  id: string;
  user_id: string;
  budget_month_id: string;
  label: string;
  amount: number;
  expected_date: string | null;
  received_date: string | null;
  is_recurring: boolean;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  budget_month_id: string;
  category_id: string | null;
  label: string;
  amount: number;
  status: ExpenseStatus;
  planned_date: string | null;
  actual_date: string | null;
  is_recurring: boolean;
  is_unforeseen: boolean;
  created_at: string;
}

// Correspond exactement aux colonnes de la vue `monthly_summary`
export interface MonthlySummary {
  budget_month_id: string;
  user_id: string;
  month: number;
  year: number;
  unforeseen_envelope: number;
  revenus_recus: number;
  revenus_attendus: number;
  depenses_realisees: number;
  depenses_planifiees: number;
  imprevus_utilises: number;
  solde_reel: number;
  solde_disponible: number;
}
