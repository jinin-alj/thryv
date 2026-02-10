import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";
import { useAppTheme } from "../theme/themeContext";
import { spacing } from "../theme/spacing";
import * as Haptics from "expo-haptics";

const { width: SCREEN_W } = Dimensions.get("window");

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function FocusCountdownScreen({ navigation, route }: any) {
  const { theme } = useAppTheme();
  const styles = makeStyles(theme);
  const config = route.params ?? {};

  const focusDuration = config.focusDuration ?? 25 * 60;
  const currentCycle = config.currentCycle ?? 1;
  const totalCycles = config.totalCycles ?? 4;

  const [remaining, setRemaining] = useState(focusDuration);
  const [paused, setPaused] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function clear() { if (tickRef.current) clearInterval(tickRef.current); tickRef.current = null; }

  useEffect(() => {
    clear();
    if (!paused) {
      tickRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            clear();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            // Focus block done -> go to break
            setTimeout(() => {
              navigation.replace("SessionBreak", { ...config, currentCycle });
            }, 300);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return clear;
  }, [paused]);

  const progress = 1 - remaining / focusDuration;

  return (
    <View style={styles.wrap}>
      <View style={styles.center}>
        <Text style={styles.modeLabel}>Focus</Text>
        <Text style={styles.time}>{fmt(remaining)}</Text>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>

        <Text style={styles.cycleText}>Round {currentCycle} of {totalCycles}</Text>

        <View style={{ height: spacing.xl }} />

        <Pressable onPress={() => setPaused((p) => !p)} style={styles.pauseBtn}>
          <Text style={styles.pauseText}>{paused ? "Resume" : "Pause"}</Text>
        </Pressable>

        <View style={{ height: spacing.md }} />

        <Pressable onPress={() => { clear(); navigation.replace("Home"); }} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>End Session</Text>
        </Pressable>
      </View>

      <Text style={styles.tip}>Stay focused. You're doing great.</Text>
    </View>
  );
}

const makeStyles = (theme: any) => StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#0a1e1e", justifyContent: "center", padding: spacing.xl },
  center: { alignItems: "center" },
  modeLabel: { color: "#93DED5", fontSize: 14, fontWeight: "800", textTransform: "uppercase", letterSpacing: 2 },
  time: { color: "#fff", fontSize: 72, fontWeight: "900", marginTop: spacing.sm },
  progressBar: { width: SCREEN_W * 0.7, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.15)", marginTop: spacing.lg, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#93DED5", borderRadius: 3 },
  cycleText: { color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: "700", marginTop: spacing.md },
  pauseBtn: { paddingVertical: 14, paddingHorizontal: 36, borderRadius: 22, backgroundColor: "rgba(147, 222, 213, 0.2)" },
  pauseText: { color: "#93DED5", fontWeight: "900", fontSize: 16 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 24, borderRadius: 999 },
  cancelText: { color: "rgba(255,255,255,0.4)", fontWeight: "700", fontSize: 13 },
  tip: { color: "rgba(255,255,255,0.3)", fontWeight: "600", fontSize: 12, textAlign: "center", position: "absolute", bottom: 40, left: 0, right: 0 },
});
