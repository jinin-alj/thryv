import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../app/navigation";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import PrimaryButton from "../ui/primarybutton";
import { getJSON, Keys, Profile, GameRun } from "../storage/local";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [lastRun, setLastRun] = useState<GameRun | null>(null);

  useEffect(() => {
    (async () => {
      setProfile(await getJSON(Keys.profile, null));
      setLastRun(await getJSON(Keys.lastRun, null));
    })();
  }, []);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.sub}>Prime your brain. Then crush the study block.</Text>

      <View style={{ height: spacing.lg }} />

      {lastRun ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Last focus score</Text>
          <Text style={styles.big}>{lastRun.focusScore}/100</Text>
          <Text style={styles.small}>
            Accuracy {Math.round(lastRun.accuracy * 100)}% • Difficulty L{lastRun.difficultyLevel}
          </Text>
          <View style={{ height: spacing.md }} />
          <PrimaryButton
            title="View Results"
            onPress={() => navigation.navigate("Results", { runId: lastRun.id })}
            style={{ backgroundColor: colors.primaryDark }}
          />
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>No runs yet</Text>
          <Text style={styles.small}>Start with a 2–3 minute sprint.</Text>
        </View>
      )}

      <View style={{ height: spacing.lg }} />

      <PrimaryButton title="Play a Brain Sprint" onPress={() => navigation.navigate("Games")} />
      <View style={{ height: spacing.sm }} />
      <PrimaryButton title="Start Focus Timer" onPress={() => navigation.navigate("FocusTimer")} style={{ backgroundColor: colors.card }} />
      <View style={{ height: spacing.sm }} />
      <PrimaryButton title="Profile" onPress={() => navigation.navigate("Profile")} style={{ backgroundColor: colors.card }} />
      <View style={{ height: spacing.sm }} />
      <PrimaryButton title="Fun Facts" onPress={() => navigation.navigate("FunFacts")} style={{ backgroundColor: colors.card }} />

      <View style={{ flex: 1 }} />
      <Text style={styles.footer}>
        {profile?.isPremium ? "Premium: ON (demo toggle in Profile)" : "Premium: OFF"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl },
  title: { color: colors.text, fontSize: 28, fontWeight: "900" },
  sub: { color: colors.muted, marginTop: 6, fontWeight: "600" },
  card: { backgroundColor: colors.card, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  cardTitle: { color: colors.muted, fontWeight: "800" },
  big: { color: colors.text, fontSize: 40, fontWeight: "900", marginTop: spacing.sm },
  small: { color: colors.muted, marginTop: 6, fontWeight: "600" },
  footer: { color: colors.muted, marginTop: spacing.lg, fontSize: 12, fontWeight: "600", opacity: 0.8 },
});


