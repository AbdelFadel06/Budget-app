import { Ionicons } from "@expo/vector-icons";
import type { CategoryType } from "../types";

export type CategoryIconName = keyof typeof Ionicons.glyphMap;

// Palette proposée dans le sélecteur d'icône à la création d'une catégorie.
export const CATEGORY_ICON_CHOICES: CategoryIconName[] = [
  "fast-food-outline",
  "cart-outline",
  "home-outline",
  "car-outline",
  "flash-outline",
  "medkit-outline",
  "school-outline",
  "game-controller-outline",
  "film-outline",
  "shirt-outline",
  "gift-outline",
  "airplane-outline",
  "fitness-outline",
  "paw-outline",
  "phone-portrait-outline",
  "wallet-outline",
];

export function defaultCategoryIcon(type: CategoryType): CategoryIconName {
  return type === "utile" ? "wallet-outline" : "game-controller-outline";
}

export function resolveCategoryIcon(
  icon: string | null | undefined,
  type: CategoryType
): CategoryIconName {
  if (icon && (CATEGORY_ICON_CHOICES as string[]).includes(icon)) {
    return icon as CategoryIconName;
  }
  return defaultCategoryIcon(type);
}
