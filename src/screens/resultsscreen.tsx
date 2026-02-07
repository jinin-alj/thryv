import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../app/navigation";
import { spacing } from "../theme/spacing";
import { useAppTheme } from "../theme/themeContext";
import { getJSON, Keys, GameRun, getGoNoGoProgress } from "../storage/local";
import PrimaryButton from "../ui/primarybutton";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../auth/AuthContext";
import { saveGameRun } from "../storage/gameRunsRemote";

type Props = NativeStackScreenProps<RootStackParamList, "Results">;

const PALETTE = {
  deep: "#347679",
  mid: "#478387",
  soft: "#74a3a5",
  light: "#a3c1c3",
  mist: "#d1e1e1",
};

export default function ResultsScreen({ navigation, route }: Props) {
  const { theme } = useAppTheme();
  const styles = makeStyles(theme);

  const [run, setRun] = useState<GameRun | null>(null);
  const { user } = useAuth();

  const tier = route.params?.tier ?? 1;
  const blockId = route.params?.blockId ?? 1;

  useEffect(() => {
    (async () => {
      const last = await getJSON<GameRun | null>(Keys.lastRun, null);
      setRun(last);
      if (last && user) {
        await saveGameRun(user.uid, last);
      }
    })();
  }, [user]);

  async function handleNextBlock() {
    const progress = await getGoNoGoProgress();

    const tierKey =
      tier === 1
        ? "beginner"
        : tier === 2
        ? "intermediate"
        : tier === 3
        ? "advanced"
        : "expert";

    const tierData = progress[tierKey];

    const nextBlock = tierData.blocks.find(
      (b) => b.id === blockId + 1
    );

    if (nextBlock) {
      navigation.replace("GoNoGo", {
        level: tier,
        tier,
        blockId: blockId + 1,
      });
    } else {
      navigation.replace("GoNoGoBlocks", { tier });
    }
  }

  function handleBackToBlocks() {
    navigation.replace("GoNoGoBlocks", { tier });
  }

  if (!run) {
    return (
      <SafeAreaView style={styles.wrap}>
        <View style={styles.blobTop} />
        <View style={styles.blobRight} />
        <View style={styles.blobBottom} />
        <Text style={styles.h}>Loading results…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.wrap}>
      <View style={styles.blobTop} />
      <View style={styles.blobRight} />
      <View style={styles.blobBottom} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.h}>Your Results</Text>

        <View style={{ height: spacing.lg }} />

        <View style={styles.card}>
          <Text style={styles.score}>{run.focusScore}/100</Text>

          <View style={{ height: spacing.md }} />

          <Text style={styles.stat}>
            Accuracy: {Math.round(run.accuracy * 100)}%
          </Text>
          <Text style={styles.stat}>
            Avg Reaction: {run.avgReactionMs ?? "-"} ms
          </Text>
          <Text style={styles.stat}>
            Difficulty: Level {run.difficultyLevel}
          </Text>
        </View>

        <View style={{ flex: 1 }} />

        <PrimaryButton
          title="Play Next Block"
          onPress={handleNextBlock}
          style={styles.primaryBtn}
          textStyle={styles.primaryBtnText}
        />

        <View style={{ height: spacing.md }} />

        <PrimaryButton
          title="Back to Blocks"
          onPress={handleBackToBlocks}
          style={styles.primaryBtn}
          textStyle={styles.primaryBtnText}
        />

        <View style={{ height: spacing.md }} />

        <PrimaryButton
          title="Back to Home"
          onPress={() => navigation.replace("Home")}
          style={styles.primaryBtn}
          textStyle={styles.primaryBtnText}
        />

        <View style={{ height: spacing.lg }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    wrap: {
      flex: 1,
      backgroundColor: theme.background,
    },

    content: {
      flexGrow: 1,
      padding: spacing.xl,
    },

    blobTop: {
      position: "absolute",
      top: -180,
      left: -140,
      width: 420,
      height: 420,
      borderRadius: 210,
      backgroundColor: PALETTE.mist,
      opacity: 0.45,
    },
    blobRight: {
      position: "absolute",
      top: 40,
      right: -180,
      width: 380,
      height: 380,
      borderRadius: 190,
      backgroundColor: PALETTE.light,
      opacity: 0.2,
    },
    blobBottom: {
      position: "absolute",
      bottom: -220,
      left: -120,
      width: 520,
      height: 520,
      borderRadius: 260,
      backgroundColor: PALETTE.soft,
      opacity: 0.1,
    },

    h: {
      color: theme.text,
      fontSize: 28,
      fontWeight: "900",
      padding: spacing.xl,
    },

    card: {
      backgroundColor: "rgba(209, 225, 225, 0.5)",
      borderRadius: 24,
      padding: spacing.lg,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 12 },
      elevation: 2,
    },

    score: {
      color: theme.primary,
      fontSize: 52,
      fontWeight: "900",
    },

    stat: {
      color: theme.text,
      fontSize: 16,
      marginTop: 8,
      fontWeight: "700",
      opacity: 0.9,
    },

    primaryBtn: {
      backgroundColor: "rgba(163, 193, 195, 0.45)",
    },

    primaryBtnText: {
      color: PALETTE.deep,
      fontWeight: "800",
    },
  });
