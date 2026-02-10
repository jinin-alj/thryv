import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/themeContext";
import { spacing } from "../theme/spacing";
import PrimaryButton from "../ui/primarybutton";

const PALETTE = { deep: "#347679", mid: "#478387", soft: "#74a3a5", light: "#a3c1c3", mist: "#d1e1e1" };
const PRESETS = [2, 5, 10];
const ALL_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function PrepTimePickerScreen({ navigation, route }: any) {
  const { theme } = useAppTheme();
  const styles = makeStyles(theme);
  const sessionConfig = route.params ?? {};
  const [prepMin, setPrepMin] = useState(5);

  return (
    <SafeAreaView style={styles.wrap}>
      <View style={styles.blobTop} /><View style={styles.blobRight} /><View style={styles.blobBottom} />

      <Text style={styles.h}>Mental Prep</Text>
      <Text style={styles.sub}>How long do you want to warm up your brain before focusing?</Text>

      <View style={{ height: spacing.xl }} />

      <View style={styles.card}>
        <Text style={styles.label}>Recommended</Text>
        <View style={{ height: spacing.md }} />

        <View style={styles.presetRow}>
          {PRESETS.map((min) => (
            <Pressable key={min} onPress={() => setPrepMin(min)}
              style={[styles.presetBtn, prepMin === min && styles.presetBtnActive]}>
              <Text style={[styles.presetText, prepMin === min && styles.presetTextActive]}>{min} min</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ height: spacing.lg }} />
        <Text style={styles.label}>Or pick any (1-10 min)</Text>
        <View style={{ height: spacing.sm }} />

        <View style={styles.grid}>
          {ALL_OPTIONS.map((min) => (
            <Pressable key={min} onPress={() => setPrepMin(min)}
              style={[styles.gridBtn, prepMin === min && styles.gridBtnActive]}>
              <Text style={[styles.gridText, prepMin === min && styles.gridTextActive]}>{min}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ height: spacing.md }} />
        <Text style={styles.selectedTime}>{prepMin} min warm-up</Text>
      </View>

      <View style={{ flex: 1 }} />

      <PrimaryButton
        title="Choose Brain Region"
        onPress={() => {
          navigation.navigate("BrainPrep", { ...sessionConfig, prepDuration: prepMin * 60 });
        }}
        style={styles.primaryBtn}
        textStyle={styles.primaryBtnText}
      />

      <View style={{ height: spacing.md }} />
      <Pressable onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>
      <View style={{ height: spacing.lg }} />
    </SafeAreaView>
  );
}

const makeStyles = (theme: any) => StyleSheet.create({
  wrap: { flex: 1, backgroundColor: theme.background, padding: spacing.xl },
  blobTop: { position: "absolute", top: -180, left: -140, width: 420, height: 420, borderRadius: 210, backgroundColor: "#d1e1e1", opacity: 0.35 },
  blobRight: { position: "absolute", top: 40, right: -180, width: 380, height: 380, borderRadius: 190, backgroundColor: "#a3c1c3", opacity: 0.18 },
  blobBottom: { position: "absolute", bottom: -220, left: -120, width: 520, height: 520, borderRadius: 260, backgroundColor: "#74a3a5", opacity: 0.09 },
  h: { color: theme.text, fontSize: 28, fontWeight: "900" },
  sub: { color: theme.text, opacity: 0.85, fontWeight: "700", marginTop: 6, lineHeight: 20 },
  card: { backgroundColor: "rgba(209, 225, 225, 0.5)", borderRadius: 20, padding: spacing.lg },
  label: { color: theme.text, fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
  presetRow: { flexDirection: "row", gap: spacing.sm },
  presetBtn: { flex: 1, paddingVertical: 16, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.55)", borderWidth: 1, borderColor: "rgba(0,0,0,0.06)", alignItems: "center" },
  presetBtnActive: { backgroundColor: "rgba(52,118,121,0.18)", borderColor: "#347679" },
  presetText: { color: theme.text, fontWeight: "900", fontSize: 16 },
  presetTextActive: { color: "#347679" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  gridBtn: { width: 52, height: 44, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.45)", borderWidth: 1, borderColor: "rgba(0,0,0,0.06)", alignItems: "center", justifyContent: "center" },
  gridBtnActive: { backgroundColor: "rgba(52,118,121,0.18)", borderColor: "#347679" },
  gridText: { color: theme.text, fontWeight: "800", fontSize: 14 },
  gridTextActive: { color: "#347679" },
  selectedTime: { textAlign: "center", color: "#347679", fontWeight: "900", fontSize: 24 },
  primaryBtn: { backgroundColor: "rgba(52,118,121,0.14)", paddingVertical: 18, borderRadius: 22 },
  primaryBtnText: { color: "#347679", fontWeight: "900", fontSize: 18 },
  back: { alignSelf: "center", paddingVertical: 10, paddingHorizontal: 18, borderRadius: 999, backgroundColor: "rgba(209,225,225,0.45)" },
  backText: { color: theme.text, fontWeight: "900", opacity: 0.9 },
});
