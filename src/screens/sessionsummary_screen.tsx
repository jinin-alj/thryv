import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/themeContext";
import { spacing } from "../theme/spacing";
import PrimaryButton from "../ui/primarybutton";

const PALETTE = { deep: "#347679" };

export default function SessionSummaryScreen({ navigation, route }: any) {
  const { theme } = useAppTheme();
  const styles = makeStyles(theme);
  const config = route.params ?? {};

  const totalCycles = config.totalCycles ?? 4;
  const focusDuration = config.focusDuration ?? 25 * 60;
  const prepDuration = config.prepDuration ?? 5 * 60;
  const totalFocusMin = Math.round((totalCycles * focusDuration) / 60);
  const totalPrepMin = Math.round(prepDuration / 60);

  return (
    <SafeAreaView style={styles.wrap}>
      <View style={styles.blobTop} /><View style={styles.blobRight} /><View style={styles.blobBottom} />

      <View style={styles.center}>
        <Text style={styles.emoji}>{"🎉"}</Text>
        <Text style={styles.h}>Session Complete</Text>
        <Text style={styles.sub}>You crushed it. Here's your summary.</Text>

        <View style={{ height: spacing.xl }} />

        <View style={styles.card}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Focus rounds</Text>
            <Text style={styles.statValue}>{totalCycles}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total focus time</Text>
            <Text style={styles.statValue}>{totalFocusMin} min</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Warm-up time</Text>
            <Text style={styles.statValue}>{totalPrepMin} min</Text>
          </View>
        </View>

        <View style={{ height: spacing.xl }} />

        <PrimaryButton title="Back to Home" onPress={() => navigation.replace("Home")}
          style={styles.primaryBtn} textStyle={styles.primaryBtnText} />
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (theme: any) => StyleSheet.create({
  wrap: { flex: 1, backgroundColor: theme.background },
  blobTop: { position: "absolute", top: -180, left: -140, width: 420, height: 420, borderRadius: 210, backgroundColor: "#d1e1e1", opacity: 0.35 },
  blobRight: { position: "absolute", top: 40, right: -180, width: 380, height: 380, borderRadius: 190, backgroundColor: "#a3c1c3", opacity: 0.18 },
  blobBottom: { position: "absolute", bottom: -220, left: -120, width: 520, height: 520, borderRadius: 260, backgroundColor: "#74a3a5", opacity: 0.09 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.xl },
  emoji: { fontSize: 48 },
  h: { color: theme.text, fontSize: 28, fontWeight: "900", marginTop: spacing.md },
  sub: { color: theme.text, opacity: 0.85, fontWeight: "700", marginTop: 6 },
  card: { backgroundColor: "rgba(209,225,225,0.5)", borderRadius: 20, padding: spacing.lg, width: "100%", gap: spacing.md },
  statRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statLabel: { color: theme.text, fontWeight: "700", opacity: 0.7 },
  statValue: { color: PALETTE.deep, fontWeight: "900", fontSize: 18 },
  primaryBtn: { backgroundColor: "rgba(52,118,121,0.14)", paddingVertical: 18, borderRadius: 22, width: "100%" },
  primaryBtnText: { color: PALETTE.deep, fontWeight: "900", fontSize: 18 },
});
