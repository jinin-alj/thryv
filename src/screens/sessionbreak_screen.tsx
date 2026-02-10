import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/themeContext";
import { spacing } from "../theme/spacing";
import PrimaryButton from "../ui/primarybutton";

const PALETTE = { deep: "#347679", mist: "#d1e1e1" };

const LONG_BREAK_TIPS = [
  { title: "Stretch", desc: "Stand up and stretch your arms, neck, and back." },
  { title: "Hydrate", desc: "Drink a full glass of water. Your brain needs it." },
  { title: "Move", desc: "Take a short walk. Movement boosts focus." },
  { title: "Eyes", desc: "Look at something 20 feet away for 20 seconds." },
  { title: "Breathe", desc: "Take 5 slow, deep breaths. Reset your nervous system." },
  { title: "Don't lose momentum", desc: "Avoid social media. Come back sharper." },
];

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function SessionBreakScreen({ navigation, route }: any) {
  const { theme } = useAppTheme();
  const styles = makeStyles(theme);
  const config = route.params ?? {};

  const currentCycle = config.currentCycle ?? 1;
  const totalCycles = config.totalCycles ?? 4;
  const cyclesBeforeLongBreak = config.cyclesBeforeLongBreak ?? 0;
  const breakDuration = config.breakDuration ?? 5 * 60;
  const longBreakDuration = config.longBreakDuration ?? 15 * 60;
  const presetId = config.presetId;

  // Determine if this is a long break
  const hasLongBreaks = cyclesBeforeLongBreak > 0 && ["pomodoro", "sustained", "exam"].includes(presetId ?? "");
  const isLongBreak = hasLongBreaks && currentCycle % cyclesBeforeLongBreak === 0;
  const thisDuration = isLongBreak ? longBreakDuration : breakDuration;

  // Check if session is complete
  const isSessionDone = currentCycle >= totalCycles;

  const [remaining, setRemaining] = useState(thisDuration);
  const [showingAdvice, setShowingAdvice] = useState(isLongBreak);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function clear() { if (tickRef.current) clearInterval(tickRef.current); tickRef.current = null; }

  // Break countdown
  useEffect(() => {
    if (showingAdvice) return; // Don't start timer until advice is dismissed
    clear();
    tickRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clear();
          if (isSessionDone) {
            navigation.replace("SessionSummary", config);
          } else {
            // Go to next focus block
            navigation.replace("FocusCountdown", { ...config, currentCycle: currentCycle + 1 });
          }
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return clear;
  }, [showingAdvice]);

  if (isSessionDone) {
    return (
      <SafeAreaView style={styles.wrap}>
        <View style={styles.center}>
          <Text style={styles.h}>Session Complete!</Text>
          <Text style={styles.sub}>Great work. You finished all {totalCycles} rounds.</Text>
          <View style={{ height: spacing.xl }} />
          <PrimaryButton title="View Summary" onPress={() => navigation.replace("SessionSummary", config)}
            style={styles.primaryBtn} textStyle={styles.primaryBtnText} />
        </View>
      </SafeAreaView>
    );
  }

  // Long break advice screen
  if (showingAdvice) {
    const tips = LONG_BREAK_TIPS.slice(0, 3); // Show 3 tips
    return (
      <SafeAreaView style={styles.wrap}>
        <Text style={styles.h}>Long Break</Text>
        <Text style={styles.sub}>Take {Math.round(thisDuration / 60)} minutes to recharge</Text>
        <View style={{ height: spacing.lg }} />

        {tips.map((tip, i) => (
          <View key={i} style={styles.tipCard}>
            <Text style={styles.tipTitle}>{tip.title}</Text>
            <Text style={styles.tipDesc}>{tip.desc}</Text>
          </View>
        ))}

        <View style={{ flex: 1 }} />
        <PrimaryButton title="Continue to Games" onPress={() => setShowingAdvice(false)}
          style={styles.primaryBtn} textStyle={styles.primaryBtnText} />
        <View style={{ height: spacing.lg }} />
      </SafeAreaView>
    );
  }

  // Break with game options
  return (
    <SafeAreaView style={styles.wrap}>
      <Text style={styles.h}>{isLongBreak ? "Long Break" : "Break"}</Text>
      <Text style={styles.timeSmall}>{fmt(remaining)} remaining</Text>

      <View style={{ height: spacing.xl }} />

      <Text style={styles.label}>What would you like to do?</Text>
      <View style={{ height: spacing.md }} />

      <PrimaryButton title="Resume Previous Game"
        onPress={() => navigation.navigate("Category", { region: config.region })}
        style={styles.optionBtn} textStyle={styles.optionText} />

      <View style={{ height: spacing.sm }} />
      <PrimaryButton title="Start New Game"
        onPress={() => navigation.navigate("SessionCategory", { ...config })}
        style={styles.optionBtn} textStyle={styles.optionText} />

      <View style={{ height: spacing.sm }} />
      <PrimaryButton title="New Brain Region"
        onPress={() => navigation.navigate("BrainPrep", { ...config, currentCycle: currentCycle + 1 })}
        style={styles.optionBtn} textStyle={styles.optionText} />

      <View style={{ flex: 1 }} />
      <Pressable onPress={() => navigation.replace("Home")}>
        <Text style={styles.endText}>End session</Text>
      </Pressable>
      <View style={{ height: spacing.lg }} />
    </SafeAreaView>
  );
}

const makeStyles = (theme: any) => StyleSheet.create({
  wrap: { flex: 1, backgroundColor: theme.background, padding: spacing.xl },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  h: { color: theme.text, fontSize: 28, fontWeight: "900" },
  sub: { color: theme.text, opacity: 0.85, fontWeight: "700", marginTop: 6 },
  timeSmall: { color: PALETTE.deep, fontSize: 20, fontWeight: "900", marginTop: 4 },
  label: { color: theme.text, fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
  optionBtn: { backgroundColor: "rgba(209,225,225,0.5)", borderRadius: 18 },
  optionText: { color: PALETTE.deep, fontWeight: "800" },
  primaryBtn: { backgroundColor: "rgba(52,118,121,0.14)", paddingVertical: 18, borderRadius: 22 },
  primaryBtnText: { color: PALETTE.deep, fontWeight: "900", fontSize: 18 },
  tipCard: { backgroundColor: "rgba(209,225,225,0.5)", borderRadius: 16, padding: spacing.md, marginBottom: spacing.sm },
  tipTitle: { color: theme.text, fontWeight: "900", fontSize: 16 },
  tipDesc: { color: theme.text, opacity: 0.75, fontWeight: "600", fontSize: 13, marginTop: 4 },
  endText: { color: theme.text, opacity: 0.4, fontWeight: "700", textAlign: "center", fontSize: 13 },
});
