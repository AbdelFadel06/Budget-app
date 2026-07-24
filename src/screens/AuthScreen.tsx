import { useState } from "react";
import {
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import { translateAuthError } from "../utils/authErrors";

type Mode = "signin" | "signup";

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  function switchMode(next: Mode) {
    setMode(next);
    setErrorMsg(null);
    setInfoMsg(null);
    setConfirmPassword("");
  }

  async function handleSignIn() {
    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (error) setErrorMsg(translateAuthError(error.message));
    // Si succès, onAuthStateChange (dans App.tsx) bascule automatiquement l'écran
  }

  async function handleSignUp() {
    if (password !== confirmPassword) {
      setErrorMsg("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (error) {
      setErrorMsg(translateAuthError(error.message));
      return;
    }

    if (!data.session) {
      // Confirmation par email requise avant de pouvoir se connecter
      setInfoMsg(
        "Compte créé ! Vérifie ta boîte mail pour confirmer ton adresse avant de te connecter."
      );
      switchMode("signin");
    }
    // Si une session est renvoyée directement, onAuthStateChange (dans App.tsx)
    // bascule automatiquement vers l'application.
  }

  const isSignUp = mode === "signup";
  const canSubmit =
    email.trim().length > 0 &&
    password.length > 0 &&
    (!isSignUp || confirmPassword.length > 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>
          {isSignUp ? "Créer un compte" : "Connexion"}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="username"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          secureTextEntry
          textContentType={isSignUp ? "newPassword" : "password"}
          autoComplete={isSignUp ? "new-password" : "password"}
          value={password}
          onChangeText={setPassword}
        />
        {isSignUp && (
          <TextInput
            style={styles.input}
            placeholder="Confirmer le mot de passe"
            secureTextEntry
            textContentType="newPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        )}

        {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
        {infoMsg && <Text style={styles.info}>{infoMsg}</Text>}

        <Pressable
          style={[styles.button, !canSubmit && styles.buttonDisabled]}
          onPress={isSignUp ? handleSignUp : handleSignIn}
          disabled={!canSubmit || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isSignUp ? "Créer mon compte" : "Se connecter"}
            </Text>
          )}
        </Pressable>

        <Pressable
          style={styles.switchLink}
          onPress={() => switchMode(isSignUp ? "signin" : "signup")}
        >
          <Text style={styles.switchLinkText}>
            {isSignUp
              ? "Déjà un compte ? Se connecter"
              : "Pas encore de compte ? Créer un compte"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#16a34a",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: { backgroundColor: "#9ca3af" },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  error: {
    color: "#ef4444",
    marginBottom: 12,
    textAlign: "center",
  },
  info: {
    color: "#16a34a",
    marginBottom: 12,
    textAlign: "center",
  },
  switchLink: {
    marginTop: 20,
    alignSelf: "center",
  },
  switchLinkText: {
    color: "#16a34a",
    fontWeight: "600",
    fontSize: 14,
  },
});
