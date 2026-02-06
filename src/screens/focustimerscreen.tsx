import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../app/navigation";
import { useAppTheme } from "../theme/themeContext";
import { spacing } from "../theme/spacing";
import PrimaryButton from "../ui/primarybutton";
import ProgressBar from "../ui/progressbar";

type Props = NativeStackScreenProps<RootStackParamList, "FocusTimer">;

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function FocusTimerScreen({ navigation }: Props) {
  const { theme } = useAppTheme();
  const styles = makeStyles(theme);

  const [mode, setMode] = useState<"FOCUS" | "BREAK">("FOCUS");
  const [duration, setDuration] = useState(25 * 60);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

            const nextMode = mode === "FOCUS" ? "BREAK" : "FOCUS";
            setMode(nextMode);

            const next =
              nextMode === "BREAK" ? 5 * 60 : duration;

            return next;
          }
          return r - 1;
        });
      }, 1000);
    }

    return clear;
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
      <Text style={styles.sub}>
        {mode === "FOCUS" ? "Focus block" : "Break"}
      </Text>

      <View style={{ height: spacing.lg }} />

      <Text style={styles.time}>{fmt(remaining)}</Text>

      <View style={{ height: spacing.md }} />
      <ProgressBar value={progress} />

      <View style={{ height: spacing.lg }} />

      {mode === "FOCUS" && (
        <>
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <PrimaryButton
              title="25m"
              onPress={() => setFocusMinutes(25)}
              style={{ flex: 1 }}
            />
            <PrimaryButton
              title="50m"
              onPress={() => setFocusMinutes(50)}
              style={{ flex: 1 }}
            />
          </View>

          <View style={{ height: spacing.md }} />
        </>
      )}

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
        style={{ backgroundColor: theme.card }}
      />

      <View style={{ flex: 1 }} />

      {mode === "BREAK" && (
        <>
          <PrimaryButton
            title="Play 2-min Sprint"
            onPress={() => navigation.replace("Games")}
          />
          <View style={{ height: spacing.sm }} />
        </>
      )}

      <Text style={styles.footer}>
        Tip: During breaks, play a 2-minute sprint instead of scrolling.
      </Text>
    </View>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    wrap: {
      flex: 1,
      backgroundColor: theme.background,
      padding: spacing.xl,
    },
    h: {
      color: theme.text,
      fontSize: 28,
      fontWeight: "900",
    },
    sub: {
      color: theme.muted,
      marginTop: 6,
      fontWeight: "700",
    },
    time: {
      color: theme.text,
      fontSize: 54,
      fontWeight: "900",
      marginTop: spacing.lg,
    },
    footer: {
      color: theme.muted,
      fontSize: 12,
      fontWeight: "700",
      opacity: 0.85,
    },
  });
