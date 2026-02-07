import React, { useEffect, useState } from "react";
import { Text, TextInput, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/themeContext";
import { spacing } from "../theme/spacing";
import PrimaryButton from "../ui/primarybutton";
import { useAuth } from "../auth/AuthContext";

export default function LoginScreen({ navigation }: any) {
  const { theme } = useAppTheme();
  const { signIn, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) {
      navigation.replace("Home");
    }
  }, [user, navigation]);  

  async function onLogin() {
    setErr(null);
    setBusy(true);
    try {
        await signIn(email.trim().toLowerCase(), password);
    } catch (e: any) {
      setErr(e?.message ?? "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={[styles.wrap, { backgroundColor: theme.background }]} edges={["top", "bottom"]}>
      <Text style={[styles.title, { color: theme.text }]}>Log in</Text>

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
        placeholder="Password"
        placeholderTextColor={theme.muted}
        style={[styles.input, { color: theme.text, borderColor: theme.border }]}
      />

      {err ? <Text style={{ color: "tomato", marginBottom: spacing.md }}>{err}</Text> : null}

      <PrimaryButton title={busy ? "Logging in..." : "Log in"} onPress={onLogin} />

      <View style={{ height: spacing.sm }} />
      <PrimaryButton
        title="Create account"
        onPress={() => navigation.navigate("SignUp")}
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
