import React from "react";
import { View, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../app/navigation";
import { useAppTheme } from "../theme/themeContext";
import { spacing } from "../theme/spacing";
import GoNoGoGame from "./gonogo_screen";
import { getJSON, Keys, GameRun } from "../storage/local";
import { SafeAreaView } from "react-native-safe-area-context";


type Props = NativeStackScreenProps<RootStackParamList, "Games">;

export default function GameScreen({ navigation }: Props) {
  const { theme } = useAppTheme();
  const styles = makeStyles(theme);

  async function handleFinished() {
    const lastRun = await getJSON<GameRun | null>(Keys.lastRun, null);

    if (lastRun) {
      navigation.replace("Results", { runId: lastRun.id });
    } else {
      navigation.replace("Home");
    }
  }

  return (
    <SafeAreaView style={styles.wrap}>
      <GoNoGoGame onFinished={handleFinished} />
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
  });
