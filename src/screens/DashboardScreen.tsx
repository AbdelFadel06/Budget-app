import { useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  Modal,
} from "react-native";
import { useBudgetStore } from "../store/useBudgetStore";
import { useMonthlySummary } from "../hooks/useMonthlySummary";
import { useEnsureCurrentMonth } from "../hooks/useEnsureCurrentMonth";
import AddExpenseForm from "../components/AddExpenseForm";
import AddIncomeForm from "../components/AddIncomeForm";
import CategoriesScreen from "./CategoriesScreen";

export default function DashboardScreen() {
  const { selectedMonth, selectedYear } = useBudgetStore();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  const { data: budgetMonth } = useEnsureCurrentMonth(
    selectedMonth,
    selectedYear
  );

  const { data, isLoading, error } = useMonthlySummary(
    selectedMonth,
    selectedYear
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Erreur : {(error as Error).message}
        </Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>
          Aucun budget trouvé pour {selectedMonth}/{selectedYear}.{"\n"}
          Crée d'abord une ligne dans budget_months.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={() => setShowCategories(true)}>
        <Text style={styles.categoriesLink}>⚙️ Gérer les catégories</Text>
      </Pressable>

      <Text style={styles.label}>
        Solde disponible ({selectedMonth}/{selectedYear})
      </Text>
      <Text style={styles.balance}>
        {data.solde_disponible.toLocaleString()} F
      </Text>

      <Text style={styles.detail}>
        Solde réel : {data.solde_reel.toLocaleString()} F
      </Text>
      <Text style={styles.detail}>
        Revenus reçus : {data.revenus_recus.toLocaleString()} F
      </Text>
      <Text style={styles.detail}>
        Dépenses réalisées : {data.depenses_realisees.toLocaleString()} F
      </Text>
      <Text style={styles.detail}>
        Dépenses planifiées : {data.depenses_planifiees.toLocaleString()} F
      </Text>

      <View style={styles.fabRow}>
        <Pressable
          style={[styles.fab, styles.fabIncome]}
          onPress={() => setShowAddIncome(true)}
        >
          <Text style={styles.fabText}>+ Revenu</Text>
        </Pressable>
        <Pressable
          style={styles.fab}
          onPress={() => setShowAddExpense(true)}
        >
          <Text style={styles.fabText}>+ Dépense</Text>
        </Pressable>
      </View>

      <Modal visible={showAddExpense} animationType="slide">
        <View style={{ flex: 1, paddingTop: 60 }}>
          <Pressable
            style={styles.closeButton}
            onPress={() => setShowAddExpense(false)}
          >
            <Text style={styles.closeButtonText}>✕ Fermer</Text>
          </Pressable>
          {budgetMonth && (
            <AddExpenseForm
              budgetMonthId={budgetMonth.id}
              month={selectedMonth}
              year={selectedYear}
              onSuccess={() => setShowAddExpense(false)}
            />
          )}
        </View>
      </Modal>

      <Modal visible={showAddIncome} animationType="slide">
        <View style={{ flex: 1, paddingTop: 60 }}>
          <Pressable
            style={styles.closeButton}
            onPress={() => setShowAddIncome(false)}
          >
            <Text style={styles.closeButtonText}>✕ Fermer</Text>
          </Pressable>
          {budgetMonth && (
            <AddIncomeForm
              budgetMonthId={budgetMonth.id}
              month={selectedMonth}
              year={selectedYear}
              onSuccess={() => setShowAddIncome(false)}
            />
          )}
        </View>
      </Modal>
      <Modal visible={showCategories} animationType="slide">
        <View style={{ flex: 1, paddingTop: 60 }}>
          <Pressable
            style={styles.closeButton}
            onPress={() => setShowCategories(false)}
          >
            <Text style={styles.closeButtonText}>✕ Fermer</Text>
          </Pressable>
          <CategoriesScreen />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
    justifyContent: "center",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 16,
  },
  label: {
    color: "#6b7280",
    fontSize: 18,
    marginBottom: 8,
  },
  categoriesLink: {
    color: "#2563eb",
    fontWeight: "500",
    marginBottom: 20,
    alignSelf: "flex-end",
  },
  balance: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#16a34a",
    marginBottom: 24,
  },
  detail: {
    color: "#9ca3af",
    marginBottom: 4,
  },
  errorText: {
    color: "#ef4444",
    textAlign: "center",
  },
  emptyText: {
    color: "#6b7280",
    textAlign: "center",
  },
  fabRow: {
    position: "absolute",
    bottom: 40,
    right: 24,
    flexDirection: "row",
    gap: 12,
  },
  fab: {
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
    alignSelf: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  closeButtonText: {
    color: "#ef4444",
    fontWeight: "600",
  },
});
