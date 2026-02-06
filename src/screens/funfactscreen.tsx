import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { spacing } from "../theme/spacing";
import { useAppTheme } from "../theme/themeContext";
import PrimaryButton from "../ui/primarybutton";

const facts = [
  "Attention is a limited resource — doom-scrolling makes refocusing harder.",
  "Reaction time slows when you're mentally fatigued.",
  "Working memory is the brain’s scratchpad for learning.",
  "Impulse control is critical for sustained focus.",
];

export default function FunFactScreen() {
  const { theme } = useAppTheme();
  const [seed, setSeed] = useState(0);

  const fact = useMemo(() => facts[seed % facts.length], [seed]);
  const styles = makeStyles(theme);

  return (
    <View style={styles.wrap}>
      <Text style={styles.h}>Fun facts</Text>

      <View style={styles.card}>
        <Text style={styles.p}>{fact}</Text>
      </View>

      <View style={{ height: spacing.lg }} />
      <PrimaryButton title="New fact" onPress={() => setSeed((s) => s + 1)} />
    </View>
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
    h: { color: theme.text, fontSize: 26, fontWeight: "900" },
    card: {
      backgroundColor: theme.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
      padding: spacing.lg,
      marginTop: spacing.md,
    },
    p: { color: theme.text, fontSize: 16, fontWeight: "700", lineHeight: 24 },
  });
