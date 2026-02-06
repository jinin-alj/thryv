import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../app/navigation";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import PrimaryButton from "../ui/primarybutton";
import { setString, Keys, getJSON, setJSON, Profile, todayKey } from "../storage/local";

type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;

export default function OnboardingScreen({ navigation }: Props) {
  async function finish() {
    await setString(Keys.onboarded, "1");
    const existing = await getJSON<Profile | null>(Keys.profile, null);
    if (!existing) {
      const profile: Profile = {
        createdAt: new Date().toISOString(),
        totalRuns: 0,
        streakDays: 0,
        lastActiveDate: todayKey(),
        isPremium: false,
      };
      await setJSON(Keys.profile, profile);
    }
    navigation.replace("Home");
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.h}>How it works</Text>

      <View style={styles.card}>
        <Text style={styles.b}>1) Prime</Text>
        <Text style={styles.p}>Play a 2–3 minute brain sprint before studying.</Text>

        <View style={{ height: spacing.md }} />
        <Text style={styles.b}>2) Study</Text>
        <Text style={styles.p}>Use a focus timer (25/50 min).</Text>

        <View style={{ height: spacing.md }} />
        <Text style={styles.b}>3) Reset</Text>
        <Text style={styles.p}>Between blocks, play another quick sprint to avoid doom-scrolling.</Text>
      </View>

      <View style={{ height: spacing.lg }} />
      <PrimaryButton title="Continue" onPress={finish} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl, justifyContent: "center" },
  h: { color: colors.text, fontSize: 26, fontWeight: "900", marginBottom: spacing.md },
  card: { backgroundColor: colors.card, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  b: { color: colors.text, fontSize: 16, fontWeight: "900" },
  p: { color: colors.muted, marginTop: 6, fontSize: 14, fontWeight: "600", lineHeight: 20 },
});
