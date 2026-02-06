import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { getJSON, setJSON, Keys, Profile, GameRun } from "../storage/local";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [runs, setRuns] = useState<GameRun[]>([]);

  useEffect(() => {
    (async () => {
      setProfile(await getJSON(Keys.profile, null));
      setRuns(await getJSON(Keys.runs, []));
    })();
  }, []);

  async function togglePremium(v: boolean) {
    if (!profile) return;
    const next = { ...profile, isPremium: v };
    setProfile(next);
    await setJSON(Keys.profile, next);
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.h}>Profile</Text>

      <View style={{ height: spacing.lg }} />

      <View style={styles.card}>
        <Text style={styles.label}>Streak</Text>
        <Text style={styles.big}>{profile?.streakDays ?? 0} days</Text>

        <View style={{ height: spacing.md }} />

        <Text style={styles.label}>Total runs</Text>
        <Text style={styles.big}>{profile?.totalRuns ?? 0}</Text>

        <View style={{ height: spacing.md }} />

        <View style={styles.row}>
          <Text style={[styles.label, { marginBottom: 0 }]}>Premium (demo)</Text>
          <Switch
            value={!!profile?.isPremium}
            onValueChange={togglePremium}
          />
        </View>
        <Text style={styles.small}>Toggle to test freemium gating in Games.</Text>
      </View>

      <View style={{ height: spacing.lg }} />

      <View style={styles.card}>
        <Text style={styles.label}>Recent scores</Text>
        {runs.slice(0, 5).map((r) => (
          <Text key={r.id} style={styles.small}>
            • {r.focusScore}/100 — {Math.round(r.accuracy * 100)}% — L{r.difficultyLevel}
          </Text>
        ))}
        {!runs.length ? <Text style={styles.small}>No runs yet.</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl },
  h: { color: colors.text, fontSize: 28, fontWeight: "900" },
  card: { backgroundColor: colors.card, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  label: { color: colors.muted, fontWeight: "800", marginBottom: 6 },
  big: { color: colors.text, fontSize: 32, fontWeight: "900" },
  small: { color: colors.muted, marginTop: 6, fontWeight: "700", lineHeight: 18 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});
