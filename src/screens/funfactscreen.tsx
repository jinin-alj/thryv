import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { spacing } from "../theme/spacing";
import { useAppTheme } from "../theme/themeContext";
import PrimaryButton from "../ui/primarybutton";
import { SafeAreaView } from "react-native-safe-area-context";

const facts = [
  "Attention is a limited resource — doom-scrolling makes refocusing harder.",
  "Reaction time slows when you're mentally fatigued.",
  "Working memory is the brain’s scratchpad for learning.",
  "Impulse control is critical for sustained focus.",
];

const PALETTE = {
  deep: "#347679",
  mid: "#478387",
  soft: "#74a3a5",
  light: "#a3c1c3",
  mist: "#d1e1e1",
};

export default function FunFactScreen() {
  const { theme } = useAppTheme();
  const [seed, setSeed] = useState(0);

  const fact = useMemo(() => facts[seed % facts.length], [seed]);
  const styles = makeStyles(theme);

  return (
    <SafeAreaView style={styles.wrap}>
      <View style={styles.blobTop} />
      <View style={styles.blobRight} />
      <View style={styles.blobBottom} />

      <Text style={styles.h}>Fun facts</Text>

      <View style={styles.card}>
        <Text style={styles.p}>{fact}</Text>
      </View>

      <View style={{ height: spacing.lg }} />
      <PrimaryButton
        title="New fact"
        onPress={() => setSeed((s) => s + 1)}
        style={styles.primaryBtn}
        textStyle={styles.primaryBtnText}
      />
    </SafeAreaView>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    wrap: {
      flex: 1,
      backgroundColor: theme.background,
      padding: spacing.xl,
      justifyContent: "center",
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

    h: { color: theme.text, fontSize: 26, fontWeight: "900" },

    card: {
      backgroundColor: "rgba(209, 225, 225, 0.5)",
      borderRadius: 24,
      padding: spacing.lg,
      marginTop: spacing.md,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 12 },
      elevation: 2,
    },

    p: { color: theme.text, fontSize: 16, fontWeight: "700", lineHeight: 24 },

    primaryBtn: {
      backgroundColor: "rgba(163, 193, 195, 0.45)",
    },

    primaryBtnText: {
      color: PALETTE.deep,
      fontWeight: "800",
    },
  });