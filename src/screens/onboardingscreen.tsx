import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../app/navigation";
import { spacing } from "../theme/spacing";
import { useAppTheme } from "../theme/themeContext";
import PrimaryButton from "../ui/primarybutton";
import { setString, Keys, getJSON, setJSON, Profile, todayKey } from "../storage/local";
import { SafeAreaView } from "react-native-safe-area-context";


type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;

export default function OnboardingScreen({ navigation }: Props) {
  const { theme } = useAppTheme();
  const styles = makeStyles(theme);

  async function finish() {
    await setString(Keys.onboarded, "1");
    const existing = await getJSON<Profile | null>(Keys.profile, null);
    if (!existing) {
      await setJSON(Keys.profile, {
        createdAt: new Date().toISOString(),
        totalRuns: 0,
        streakDays: 0,
        lastActiveDate: todayKey(),
        isPremium: false,
      });
    }
    navigation.replace("Home");
  }

  return (
    <SafeAreaView style={styles.wrap}>
      <Text style={styles.h}>How it works</Text>

      <View style={styles.card}>
        <Text style={styles.b}>1) Prime</Text>
        <Text style={styles.p}>Play a 2–3 minute brain sprint.</Text>

        <View style={{ height: spacing.md }} />

        <Text style={styles.b}>2) Study</Text>
        <Text style={styles.p}>Use the focus timer (25 / 50 min).</Text>

        <View style={{ height: spacing.md }} />

        <Text style={styles.b}>3) Reset</Text>
        <Text style={styles.p}>Avoid doom-scrolling between blocks.</Text>
      </View>

      <View style={{ height: spacing.lg }} />
      <PrimaryButton title="Continue" onPress={finish} />
    </SafeAreaView>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    wrap: {
      flex: 1,
      backgroundColor: theme.background,
      padding: spacing.xl,
      justifyContent: "center",
    },
    h: { color: theme.text, fontSize: 26, fontWeight: "900", marginBottom: spacing.md },
    card: {
      backgroundColor: theme.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
      padding: spacing.lg,
    },
    b: { color: theme.text, fontSize: 16, fontWeight: "900" },
    p: {
      color: theme.mutedText,
      marginTop: 6,
      fontSize: 14,
      fontWeight: "600",
      lineHeight: 20,
    },
  });
