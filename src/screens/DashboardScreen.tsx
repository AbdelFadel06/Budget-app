import { useMemo, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import { useBudgetStore } from "../store/useBudgetStore";
import { useMonthlySummary } from "../hooks/useMonthlySummary";
import { useEnsureCurrentMonth } from "../hooks/useEnsureCurrentMonth";
import { useExpensesList } from "../hooks/useExpensesList";
import { useCategories } from "../hooks/useCategories";
import { supabase } from "../lib/supabase";
import AddExpenseForm from "../components/AddExpenseForm";
import AddIncomeForm from "../components/AddIncomeForm";
import CategoryChart from "../components/CategoryChart";
import CategoryIconRing from "../components/CategoryIconRing";
import ProfileMenu from "../components/ProfileMenu";
import { resolveCategoryIcon, type CategoryIconName } from "../utils/categoryIcons";
import { MONTH_NAMES } from "../utils/months";

const HERO_GREEN = "#16a34a";

export default function DashboardScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { selectedMonth, selectedYear, goToPreviousMonth, goToNextMonth } =
    useBudgetStore();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddIncome, setShowAddIncome] = useState(false);

  const { data: budgetMonth } = useEnsureCurrentMonth(
    selectedMonth,
    selectedYear
  );

  const { data, isLoading, error } = useMonthlySummary(
    selectedMonth,
    selectedYear
  );

  const { data: expenses } = useExpensesList(budgetMonth?.id);
  const { data: categories } = useCategories();

  const categoryMap = useMemo(
    () => new Map((categories ?? []).map((c) => [c.id, c])),
    [categories]
  );

  const realizedExpenses = useMemo(
    () =>
      (expenses ?? [])
        .filter((e) => e.status === "realisee")
        .sort((a, b) => (b.actual_date ?? "").localeCompare(a.actual_date ?? "")),
    [expenses]
  );

  function handleSignOut() {
    supabase.auth.signOut();
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.topSafeArea}>
      {isFocused && <StatusBar style="light" />}
      <View style={styles.root}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Bandeau vert — toujours visible, même en chargement */}
        <View style={styles.hero}>
          <View style={styles.heroTopRow}>
            <ProfileMenu onSignOut={handleSignOut} />

            <View style={styles.monthSelector}>
              <Pressable onPress={goToPreviousMonth} style={styles.monthArrow}>
                <Ionicons name="chevron-back" size={22} color="#fff" />
              </Pressable>
              <Text style={styles.monthLabel}>
                {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
              </Text>
              <Pressable onPress={goToNextMonth} style={styles.monthArrow}>
                <Ionicons name="chevron-forward" size={22} color="#fff" />
              </Pressable>
            </View>
          </View>

          <Text style={styles.balanceLabel}>Solde disponible</Text>
          <Text style={styles.balanceValue}>
            {data ? `${data.solde_disponible.toLocaleString()} F` : "—"}
          </Text>

          {data && (
            <View style={styles.miniStatsRow}>
              <View style={styles.miniStat}>
                <View style={styles.miniStatIcon}>
                  <Ionicons name="arrow-up-circle" size={18} color="#fff" />
                </View>
                <View>
                  <Text style={styles.miniStatLabel}>Revenus</Text>
                  <Text style={styles.miniStatValue}>
                    {data.revenus_recus.toLocaleString()} F
                  </Text>
                </View>
              </View>
              <View style={styles.miniStat}>
                <View style={styles.miniStatIcon}>
                  <Ionicons name="arrow-down-circle" size={18} color="#fff" />
                </View>
                <View>
                  <Text style={styles.miniStatLabel}>Dépenses</Text>
                  <Text style={styles.miniStatValue}>
                    {data.depenses_realisees.toLocaleString()} F
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Feuille claire — remplit tout l'espace restant pour qu'il n'y ait jamais de vert visible en bas */}
        <View style={[styles.sheet, { flexGrow: 1, paddingBottom: 120 }]}>
          {isLoading && (
            <View style={styles.centered}>
              <ActivityIndicator size="large" />
            </View>
          )}

          {error && (
            <View style={styles.centered}>
              <Text style={styles.errorText}>
                Erreur : {(error as Error).message}
              </Text>
            </View>
          )}

          {!isLoading && !error && !data && (
            <View style={styles.centered}>
              <Text style={styles.emptyText}>
                Aucun budget trouvé pour ce mois.
              </Text>
            </View>
          )}

          {data && (
            <>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Solde réel</Text>
                  <Text style={styles.detailValue}>
                    {data.solde_reel.toLocaleString()} F
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Revenus</Text>
                  <Text style={styles.detailValue}>
                    {data.revenus_recus.toLocaleString()} F
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Dépenses</Text>
                  <Text style={styles.detailValue}>
                    {data.depenses_realisees.toLocaleString()} F
                  </Text>
                </View>
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Dépenses réalisées</Text>
                <Pressable
                  onPress={() => (navigation as any).navigate("Transactions")}
                >
                  <Text style={styles.sectionLink}>Voir tout</Text>
                </Pressable>
              </View>

              {realizedExpenses.length === 0 ? (
                <Text style={styles.emptyText}>
                  Aucune dépense réalisée ce mois-ci.
                </Text>
              ) : (
                realizedExpenses.slice(0, 5).map((expense) => {
                  const category = expense.category_id
                    ? categoryMap.get(expense.category_id)
                    : undefined;
                  const icon: CategoryIconName = category
                    ? resolveCategoryIcon(category.icon, category.type)
                    : "pricetag-outline";

                  return (
                    <View key={expense.id} style={styles.expenseRow}>
                      <CategoryIconRing icon={icon} percent={null} size={36} />
                      <View style={styles.expenseInfo}>
                        <Text style={styles.expenseLabel}>{expense.label}</Text>
                        <Text style={styles.expenseMeta}>
                          {category?.name ?? "Sans catégorie"}
                          {expense.actual_date
                            ? ` · ${dayjs(expense.actual_date).format("DD/MM")}`
                            : ""}
                        </Text>
                      </View>
                      <Text style={styles.expenseAmount}>
                        -{expense.amount.toLocaleString()} F
                      </Text>
                    </View>
                  );
                })
              )}

              <CategoryChart budgetMonthId={budgetMonth?.id} />
            </>
          )}
        </View>
      </ScrollView>

      <View style={styles.fabRow}>
        <Pressable
          style={[styles.fab, styles.fabIncome]}
          onPress={() => setShowAddIncome(true)}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.fabText}>Revenu</Text>
        </Pressable>
        <Pressable style={styles.fab} onPress={() => setShowAddExpense(true)}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.fabText}>Dépense</Text>
        </Pressable>
      </View>

      <Modal visible={showAddExpense} animationType="slide">
        {/* RN Modal mounts outside the app's view tree, donc on lui redonne
            son propre contexte de safe-area pour que le padding et le
            bouton Fermer restent fiables. */}
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
            <Pressable
              style={styles.closeButton}
              onPress={() => setShowAddExpense(false)}
            >
              <Ionicons name="close" size={18} color="#ef4444" />
              <Text style={styles.closeButtonText}>Fermer</Text>
            </Pressable>
            {budgetMonth && (
              <AddExpenseForm
                budgetMonthId={budgetMonth.id}
                month={selectedMonth}
                year={selectedYear}
                onSuccess={() => setShowAddExpense(false)}
              />
            )}
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>

      <Modal visible={showAddIncome} animationType="slide">
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
            <Pressable
              style={styles.closeButton}
              onPress={() => setShowAddIncome(false)}
            >
              <Ionicons name="close" size={18} color="#ef4444" />
              <Text style={styles.closeButtonText}>Fermer</Text>
            </Pressable>
            {budgetMonth && (
              <AddIncomeForm
                budgetMonthId={budgetMonth.id}
                month={selectedMonth}
                year={selectedYear}
                onSuccess={() => setShowAddIncome(false)}
              />
            )}
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topSafeArea: {
    flex: 1,
    backgroundColor: HERO_GREEN,
  },
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },
  hero: {
    backgroundColor: HERO_GREEN,
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
  },
  monthArrow: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  monthLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    minWidth: 110,
    textAlign: "center",
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
    marginBottom: 4,
  },
  balanceValue: {
    color: "#fff",
    fontSize: 38,
    fontWeight: "bold",
    marginBottom: 20,
  },
  miniStatsRow: {
    flexDirection: "row",
    gap: 12,
  },
  miniStat: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 16,
    padding: 12,
  },
  miniStatIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  miniStatLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
  },
  miniStatValue: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  errorText: {
    color: "#ef4444",
    textAlign: "center",
  },
  emptyText: {
    color: "#9ca3af",
    textAlign: "center",
    marginVertical: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  detailItem: { flex: 1 },
  detailLabel: {
    color: "#9ca3af",
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "700",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  sectionLink: {
    color: HERO_GREEN,
    fontWeight: "600",
    fontSize: 13,
  },
  expenseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  expenseInfo: { flex: 1 },
  expenseLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  expenseMeta: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 2,
  },
  expenseAmount: {
    color: "#ef4444",
    fontWeight: "700",
  },
  fabRow: {
    position: "absolute",
    bottom: 24,
    right: 24,
    flexDirection: "row",
    gap: 12,
  },
  fab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#16a34a",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  fabIncome: {
    backgroundColor: "#2563eb",
  },
  fabText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  closeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  closeButtonText: {
    color: "#ef4444",
    fontWeight: "600",
  },
});
