import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import Svg, { Circle } from "react-native-svg";
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

const SIZE = 200;
const STROKE_WIDTH = 28;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

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

  let cumulativeOffset = 0;
  const segments = data.map((item, index) => {
    const fraction = item.total / total;
    const segmentLength = fraction * CIRCUMFERENCE;
    const segment = {
      color: COLORS[index % COLORS.length],
      dasharray: `${segmentLength} ${CIRCUMFERENCE - segmentLength}`,
      dashoffset: -cumulativeOffset,
    };
    cumulativeOffset += segmentLength;
    return segment;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Répartition des dépenses réalisées</Text>

      <View style={{ alignItems: "center" }}>
        <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="#f3f4f6"
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          {segments.map((seg, index) => (
            <Circle
              key={index}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke={seg.color}
              strokeWidth={STROKE_WIDTH}
              strokeDasharray={seg.dasharray}
              strokeDashoffset={seg.dashoffset}
              fill="none"
              strokeLinecap="butt"
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            />
          ))}
        </Svg>
        <View style={styles.centerLabel}>
          <Text style={styles.centerTotal}>{total.toLocaleString()} F</Text>
          <Text style={styles.centerSubtext}>total dépensé</Text>
        </View>
      </View>

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
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#374151",
  },
  emptyText: { color: "#9ca3af", textAlign: "center", marginVertical: 16 },
  centerLabel: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  centerTotal: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  centerSubtext: { fontSize: 12, color: "#9ca3af" },
  legend: { marginTop: 16 },
  legendRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendText: { color: "#374151", fontSize: 13 },
});
