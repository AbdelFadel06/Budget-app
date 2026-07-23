import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useBudgetStore } from "../store/useBudgetStore";
import { useMonthlySummary } from "../hooks/useMonthlySummary";
import { useEnsureCurrentMonth } from "../hooks/useEnsureCurrentMonth";

export default function DashboardScreen() {
  const { selectedMonth, selectedYear } = useBudgetStore();

  // S'assure qu'une ligne budget_months existe pour ce mois avant de charger le résumé
  useEnsureCurrentMonth(selectedMonth, selectedYear);

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
});
