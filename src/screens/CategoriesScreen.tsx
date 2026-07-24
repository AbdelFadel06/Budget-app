import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useCategories } from "../hooks/useCategories";
import { useAddCategory } from "../hooks/useAddCategory";
import { useDeleteCategory } from "../hooks/useDeleteCategory";
import { useCategorySpending } from "../hooks/useCategorySpending";
import { useEnsureCurrentMonth } from "../hooks/useEnsureCurrentMonth";
import { useBudgetStore } from "../store/useBudgetStore";
import IconPicker from "../components/IconPicker";
import CategoryIconRing from "../components/CategoryIconRing";
import {
  resolveCategoryIcon,
  type CategoryIconName,
} from "../utils/categoryIcons";
import type { Category, CategoryType } from "../types";

export default function CategoriesScreen() {
  const { selectedMonth, selectedYear } = useBudgetStore();
  const { data: budgetMonth } = useEnsureCurrentMonth(
    selectedMonth,
    selectedYear
  );
  const { data: spending } = useCategorySpending(budgetMonth?.id);

  const { data: categories, isLoading } = useCategories();
  const { mutate: addCategory, isPending: adding } = useAddCategory();
  const { mutate: removeCategory } = useDeleteCategory();

  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>("utile");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [icon, setIcon] = useState<CategoryIconName | null>(null);

  function handleAdd() {
    if (!name.trim()) return;
    addCategory(
      {
        name: name.trim(),
        type,
        monthlyBudget: monthlyBudget ? parseFloat(monthlyBudget) : null,
        icon,
      },
      {
        onSuccess: () => {
          setName("");
          setMonthlyBudget("");
          setIcon(null);
        },
      }
    );
  }

  function handleDelete(category: Category) {
    Alert.alert(
      "Supprimer la catégorie",
      `Supprimer "${category.name}" ? Les dépenses liées ne seront pas supprimées, juste détachées de cette catégorie.`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => removeCategory(category.id),
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Catégories</Text>

      {/* Formulaire d'ajout */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nom (ex: Courses, Loyer, Sorties...)"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Budget mensuel alloué (optionnel)"
          keyboardType="numeric"
          value={monthlyBudget}
          onChangeText={setMonthlyBudget}
        />

        <View style={styles.chipRow}>
          <Pressable
            style={[styles.chip, type === "utile" && styles.chipSelected]}
            onPress={() => setType("utile")}
          >
            <Text
              style={[
                styles.chipText,
                type === "utile" && styles.chipTextSelected,
              ]}
            >
              Utile
            </Text>
          </Pressable>
          <Pressable
            style={[styles.chip, type === "plaisir" && styles.chipSelected]}
            onPress={() => setType("plaisir")}
          >
            <Text
              style={[
                styles.chipText,
                type === "plaisir" && styles.chipTextSelected,
              ]}
            >
              Plaisir
            </Text>
          </Pressable>
        </View>

        <Text style={styles.iconLabel}>Icône</Text>
        <IconPicker value={icon} onChange={setIcon} />

        <Pressable
          style={[styles.button, !name.trim() && styles.buttonDisabled]}
          onPress={handleAdd}
          disabled={!name.trim() || adding}
        >
          {adding ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="add-circle-outline" size={18} color="#fff" />
              <Text style={styles.buttonText}>Ajouter la catégorie</Text>
            </>
          )}
        </Pressable>
      </View>

      {/* Liste des catégories existantes */}
      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 12 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Aucune catégorie pour l'instant.
            </Text>
          }
          renderItem={({ item }) => {
            const spent = spending?.get(item.id) ?? 0;
            const percent = item.monthly_budget
              ? (spent / item.monthly_budget) * 100
              : null;

            return (
              <View style={styles.categoryRow}>
                <CategoryIconRing
                  icon={resolveCategoryIcon(item.icon, item.type)}
                  percent={percent}
                />
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{item.name}</Text>
                  {item.monthly_budget ? (
                    <Text style={styles.categoryType}>
                      {spent.toLocaleString()} F sur{" "}
                      {item.monthly_budget.toLocaleString()} F ·{" "}
                      {percent!.toFixed(0)}%
                    </Text>
                  ) : (
                    <Text style={styles.categoryType}>
                      {item.type === "utile" ? "Utile" : "Plaisir"}
                    </Text>
                  )}
                </View>
                <Pressable
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item)}
                >
                  <Ionicons name="trash-outline" size={16} color="#ef4444" />
                </Pressable>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  form: { marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  chipRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
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
  iconLabel: { fontWeight: "600", marginBottom: 8, color: "#374151" },
  button: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#16a34a",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  buttonDisabled: { backgroundColor: "#9ca3af" },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  emptyText: { color: "#9ca3af", textAlign: "center", marginTop: 20 },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  categoryInfo: { flex: 1 },
  categoryName: { fontSize: 16, fontWeight: "600" },
  categoryType: { color: "#9ca3af", marginTop: 2 },
  deleteButton: { padding: 6 },
});
