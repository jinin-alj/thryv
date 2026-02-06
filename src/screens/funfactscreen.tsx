import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import PrimaryButton from "../ui/primarybutton";

const facts = [
  "Attention is a limited resource — breaks that add stimulation (doom-scrolling) can make refocusing harder.",
  "Reaction time tends to slow when you’re fatigued — it’s a simple proxy for cognitive load.",
  "Inhibition control (not clicking on No-Go trials) is linked to sustained focus and impulse regulation.",
  "Working memory supports learning — it’s the ‘scratchpad’ your brain uses to manipulate info.",
];

export default function FunFactScreen() {
  const [seed, setSeed] = useState(0);
  const fact = useMemo(() => facts[seed % facts.length], [seed]);

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

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl, justifyContent: "center" },
  h: { color: colors.text, fontSize: 26, fontWeight: "900", marginBottom: spacing.md },
  card: { backgroundColor: colors.card, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  p: { color: colors.text, fontSize: 16, fontWeight: "700", lineHeight: 24 },
});
