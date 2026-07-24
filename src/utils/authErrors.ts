// Traduit les messages d'erreur Supabase Auth (toujours en anglais) en français.
const TRANSLATIONS: { match: string; message: string }[] = [
  { match: "invalid login credentials", message: "Identifiants invalides." },
  { match: "email not confirmed", message: "Adresse email non confirmée." },
  { match: "user already registered", message: "Un compte existe déjà avec cet email." },
  { match: "password should be at least", message: "Le mot de passe doit contenir au moins 6 caractères." },
  { match: "unable to validate email address", message: "Adresse email invalide." },
  { match: "email rate limit exceeded", message: "Trop de tentatives, réessaie dans quelques minutes." },
  { match: "user not found", message: "Utilisateur introuvable." },
  { match: "signups not allowed", message: "Les inscriptions sont désactivées pour le moment." },
  { match: "network request failed", message: "Connexion impossible, vérifie ta connexion internet." },
];

export function translateAuthError(message: string): string {
  const lower = message.toLowerCase();
  const found = TRANSLATIONS.find((t) => lower.includes(t.match));
  return found ? found.message : message;
}
