import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from "react-native";
import { VictoryPie } from "victory-native";
import { useCategoryBreakdown } from "../hooks/useCategoryBreakdown";

interface CategoryChartProps {
  budgetMonthId: string | undefined;
}

const COLORS = [
  "#16a34a",
  "#2563eb",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
];

export default function CategoryChart({ budgetMonthId }: CategoryChartProps) {
  const { data, isLoading } = useCategoryBreakdown(budgetMonthId);

  if (isLoading) {
    return <ActivityIndicator style={{ marginVertical: 20 }} />;
  }

  if (!data || data.length === 0) {
    return (
      <Text style={styles.emptyText}>
        Aucune dépense réalisée ce mois-ci pour l'instant.
      </Text>
    );
  }

  const total = data.reduce((sum, item) => sum + item.total, 0);
  const chartData = data.map((item) => ({
    x: item.categoryName,
    y: item.total,
  }));

  const screenWidth = Dimensions.get("window").width;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Répartition des dépenses réalisées</Text>

      <VictoryPie
        data={chartData}
        width={screenWidth - 40}
        height={260}
        colorScale={COLORS}
        innerRadius={50}
        labelRadius={({ innerRadius }) => (innerRadius as number) + 60}
        style={{ labels: { fontSize: 12, fill: "#374151" } }}
      />

      <View style={styles.legend}>
        {data.map((item, index) => (
          <View key={item.categoryName} style={styles.legendRow}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: COLORS[index % COLORS.length] },
              ]}
            />
            <Text style={styles.legendText}>
              {item.categoryName} — {item.total.toLocaleString()} F (
              {((item.total / total) * 100).toFixed(0)}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 16 },
  title: { fontSize: 16, fontWeight: "600", marginBottom: 8, color: "#374151" },
  emptyText: { color: "#9ca3af", textAlign: "center", marginVertical: 16 },
  legend: { marginTop: 8 },
  legendRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendText: { color: "#374151", fontSize: 13 },
});
