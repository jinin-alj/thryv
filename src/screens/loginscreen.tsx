import React, { useEffect, useState } from "react";
import {
  Text,
  TextInput,
  StyleSheet,
  View,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/themeContext";
import { spacing } from "../theme/spacing";
import PrimaryButton from "../ui/primarybutton";
import { useAuth } from "../auth/AuthContext";

const PALETTE = {
  deep: "#347679",
  mid: "#478387",
  soft: "#74a3a5",
  light: "#a3c1c3",
  mist: "#d1e1e1",
};

export default function LoginScreen({ navigation, route }: any) {
  const { theme } = useAppTheme();
  const { signIn, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const fromWelcome = route?.params?.fromWelcome === true;

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
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={["top", "bottom"]}
    >
      <View style={styles.blobTop} />
      <View style={styles.blobRight} />
      <View style={styles.blobBottom} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Image
              source={require("../assets/THRYV_logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={[styles.title, { color: theme.text }]}>
              {fromWelcome ? "So good to see you back" : "Log in"}
            </Text>

            <Text style={[styles.subtitle, { color: theme.muted }]}>
              Pick up right where you left off.
            </Text>
          </View>

          <View style={styles.card}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Email"
              placeholderTextColor={theme.muted}
              selectionColor={PALETTE.deep}
              style={[styles.input, { color: PALETTE.deep }]}
            />

            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Password"
              placeholderTextColor={theme.muted}
              selectionColor={PALETTE.deep}
              style={[styles.input, { color: PALETTE.deep }]}
            />

            {err ? (
              <Text style={{ color: "tomato", marginBottom: spacing.md }}>
                {err}
              </Text>
            ) : null}

            <PrimaryButton
              title={busy ? "Logging in..." : "Log in"}
              onPress={onLogin}
              style={styles.primaryBtn}
              textStyle={styles.primaryBtnText}
            />

            <View style={{ height: spacing.sm }} />

            <PrimaryButton
              title="Create account"
              onPress={() => navigation.navigate("Signup")}
              style={styles.secondaryBtn}
              textStyle={styles.secondaryBtnText}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1 },

  blobTop: {
    position: "absolute",
    top: -180,
    left: -140,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: PALETTE.mist,
    opacity: 0.55,
  },
  blobRight: {
    position: "absolute",
    top: 40,
    right: -180,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: PALETTE.light,
    opacity: 0.25,
  },
  blobBottom: {
    position: "absolute",
    bottom: -220,
    left: -120,
    width: 520,
    height: 520,
    borderRadius: 260,
    backgroundColor: PALETTE.soft,
    opacity: 0.12,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    justifyContent: "space-between",
  },

  header: {
    alignItems: "center",
    paddingTop: spacing.md,
  },

  logo: {
    width: 180,
    height: 180,
    marginBottom: spacing.md,
  },

  title: {
    fontSize: 26,
    fontWeight: "900",
    marginBottom: spacing.xs,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 14,
    textAlign: "center",
    maxWidth: 320,
    lineHeight: 20,
    marginBottom: spacing.md,
  },

  card: {
    width: "100%",
    borderRadius: 28,
    padding: spacing.lg,
    backgroundColor: "rgba(209, 225, 225, 0.5)",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 2,
  },

  input: {
    borderWidth: 0,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: spacing.md,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },

  primaryBtn: {
    backgroundColor: "rgba(163, 193, 195, 0.45)",
  },

  primaryBtnText: {
    color: PALETTE.deep,
    fontWeight: "800",
  },

  secondaryBtn: {
    backgroundColor: "rgba(209, 225, 225, 0.6)",
  },

  secondaryBtnText: {
    color: PALETTE.deep,
    fontWeight: "700",
  },
});