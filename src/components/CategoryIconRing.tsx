import { View, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import type { CategoryIconName } from "../utils/categoryIcons";

interface CategoryIconRingProps {
  icon: CategoryIconName;
  percent: number | null; // null = pas de budget défini pour cette catégorie
  size?: number;
}

export default function CategoryIconRing({
  icon,
  percent,
  size = 44,
}: CategoryIconRingProps) {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = percent === null ? 0 : Math.min(percent, 100);
  const dash = (clamped / 100) * circumference;

  const color =
    percent === null
      ? "#d1d5db"
      : percent >= 100
        ? "#ef4444"
        : percent >= 80
          ? "#f59e0b"
          : "#16a34a";

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f3f4f6"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {percent !== null && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeLinecap="round"
            fill="none"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )}
      </Svg>
      <View style={styles.iconWrap}>
        <Ionicons
          name={icon}
          size={size * 0.42}
          color={percent === null ? "#6b7280" : color}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});
