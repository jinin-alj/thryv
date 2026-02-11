import React from "react";
import { View, StyleSheet } from "react-native";
import { useAppTheme } from "../theme/themeContext";
import { spacing } from "../theme/spacing";
import NBackGame from "./nback_screen";
import { getJSON, Keys } from "../storage/local";
import { SafeAreaView } from "react-native-safe-area-context";

const PALETTE = {
  deep: "#347679",
  mid: "#478387",
  soft: "#74a3a5",
  light: "#a3c1c3",
  mist: "#d1e1e1",
};

export default function NBackGameScreen({ navigation, route }: any) {
  const { theme } = useAppTheme();
  const styles = makeStyles(theme);

  const level = route.params?.level ?? 1;
  const tier = route.params?.tier ?? 1;
  const blockId = route.params?.blockId ?? 1;

  async function handleFinished() {
    const lastRun = await getJSON<any>(Keys.lastRun, null);
    if (lastRun) {
      navigation.replace("Results", { runId: lastRun.id, tier, blockId, game: lastRun.game ?? "nback" });
    } else {
      navigation.replace("NBackBlocks", { tier });
    }
  }

  return (
    <SafeAreaView style={styles.wrap}>
      <View style={styles.blobTop} />
      <View style={styles.blobRight} />
      <View style={styles.blobBottom} />

      <NBackGame
        onFinished={handleFinished}
        level={level}
        tier={tier}
        blockId={blockId}
      />
    </SafeAreaView>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    wrap: { flex: 1, backgroundColor: theme.background, padding: spacing.xl },
    blobTop: {
      position: "absolute", top: -180, left: -140,
      width: 420, height: 420, borderRadius: 210,
      backgroundColor: PALETTE.mist, opacity: 0.45,
    },
    blobRight: {
      position: "absolute", top: 40, right: -180,
      width: 380, height: 380, borderRadius: 190,
      backgroundColor: PALETTE.light, opacity: 0.2,
    },
    blobBottom: {
      position: "absolute", bottom: -220, left: -120,
      width: 520, height: 520, borderRadius: 260,
      backgroundColor: PALETTE.soft, opacity: 0.1,
    },
  });
