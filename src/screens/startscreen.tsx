import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
  Image,
  Text,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../app/navigation";
import { useAppTheme } from "../theme/themeContext";
import { getString, Keys } from "../storage/local";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../auth/AuthContext";
import PrimaryButton from "../ui/primarybutton";
import { spacing } from "../theme/spacing";

type Props = NativeStackScreenProps<RootStackParamList, "Start">;

export default function StartScreen({ navigation }: Props) {
  const { theme } = useAppTheme();
  const { user, loading } = useAuth();
  const [onboarded, setOnboarded] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const v = await getString(Keys.onboarded, "");
      setOnboarded(v);
    })();
  }, []);

  useEffect(() => {
    if (onboarded === null) return;

    if (!onboarded) {
      navigation.replace("Onboarding");
      return;
    }

    if (user) {
      navigation.replace("Home");
      return;
    }

  }, [onboarded, user, navigation]);

  if (onboarded === null) {
    return (
      <SafeAreaView style={[styles.wrap, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  if (user || loading) {
    return (
      <SafeAreaView style={[styles.wrap, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Image
          source={require("../assets/THRYV_logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={[styles.title, { color: theme.text }]}>Welcome to Thryve</Text>

        <Text style={[styles.subtitle, { color: theme.muted }]}>
          Designed with your mind in mind.
        </Text>

        <View style={styles.ctaWrap}>
          <PrimaryButton
            title="Log in"
            onPress={() => navigation.navigate("Login", { fromWelcome: true })}
            style={styles.primaryBtn}
          />

          <PrimaryButton
            title="Create account"
            variant="outline"
            onPress={() => navigation.navigate("Signup", { fromWelcome: true })}
            style={styles.secondaryBtn}
          />
        </View>

        <Text style={[styles.smallNote, { color: theme.muted }]}>
          Please sign in to continue your progress, or create a free account to try it out.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: spacing.xl,
    maxWidth: 300,
  },
  ctaWrap: {
    width: "100%",
    gap: 12,
    marginBottom: spacing.md,
  },
  primaryBtn: {
    marginBottom: 8,
  },
  secondaryBtn: {
  },
  smallNote: {
    marginTop: spacing.md,
    fontSize: 13,
    textAlign: "center",
    maxWidth: 320,
  },
});