import { useState } from "react";
import { Platform, Pressable, Text, View, StyleSheet } from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import "dayjs/locale/fr";

interface DateFieldProps {
  label: string;
  value: string | null; // "YYYY-MM-DD"
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function DateField({
  label,
  value,
  onChange,
  placeholder = "Choisir une date",
}: DateFieldProps) {
  const [show, setShow] = useState(false);
  const dateValue = value ? dayjs(value).toDate() : new Date();

  function handleChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (Platform.OS === "android") {
      setShow(false);
    }
    if (event.type === "dismissed") return;
    if (selectedDate) {
      onChange(dayjs(selectedDate).format("YYYY-MM-DD"));
    }
  }

  return (
    <View>
      <Text style={styles.label}>{label}</Text>

      {Platform.OS === "ios" ? (
        <View style={styles.field}>
          <Ionicons name="calendar-outline" size={18} color="#6b7280" />
          <DateTimePicker
            value={dateValue}
            mode="date"
            display="compact"
            locale="fr-FR"
            onChange={handleChange}
            style={styles.iosCompact}
          />
        </View>
      ) : (
        <Pressable style={styles.field} onPress={() => setShow(true)}>
          <Ionicons name="calendar-outline" size={18} color="#6b7280" />
          <Text style={[styles.text, !value && styles.placeholder]}>
            {value ? dayjs(value).locale("fr").format("DD MMM YYYY") : placeholder}
          </Text>
        </Pressable>
      )}

      {Platform.OS === "android" && show && (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display="default"
          locale="fr-FR"
          onChange={handleChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 14,
    color: "#374151",
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 42,
  },
  iosCompact: {
    height: 28,
    marginLeft: -8,
  },
  text: { color: "#111827", fontSize: 14 },
  placeholder: { color: "#9ca3af" },
});
