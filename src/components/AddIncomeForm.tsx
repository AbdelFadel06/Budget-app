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
import { useAddIncome } from "../hooks/useAddIncome";
import DateField from "./DateField";

interface AddIncomeFormProps {
  budgetMonthId: string;
  month: number;
  year: number;
  onSuccess: () => void;
}

export default function AddIncomeForm({
  budgetMonthId,
  month,
  year,
  onSuccess,
}: AddIncomeFormProps) {
  const { mutate, isPending, error } = useAddIncome(month, year);

  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [expectedDate, setExpectedDate] = useState(dayjs().format("YYYY-MM-DD")); // aujourd'hui par défaut
  const [alreadyReceived, setAlreadyReceived] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);

  const canSubmit = label.trim().length > 0 && parseFloat(amount) > 0;

  function handleSubmit() {
    mutate(
      {
        budgetMonthId,
        label: label.trim(),
        amount: parseFloat(amount),
        expectedDate: expectedDate.trim() || null,
        alreadyReceived,
        isRecurring,
      },
      { onSuccess }
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>Nouveau revenu</Text>

      <Text style={styles.label}>Libellé</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Salaire, Freelance, Vente..."
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

      <DateField
        label={`Date ${alreadyReceived ? "de réception" : "attendue"}`}
        value={expectedDate || null}
        onChange={setExpectedDate}
      />

      <View style={styles.switchRow}>
        <Text style={styles.label}>Déjà reçu</Text>
        <Switch value={alreadyReceived} onValueChange={setAlreadyReceived} />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.label}>Récurrent chaque mois</Text>
        <Switch value={isRecurring} onValueChange={setIsRecurring} />
      </View>

      {error && <Text style={styles.error}>{(error as Error).message}</Text>}

      <Pressable
        style={[styles.button, !canSubmit && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit || isPending}
      >
        {isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Ajouter le revenu</Text>
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
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
  },
  error: { color: "#ef4444", marginTop: 12 },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 40,
  },
  buttonDisabled: { backgroundColor: "#9ca3af" },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
