import React, { useState } from "react";
import { Text, TextInput, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/themeContext";
import { spacing } from "../theme/spacing";
import PrimaryButton from "../ui/primarybutton";
import { useAuth } from "../auth/AuthContext";

export default function SignUpScreen({ navigation, route }: any) {
  const { theme } = useAppTheme();
  const { signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const fromWelcome = route?.params?.fromWelcome === true;

  async function onSignUp() {
    setErr(null);
    setBusy(true);
    try {
      await signUp(email, password);
    } catch (e: any) {
      setErr(e?.message ?? "Sign up failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={[styles.wrap, { backgroundColor: theme.background }]} edges={["top", "bottom"]}>
      <Text style={[styles.title, { color: theme.text }]}>
        {fromWelcome ? "Welcome — you're going to love this." : "Create account"}
      </Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
        placeholderTextColor={theme.muted}
        style={[styles.input, { color: theme.text, borderColor: theme.border }]}
      />

      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Password (6+ chars)"
        placeholderTextColor={theme.muted}
        style={[styles.input, { color: theme.text, borderColor: theme.border }]}
      />

      {err ? <Text style={{ color: "tomato", marginBottom: spacing.md }}>{err}</Text> : null}

      <PrimaryButton title={busy ? "Creating..." : "Sign up"} onPress={onSignUp} />

      <View style={{ height: spacing.sm }} />
      <PrimaryButton
        title="Back to login"
        onPress={() => navigation.goBack()}
        style={{ backgroundColor: theme.card }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: spacing.xl },
  title: { fontSize: 28, fontWeight: "900", marginBottom: spacing.lg },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: spacing.md },
});
