-- ============================================================
-- SCHEMA : App de gestion de budget mensuel
-- A exécuter dans Supabase > SQL Editor (sur un projet neuf)
-- ============================================================

-- ---------- Types énumérés ----------
create type category_type as enum ('utile', 'plaisir');
create type expense_status as enum ('planifiee', 'realisee', 'annulee');

-- ---------- Table : budget_months ----------
-- Un enregistrement par mois par utilisateur
create table budget_months (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month int not null check (month between 1 and 12),
  year int not null,
  unforeseen_envelope numeric(12,2) not null default 0, -- montant provisionné pour les imprévus
  created_at timestamptz not null default now(),
  unique (user_id, month, year)
);

-- ---------- Table : categories ----------
-- Catégories personnalisées de l'utilisateur (Courses, Loyer, Sorties, etc.)
create table categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type category_type not null,
  monthly_budget numeric(12,2), -- optionnel : plafond alloué pour cette catégorie
  icon text, -- nom d'icône Ionicons choisi dans l'app (nullable, icône par défaut sinon)
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

-- ---------- Table : incomes ----------
create table incomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  budget_month_id uuid not null references budget_months(id) on delete cascade,
  label text not null,
  amount numeric(12,2) not null check (amount >= 0),
  expected_date date,
  received_date date, -- null tant que non reçu
  is_recurring boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- Table : expenses ----------
create table expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  budget_month_id uuid not null references budget_months(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  label text not null,
  amount numeric(12,2) not null check (amount >= 0),
  status expense_status not null default 'planifiee',
  planned_date date,
  actual_date date, -- rempli seulement quand status = 'realisee'
  is_recurring boolean not null default false,
  is_unforeseen boolean not null default false, -- true = tirée de l'enveloppe imprévu
  created_at timestamptz not null default now()
);

-- ---------- Index utiles ----------
create index idx_expenses_month on expenses(budget_month_id);
create index idx_incomes_month on incomes(budget_month_id);
create index idx_expenses_status on expenses(status);

-- ============================================================
-- SECURITE : Row Level Security (chacun ne voit que ses données)
-- ============================================================

alter table budget_months enable row level security;
alter table categories enable row level security;
alter table incomes enable row level security;
alter table expenses enable row level security;

create policy "budget_months_owner" on budget_months
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "categories_owner" on categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "incomes_owner" on incomes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "expenses_owner" on expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- VUE : Résumé mensuel (le cœur du dashboard)
-- ============================================================
-- Calcule automatiquement : revenus reçus, dépenses réalisées,
-- dépenses planifiées, et le fameux "solde disponible".
--
-- Deux protections importantes (ajoutées après coup suite à un bug) :
--   1. security_invoker = true -> la vue respecte le RLS de l'appelant
--      au lieu de s'exécuter avec les droits du propriétaire (postgres),
--      qui contournait le RLS et exposait les données de tous les
--      utilisateurs.
--   2. incomes et expenses sont agrégés séparément dans des sous-requêtes
--      avant d'être joints à budget_months, pour éviter un produit
--      croisé (fan-out) qui multipliait les totaux quand un mois avait
--      plusieurs revenus ET plusieurs dépenses.

create or replace view monthly_summary
with (security_invoker = true)
as
select
  bm.id as budget_month_id,
  bm.user_id,
  bm.month,
  bm.year,
  bm.unforeseen_envelope,

  coalesce(inc.revenus_recus, 0) as revenus_recus,
  coalesce(inc.revenus_attendus, 0) as revenus_attendus,

  coalesce(exp.depenses_realisees, 0) as depenses_realisees,
  coalesce(exp.depenses_planifiees, 0) as depenses_planifiees,
  coalesce(exp.imprevus_utilises, 0) as imprevus_utilises,

  -- Solde réel = ce que tu as vraiment sur ton compte en ce moment
  coalesce(inc.revenus_recus, 0) - coalesce(exp.depenses_realisees, 0) as solde_reel,

  -- Solde disponible = ce qu'il te reste une fois TOUT ce qui est déjà engagé retiré
  coalesce(inc.revenus_recus, 0)
    - coalesce(exp.depenses_realisees, 0)
    - coalesce(exp.depenses_planifiees, 0) as solde_disponible

from budget_months bm

left join (
  select
    budget_month_id,
    sum(amount) filter (where received_date is not null) as revenus_recus,
    sum(amount) filter (where received_date is null) as revenus_attendus
  from incomes
  group by budget_month_id
) inc on inc.budget_month_id = bm.id

left join (
  select
    budget_month_id,
    sum(amount) filter (where status = 'realisee') as depenses_realisees,
    sum(amount) filter (where status = 'planifiee') as depenses_planifiees,
    sum(amount) filter (where status = 'realisee' and is_unforeseen) as imprevus_utilises
  from expenses
  group by budget_month_id
) exp on exp.budget_month_id = bm.id

where bm.user_id = auth.uid();
