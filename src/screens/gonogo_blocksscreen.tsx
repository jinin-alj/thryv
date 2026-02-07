import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/themeContext";
import { spacing } from "../theme/spacing";
import {
  getGoNoGoProgress,
  GoNoGoProgress,
} from "../storage/local";

const TIER_NAMES = ["Beginner", "Intermediate", "Advanced", "Expert"];

const COLORS = {
  available: "#a3c1c3",
  passed: "#347679",
  failed: "#74a3a5",
  locked: "#d1e1e1",
};

export default function GoNoGoBlocksScreen({ route, navigation }: any) {
  const { tier } = route.params;
  const { theme } = useAppTheme();
  const styles = makeStyles(theme);

  const [progress, setProgress] = useState<GoNoGoProgress | null>(null);

  useEffect(() => {
    (async () => {
      const p = await getGoNoGoProgress();
      setProgress(p);
    })();
  }, []);

  if (!progress) return null;

  const tierKey =
    tier === 1
      ? "beginner"
      : tier === 2
      ? "intermediate"
      : tier === 3
      ? "advanced"
      : "expert";

  const tierData = progress[tierKey];

  // ✅ FIXED: First block is ALWAYS playable
  function canPlayBlock(blockId: number) {
    if (tierData.unlocked) return true;
    if (blockId === 1) return true;
    return false;
  }

  function openBlock(blockId: number) {
    if (!canPlayBlock(blockId)) return;

    navigation.navigate("GoNoGo", {
      level: tier,
      tier,
      blockId,
    });
  }

  const lockMessage =
    tier === 2
      ? "Finish Beginner to unlock this tier"
      : tier === 3
      ? "Finish Intermediate to unlock this tier"
      : tier === 4
      ? "Finish Advanced to unlock this tier"
      : "";

  return (
    <SafeAreaView style={styles.wrap}>
      <Text style={styles.title}>{TIER_NAMES[tier - 1]}</Text>

      {!tierData.unlocked && tier > 1 && (
        <View style={styles.lockBanner}>
          <Text style={styles.lockText}>{lockMessage}</Text>
          <Text style={styles.lockSub}>
            You can still try the first block
          </Text>
        </View>
      )}

      <FlatList
        data={tierData.blocks}
        numColumns={4}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => {
          const locked = !canPlayBlock(item.id);
          const passed = item.passed;
          const completed = item.completed;

          let backgroundColor = COLORS.available;

          if (locked) backgroundColor = COLORS.locked;
          else if (passed) backgroundColor = COLORS.passed;
          else if (completed && !passed) backgroundColor = COLORS.failed;

          return (
            <Pressable
              onPress={() => openBlock(item.id)}
              style={[
                styles.block,
                { backgroundColor, opacity: locked ? 0.6 : 1 },
              ]}
            >
              <Text style={styles.blockText}>{item.id}</Text>
            </Pressable>
          );
        }}
      />

      <Pressable onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>
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
    title: {
      color: theme.text,
      fontSize: 26,
      fontWeight: "900",
      marginBottom: spacing.md,
    },
    lockBanner: {
      backgroundColor: "rgba(163,193,195,0.35)",
      padding: spacing.md,
      borderRadius: 16,
      marginBottom: spacing.lg,
    },
    lockText: {
      color: theme.text,
      fontWeight: "900",
      textAlign: "center",
    },
    lockSub: {
      color: theme.text,
      opacity: 0.7,
      textAlign: "center",
      marginTop: 4,
      fontWeight: "600",
      fontSize: 12,
    },
    grid: {
      gap: spacing.md,
    },
    block: {
      flex: 1,
      aspectRatio: 1,
      margin: spacing.sm,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
    },
    blockText: {
      fontWeight: "900",
      fontSize: 18,
      color: "#000",
    },
    back: {
      marginTop: spacing.lg,
      alignSelf: "center",
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 999,
      backgroundColor: "rgba(209, 225, 225, 0.45)",
    },
    backText: {
      fontWeight: "900",
      color: theme.text,
    },
  });
