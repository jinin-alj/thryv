import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../app/navigation";
import { spacing } from "../theme/spacing";
import { useAppTheme } from "../theme/themeContext";
import { getJSON, Keys, GameRun } from "../storage/local";
import PrimaryButton from "../ui/primarybutton";

type Props = NativeStackScreenProps<RootStackParamList, "Results">;

export default function ResultsScreen({ navigation }: Props) {
  const { theme } = useAppTheme();
  const styles = makeStyles(theme);

  const [run, setRun] = useState<GameRun | null>(null);

  useEffect(() => {
    (async () => {
      const last = await getJSON<GameRun | null>(Keys.lastRun, null);
      setRun(last);
    })();
  }, []);

  if (!run) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.h}>Loading results…</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.h}>Your Results</Text>

      <View style={{ height: spacing.lg }} />

      <Text style={styles.score}>{run.focusScore}/100</Text>
      <Text style={styles.stat}>
        Accuracy: {Math.round(run.accuracy * 100)}%
      </Text>
      <Text style={styles.stat}>
        Avg Reaction: {run.avgReactionMs ?? "-"} ms
      </Text>
      <Text style={styles.stat}>
        Difficulty: Level {run.difficultyLevel}
      </Text>

      <View style={{ flex: 1 }} />

      <PrimaryButton
        title="Back to Home"
        onPress={() => navigation.replace("Home")}
      />
    </View>
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
      color: theme.text,
      fontSize: 28,
      fontWeight: "900",
    },
    score: {
      color: theme.primary,
      fontSize: 48,
      fontWeight: "900",
    },
    stat: {
      color: theme.text,
      fontSize: 16,
      marginTop: 8,
      fontWeight: "700",
    },
  });
