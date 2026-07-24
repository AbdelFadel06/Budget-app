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
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useBudgetStore } from "../store/useBudgetStore";
import { useEnsureCurrentMonth } from "../hooks/useEnsureCurrentMonth";
import { MONTH_NAMES } from "../utils/months";
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
              <Ionicons name="checkmark" size={14} color="#fff" />
              <Text style={styles.doneButtonText}>Payée</Text>
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
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
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
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
        <Text style={styles.headerMonth}>
          {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
        </Text>
      </View>

      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tab, tab === "depenses" && styles.tabActive]}
          onPress={() => setTab("depenses")}
        >
          <Ionicons
            name="arrow-down-circle-outline"
            size={16}
            color={tab === "depenses" ? "#fff" : "#374151"}
          />
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
          <Ionicons
            name="arrow-up-circle-outline"
            size={16}
            color={tab === "revenus" ? "#fff" : "#374151"}
          />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: "bold" },
  headerMonth: { fontSize: 14, color: "#9ca3af" },
  tabRow: { flexDirection: "row", marginBottom: 16, gap: 8 },
  tab: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#16a34a",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  doneButtonText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  emptyText: { color: "#9ca3af", textAlign: "center", marginTop: 20 },
});
