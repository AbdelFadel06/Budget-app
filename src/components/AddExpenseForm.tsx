import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Switch,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import dayjs from "dayjs";
import { useCategories } from "../hooks/useCategories";
import { useAddExpense } from "../hooks/useAddExpense";
import DateField from "./DateField";
import type { ExpenseStatus } from "../types";

interface AddExpenseFormProps {
  budgetMonthId: string;
  month: number;
  year: number;
  onSuccess: () => void;
}

export default function AddExpenseForm({
  budgetMonthId,
  month,
  year,
  onSuccess,
}: AddExpenseFormProps) {
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { mutate, isPending, error } = useAddExpense(month, year);

  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [status, setStatus] = useState<ExpenseStatus>("planifiee");
  const [plannedDate, setPlannedDate] = useState(dayjs().format("YYYY-MM-DD")); // format YYYY-MM-DD, aujourd'hui par défaut
  const [isUnforeseen, setIsUnforeseen] = useState(false);

  const canSubmit = label.trim().length > 0 && parseFloat(amount) > 0;

  function handleSubmit() {
    mutate(
      {
        budgetMonthId,
        categoryId,
        label: label.trim(),
        amount: parseFloat(amount),
        status,
        plannedDate: plannedDate.trim() || null,
        isUnforeseen,
      },
      { onSuccess }
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>Nouvelle dépense</Text>

      <Text style={styles.label}>Libellé</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Courses, Loyer, Cinéma..."
        value={label}
        onChangeText={setLabel}
      />

      <Text style={styles.label}>Montant</Text>
      <TextInput
        style={styles.input}
        placeholder="0"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <Text style={styles.label}>Catégorie</Text>
      {categoriesLoading ? (
        <ActivityIndicator />
      ) : categories && categories.length > 0 ? (
        <View style={styles.chipRow}>
          {categories.map((cat) => (
            <Pressable
              key={cat.id}
              style={[
                styles.chip,
                categoryId === cat.id && styles.chipSelected,
              ]}
              onPress={() => setCategoryId(cat.id)}
            >
              <Text
                style={[
                  styles.chipText,
                  categoryId === cat.id && styles.chipTextSelected,
                ]}
              >
                {cat.name}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <Text style={styles.hint}>
          Aucune catégorie pour l'instant — tu peux en créer dans Supabase
          (table categories), ou laisser sans catégorie.
        </Text>
      )}

      <Text style={styles.label}>Statut</Text>
      <View style={styles.chipRow}>
        <Pressable
          style={[
            styles.chip,
            status === "planifiee" && styles.chipSelected,
          ]}
          onPress={() => setStatus("planifiee")}
        >
          <Text
            style={[
              styles.chipText,
              status === "planifiee" && styles.chipTextSelected,
            ]}
          >
            Planifiée
          </Text>
        </Pressable>
        <Pressable
          style={[styles.chip, status === "realisee" && styles.chipSelected]}
          onPress={() => setStatus("realisee")}
        >
          <Text
            style={[
              styles.chipText,
              status === "realisee" && styles.chipTextSelected,
            ]}
          >
            Réalisée
          </Text>
        </Pressable>
      </View>

      <DateField
        label={`Date ${status === "realisee" ? "de paiement" : "prévue"}`}
        value={plannedDate || null}
        onChange={setPlannedDate}
      />

      <View style={styles.switchRow}>
        <Text style={styles.label}>Dépense imprévue</Text>
        <Switch value={isUnforeseen} onValueChange={setIsUnforeseen} />
      </View>

      {error && (
        <Text style={styles.error}>{(error as Error).message}</Text>
      )}

      <Pressable
        style={[styles.button, !canSubmit && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit || isPending}
      >
        {isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Ajouter la dépense</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  label: { fontWeight: "600", marginBottom: 6, marginTop: 14, color: "#374151" },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  chipSelected: { backgroundColor: "#16a34a", borderColor: "#16a34a" },
  chipText: { color: "#374151" },
  chipTextSelected: { color: "#fff", fontWeight: "600" },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
  },
  hint: { color: "#9ca3af", fontSize: 13 },
  error: { color: "#ef4444", marginTop: 12 },
  button: {
    backgroundColor: "#16a34a",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 40,
  },
  buttonDisabled: { backgroundColor: "#9ca3af" },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
