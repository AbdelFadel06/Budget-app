import { ScrollView, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  CATEGORY_ICON_CHOICES,
  type CategoryIconName,
} from "../utils/categoryIcons";

interface IconPickerProps {
  value: CategoryIconName | null;
  onChange: (icon: CategoryIconName) => void;
}

export default function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {CATEGORY_ICON_CHOICES.map((icon) => {
        const selected = value === icon;
        return (
          <Pressable
            key={icon}
            style={[styles.item, selected && styles.itemSelected]}
            onPress={() => onChange(icon)}
          >
            <Ionicons
              name={icon}
              size={20}
              color={selected ? "#fff" : "#374151"}
            />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 2,
  },
  item: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  itemSelected: {
    backgroundColor: "#16a34a",
    borderColor: "#16a34a",
  },
});
