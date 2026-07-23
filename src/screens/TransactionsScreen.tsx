import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useBudgetStore } from "../store/useBudgetStore";
import { useEnsureCurrentMonth } from "../hooks/useEnsureCurrentMonth";
import { useExpensesList } from "../hooks/useExpensesList";
import { useIncomesList } from "../hooks/useIncomesList";
import {
  useMarkExpenseAsDone,
  useDeleteExpense,
} from "../hooks/useExpenseActions";
import type { Expense, Income } from "../types";

type Tab = "depenses" | "revenus";

export default function TransactionsScreen() {
  const { selectedMonth, selectedYear } = useBudgetStore();
  const { data: budgetMonth } = useEnsureCurrentMonth(
    selectedMonth,
    selectedYear
  );
  const budgetMonthId = budgetMonth?.id;

  const [tab, setTab] = useState<Tab>("depenses");

  const { data: expenses, isLoading: loadingExpenses } =
    useExpensesList(budgetMonthId);
  const { data: incomes, isLoading: loadingIncomes } =
    useIncomesList(budgetMonthId);

  const { mutate: markDone } = useMarkExpenseAsDone(
    selectedMonth,
    selectedYear,
    budgetMonthId
  );
  const { mutate: removeExpense } = useDeleteExpense(
    selectedMonth,
    selectedYear,
    budgetMonthId
  );

  function renderExpense({ item }: { item: Expense }) {
    const isPlanned = item.status === "planifiee";
    return (
      <View style={styles.row}>
        <View style={styles.rowInfo}>
          <Text style={styles.rowLabel}>{item.label}</Text>
          <Text style={styles.rowMeta}>
            {item.amount.toLocaleString()} F ·{" "}
            {isPlanned ? "Planifiée" : "Réalisée"}
            {item.is_unforeseen ? " · Imprévu" : ""}
          </Text>
        </View>
        <View style={styles.rowActions}>
          {isPlanned && (
            <Pressable
              style={styles.doneButton}
              onPress={() => markDone(item.id)}
            >
              <Text style={styles.doneButtonText}>✓ Payée</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() =>
              Alert.alert("Supprimer", `Supprimer "${item.label}" ?`, [
                { text: "Annuler", style: "cancel" },
                {
                  text: "Supprimer",
                  style: "destructive",
                  onPress: () => removeExpense(item.id),
                },
              ])
            }
          >
            <Text style={styles.deleteText}>✕</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  function renderIncome({ item }: { item: Income }) {
    return (
      <View style={styles.row}>
        <View style={styles.rowInfo}>
          <Text style={styles.rowLabel}>{item.label}</Text>
          <Text style={styles.rowMeta}>
            {item.amount.toLocaleString()} F ·{" "}
            {item.received_date ? "Reçu" : "Attendu"}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Transactions ({selectedMonth}/{selectedYear})
      </Text>

      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tab, tab === "depenses" && styles.tabActive]}
          onPress={() => setTab("depenses")}
        >
          <Text
            style={[
              styles.tabText,
              tab === "depenses" && styles.tabTextActive,
            ]}
          >
            Dépenses
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, tab === "revenus" && styles.tabActive]}
          onPress={() => setTab("revenus")}
        >
          <Text
            style={[
              styles.tabText,
              tab === "revenus" && styles.tabTextActive,
            ]}
          >
            Revenus
          </Text>
        </Pressable>
      </View>

      {tab === "depenses" ? (
        loadingExpenses ? (
          <ActivityIndicator style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={expenses}
            keyExtractor={(item) => item.id}
            renderItem={renderExpense}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Aucune dépense ce mois-ci.</Text>
            }
          />
        )
      ) : loadingIncomes ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={incomes}
          keyExtractor={(item) => item.id}
          renderItem={renderIncome}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aucun revenu ce mois-ci.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  tabRow: { flexDirection: "row", marginBottom: 16, gap: 8 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  tabActive: { backgroundColor: "#16a34a" },
  tabText: { color: "#374151", fontWeight: "500" },
  tabTextActive: { color: "#fff" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  rowInfo: { flex: 1 },
  rowLabel: { fontSize: 16, fontWeight: "600" },
  rowMeta: { color: "#9ca3af", marginTop: 2 },
  rowActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  doneButton: {
    backgroundColor: "#16a34a",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  doneButtonText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  deleteText: { color: "#ef4444", fontSize: 18, paddingHorizontal: 4 },
  emptyText: { color: "#9ca3af", textAlign: "center", marginTop: 20 },
});
