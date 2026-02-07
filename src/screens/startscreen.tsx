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

const PALETTE = {
  deep: "#347679",
  mid: "#478387",
  soft: "#74a3a5",
  light: "#a3c1c3",
  mist: "#d1e1e1",
};

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

  if (onboarded === null || user || loading) {
    return (
      <SafeAreaView style={[styles.wrap, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.blobTop} />
      <View style={styles.blobRight} />
      <View style={styles.blobBottom} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Image
            source={require("../assets/THRYV_logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={[styles.title, { color: theme.text }]}>
            Welcome to Thryve
          </Text>

          <Text style={[styles.subtitle, { color: theme.muted }]}>
            Designed with your mind in mind.
          </Text>
        </View>

        <View style={styles.ctaCard}>
          <View style={styles.ctaWrap}>
            <PrimaryButton
              title="Log in"
              onPress={() => navigation.navigate("Login", { fromWelcome: true })}
              style={styles.primaryBtn}
              textStyle={styles.primaryBtnText}
            />

            <PrimaryButton
              title="Create account"
              onPress={() => navigation.navigate("Signup", { fromWelcome: true })}
              style={styles.secondaryBtn}
              textStyle={styles.secondaryBtnText}
            />
          </View>

          <Text style={[styles.smallNote, { color: theme.muted }]}>
            Please sign in to continue your progress, or create a free account to try it out.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: "center", alignItems: "center" },
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

  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    justifyContent: "space-between",
  },

  header: {
    alignItems: "center",
    paddingTop: spacing.lg,
  },

  logo: {
    width: 280,
    height: 280,
    marginBottom: spacing.lg,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    marginBottom: spacing.sm,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: spacing.lg,
    maxWidth: 320,
    lineHeight: 22,
  },

  ctaCard: {
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

  ctaWrap: {
    width: "100%",
    gap: 14,
    marginBottom: spacing.md,
  },

  primaryBtn: {
    backgroundColor: "rgba(163, 193, 195, 0.45)",
  },

  primaryBtnText: {
    color: PALETTE.deep,
    fontWeight: "700",
  },

  secondaryBtn: {
    backgroundColor: "rgba(209, 225, 225, 0.6)",
  },

  secondaryBtnText: {
    color: PALETTE.deep,
    fontWeight: "600",
  },

  smallNote: {
    marginTop: spacing.xs,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
});