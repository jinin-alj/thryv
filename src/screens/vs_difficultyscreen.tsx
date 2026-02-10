import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/themeContext";
import { spacing } from "../theme/spacing";

const PALETTE = {
  deep: "#347679",
  mid: "#478387",
  soft: "#74a3a5",
  light: "#a3c1c3",
  mist: "#d1e1e1",
};

export default function VSDifficultyScreen({ navigation }: any) {
  const { theme } = useAppTheme();
  const styles = makeStyles(theme);

  function go(tier: 1 | 2 | 3 | 4) {
    navigation.navigate("VisualSearchBlocks", { tier });
  }

  return (
    <SafeAreaView style={styles.wrap}>
      <View style={styles.blobTop} />
      <View style={styles.blobRight} />
      <View style={styles.blobBottom} />

      <Text style={styles.h}>Visual Search</Text>
      <Text style={styles.sub}>Choose a difficulty</Text>

      <View style={{ height: spacing.lg }} />

      <View style={styles.card}>
        <Text style={styles.label}>Difficulty</Text>

        <View style={{ height: spacing.md }} />

        <Pressable onPress={() => go(1)} style={styles.option}>
          <Text style={styles.optTitle}>Beginner</Text>
          <Text style={styles.optSub}>Feature: find the unique color</Text>
        </Pressable>

        <Pressable onPress={() => go(2)} style={styles.option}>
          <Text style={styles.optTitle}>Intermediate</Text>
          <Text style={styles.optSub}>Conjunction: color + shape combo</Text>
        </Pressable>

        <Pressable onPress={() => go(3)} style={styles.option}>
          <Text style={styles.optTitle}>Advanced</Text>
          <Text style={styles.optSub}>Spatial: larger, spread-out field</Text>
        </Pressable>

        <Pressable onPress={() => go(4)} style={styles.option}>
          <Text style={styles.optTitle}>Expert</Text>
          <Text style={styles.optSub}>Crowded: dense, similar distractors</Text>
        </Pressable>
      </View>

      <View style={{ height: spacing.lg }} />

      <Pressable onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    wrap: { flex: 1, backgroundColor: theme.background, padding: spacing.xl },
    blobTop: {
      position: "absolute", top: -180, left: -140,
      width: 420, height: 420, borderRadius: 210,
      backgroundColor: PALETTE.mist, opacity: 0.35,
    },
    blobRight: {
      position: "absolute", top: 40, right: -180,
      width: 380, height: 380, borderRadius: 190,
      backgroundColor: PALETTE.light, opacity: 0.18,
    },
    blobBottom: {
      position: "absolute", bottom: -220, left: -120,
      width: 520, height: 520, borderRadius: 260,
      backgroundColor: PALETTE.soft, opacity: 0.09,
    },
    h: { color: theme.text, fontSize: 28, fontWeight: "900" },
    sub: { color: theme.text, opacity: 0.85, fontWeight: "700", marginTop: 6 },
    card: {
      backgroundColor: "rgba(209, 225, 225, 0.5)",
      borderRadius: 20, padding: spacing.lg,
      shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 }, elevation: 2,
      marginTop: spacing.sm, gap: spacing.md,
    },
    label: { color: theme.text, fontSize: 12, fontWeight: "800" },
    option: {
      borderRadius: 18, paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
      backgroundColor: "rgba(255,255,255,0.55)",
      borderWidth: 1, borderColor: "rgba(0,0,0,0.06)", gap: 4,
    },
    optTitle: { color: theme.text, fontSize: 16, fontWeight: "900" },
    optSub: { color: theme.text, opacity: 0.75, fontWeight: "700", fontSize: 12 },
    back: {
      alignSelf: "center", paddingVertical: 10, paddingHorizontal: 18,
      borderRadius: 999, backgroundColor: "rgba(209, 225, 225, 0.45)",
      borderWidth: 1, borderColor: "rgba(0,0,0,0.06)",
    },
    backText: { color: theme.text, fontWeight: "900", opacity: 0.9 },
  });
