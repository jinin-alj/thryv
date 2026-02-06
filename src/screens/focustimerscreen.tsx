import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import PrimaryButton from "../ui/primarybutton";
import ProgressBar from "../ui/progressbar";

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function FocusTimerScreen() {
  const [mode, setMode] = useState<"FOCUS" | "BREAK">("FOCUS");
  const [duration, setDuration] = useState(25 * 60);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const tickRef = useRef<NodeJS.Timeout | null>(null);

  function clear() {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = null;
  }

  useEffect(() => {
    clear();
    if (running) {
      tickRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            clear();
            setRunning(false);
            setMode((m) => (m === "FOCUS" ? "BREAK" : "FOCUS"));
            const next = mode === "FOCUS" ? 5 * 60 : duration; // break = 5m
            return next;
          }
          return r - 1;
        });
      }, 1000);
    }
    return clear;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  function setFocusMinutes(min: number) {
    setMode("FOCUS");
    const sec = min * 60;
    setDuration(sec);
    setRemaining(sec);
    setRunning(false);
  }

  const total = mode === "FOCUS" ? duration : 5 * 60;
  const progress = 1 - remaining / total;

  return (
    <View style={styles.wrap}>
      <Text style={styles.h}>Focus Timer</Text>
      <Text style={styles.sub}>{mode === "FOCUS" ? "Focus block" : "Break"}</Text>

      <View style={{ height: spacing.lg }} />
      <Text style={styles.time}>{fmt(remaining)}</Text>
      <View style={{ height: spacing.md }} />
      <ProgressBar value={progress} />

      <View style={{ height: spacing.lg }} />

      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        <PrimaryButton title="25m" onPress={() => setFocusMinutes(25)} style={{ flex: 1 }} />
        <PrimaryButton title="50m" onPress={() => setFocusMinutes(50)} style={{ flex: 1 }} />
      </View>

      <View style={{ height: spacing.md }} />

      <PrimaryButton
        title={running ? "Pause" : "Start"}
        onPress={() => setRunning((r) => !r)}
      />
      <View style={{ height: spacing.sm }} />
      <PrimaryButton
        title="Reset"
        onPress={() => {
          setRunning(false);
          setRemaining(mode === "FOCUS" ? duration : 5 * 60);
        }}
        style={{ backgroundColor: colors.card }}
      />

      <View style={{ flex: 1 }} />
      <Text style={styles.footer}>
        Tip: During breaks, play a 2-minute sprint instead of scrolling.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl },
  h: { color: colors.text, fontSize: 28, fontWeight: "900" },
  sub: { color: colors.muted, marginTop: 6, fontWeight: "700" },
  time: { color: colors.text, fontSize: 54, fontWeight: "900", marginTop: spacing.lg },
  footer: { color: colors.muted, fontSize: 12, fontWeight: "700", opacity: 0.85 },
});
