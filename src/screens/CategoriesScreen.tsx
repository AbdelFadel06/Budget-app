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
import { useCategories } from "../hooks/useCategories";
import { useAddCategory } from "../hooks/useAddCategory";
import { useDeleteCategory } from "../hooks/useDeleteCategory";
import type { Category, CategoryType } from "../types";

export default function CategoriesScreen() {
  const { data: categories, isLoading } = useCategories();
  const { mutate: addCategory, isPending: adding } = useAddCategory();
  const { mutate: removeCategory } = useDeleteCategory();

  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>("utile");
  const [monthlyBudget, setMonthlyBudget] = useState("");

  function handleAdd() {
    if (!name.trim()) return;
    addCategory(
      {
        name: name.trim(),
        type,
        monthlyBudget: monthlyBudget ? parseFloat(monthlyBudget) : null,
      },
      {
        onSuccess: () => {
          setName("");
          setMonthlyBudget("");
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
    <View style={styles.container}>
      <Text style={styles.title}>Catégories</Text>

      {/* Formulaire d'ajout */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nom (ex: Courses, Loyer, Sorties...)"
          value={name}
          onChangeText={setName}
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

        <TextInput
          style={styles.input}
          placeholder="Budget mensuel alloué (optionnel)"
          keyboardType="numeric"
          value={monthlyBudget}
          onChangeText={setMonthlyBudget}
        />

        <Pressable
          style={[styles.button, !name.trim() && styles.buttonDisabled]}
          onPress={handleAdd}
          disabled={!name.trim() || adding}
        >
          {adding ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Ajouter la catégorie</Text>
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
          renderItem={({ item }) => (
            <View style={styles.categoryRow}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{item.name}</Text>
                <Text style={styles.categoryType}>
                  {item.type === "utile" ? "Utile" : "Plaisir"}
                  {item.monthly_budget
                    ? ` · budget ${item.monthly_budget.toLocaleString()} F`
                    : ""}
                </Text>
              </View>
              <Pressable onPress={() => handleDelete(item)}>
                <Text style={styles.deleteText}>Supprimer</Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </View>
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
  button: {
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  categoryInfo: { flex: 1 },
  categoryName: { fontSize: 16, fontWeight: "600" },
  categoryType: { color: "#9ca3af", marginTop: 2 },
  deleteText: { color: "#ef4444", fontWeight: "500" },
});
