import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../app/navigation";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { getJSON, Keys, GameRun } from "../storage/local";

type Props = NativeStackScreenProps<RootStackParamList, "Results">;

export default function ResultsScreen({ route, navigation }: Props) {
  const { runId } = route.params;
  const [run, setRun] = useState<GameRun | null>(null);

  useEffect(() => {
    (async () => {
      const last = await getJSON(Keys.lastRun, null);
      setRun(last);
    })();
  }, []);

  if (!run) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading results...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Results</Text>
      <Text style={styles.text}>Run ID: {runId}</Text>
      <Text style={styles.text}>Focus Score: {run.focusScore}/100</Text>
      <Text style={styles.text}>
        Accuracy: {Math.round(run.accuracy * 100)}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
});
