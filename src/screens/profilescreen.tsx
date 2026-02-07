import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import { spacing } from "../theme/spacing";
import { useAppTheme } from "../theme/themeContext";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getJSON,
  setJSON,
  Keys,
  Profile,
  GameRun,
} from "../storage/local";

export default function ProfileScreen() {
  const { theme, toggleTheme, mode } = useAppTheme();
  const styles = makeStyles(theme);

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
    <SafeAreaView style={styles.wrap}>
      <Text style={styles.h}>Profile</Text>

      <View style={{ height: spacing.lg }} />

      <View style={styles.card}>
        <Text style={styles.label}>Streak</Text>
        <Text style={styles.big}>
          {profile?.streakDays ?? 0} days
        </Text>

        <View style={{ height: spacing.md }} />

        <Text style={styles.label}>Total Runs</Text>
        <Text style={styles.big}>
          {profile?.totalRuns ?? 0}
        </Text>

        <View style={{ height: spacing.md }} />

        <View style={styles.row}>
          <Text style={styles.label}>Premium (Demo)</Text>
          <Switch
            value={!!profile?.isPremium}
            onValueChange={togglePremium}
          />
        </View>

        <View style={{ height: spacing.md }} />

        <View style={styles.row}>
          <Text style={styles.label}>Dark Mode</Text>
          <Switch
            value={mode === "dark"}
            onValueChange={toggleTheme}
          />
        </View>
      </View>

      <View style={{ height: spacing.lg }} />

      <View style={styles.card}>
        <Text style={styles.label}>Recent Results</Text>

        {runs.length === 0 && (
          <Text style={styles.empty}>No runs yet.</Text>
        )}

        {runs.slice(0, 5).map((r) => (
          <View key={r.id} style={styles.resultRow}>
            <Text style={styles.resultScore}>
              {r.focusScore}/100
            </Text>
            <Text style={styles.resultDetail}>
              {Math.round(r.accuracy * 100)}% · L{r.difficultyLevel}
            </Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    wrap: {
      flex: 1,
      backgroundColor: theme.background,
      padding: spacing.xl,
    },

    h: {
      color: theme.text, // PURE WHITE in dark mode
      fontSize: 28,
      fontWeight: "900",
    },

    card: {
      backgroundColor: theme.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
      padding: spacing.lg,
    },

    label: {
      color: theme.text, // IMPORTANT: use white, not muted
      fontWeight: "800",
      fontSize: 14,
    },

    big: {
      color: theme.text,
      fontSize: 32,
      fontWeight: "900",
      marginTop: 4,
    },

    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    resultRow: {
      marginTop: 8,
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },

    resultScore: {
      color: theme.primary,
      fontSize: 16,
      fontWeight: "900",
    },

    resultDetail: {
      color: theme.text, // white for readability
      fontSize: 13,
      fontWeight: "600",
      marginTop: 2,
    },

    empty: {
      color: theme.text,
      marginTop: 8,
      fontWeight: "600",
      opacity: 0.7,
    },
  });
