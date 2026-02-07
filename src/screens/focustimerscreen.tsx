import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../app/navigation";
import { useAppTheme } from "../theme/themeContext";
import { spacing } from "../theme/spacing";
import PrimaryButton from "../ui/primarybutton";
import ProgressBar from "../ui/progressbar";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = NativeStackScreenProps<RootStackParamList, "FocusTimer">;

const PALETTE = {
  deep: "#347679",
  mid: "#478387",
  soft: "#74a3a5",
  light: "#a3c1c3",
  mist: "#d1e1e1",
};

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
    <SafeAreaView style={styles.wrap}>
      <View style={styles.blobTop} />
      <View style={styles.blobRight} />
      <View style={styles.blobBottom} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.h}>Focus Timer</Text>
        <Text style={styles.sub}>
          {mode === "FOCUS" ? "Focus block" : "Break"}
        </Text>

        <View style={{ height: spacing.lg }} />

        <View style={styles.card}>
          <Text style={styles.time}>{fmt(remaining)}</Text>

          <View style={{ height: spacing.md }} />
          <ProgressBar value={progress} />
        </View>

        <View style={{ height: spacing.lg }} />

        {mode === "FOCUS" && (
          <>
            <View style={{ flexDirection: "row", gap: spacing.sm }}>
              <PrimaryButton
                title="25m"
                onPress={() => setFocusMinutes(25)}
                style={[styles.pillBtn, { flex: 1 }]}
                textStyle={styles.pillBtnText}
              />
              <PrimaryButton
                title="50m"
                onPress={() => setFocusMinutes(50)}
                style={[styles.pillBtn, { flex: 1 }]}
                textStyle={styles.pillBtnText}
              />
            </View>

            <View style={{ height: spacing.md }} />
          </>
        )}

        <PrimaryButton
          title={running ? "Pause" : "Start"}
          onPress={() => setRunning((r) => !r)}
          style={styles.primaryBtn}
          textStyle={styles.primaryBtnText}
        />

        <View style={{ height: spacing.sm }} />

        <PrimaryButton
          title="Reset"
          onPress={() => {
            setRunning(false);
            setRemaining(mode === "FOCUS" ? duration : 5 * 60);
          }}
          style={styles.secondaryBtn}
          textStyle={styles.secondaryBtnText}
        />

        <View style={{ flex: 1 }} />

        {mode === "BREAK" && (
          <>
            <PrimaryButton
              title="Play 2-min Sprint"
              onPress={() => navigation.replace("Games")}
              style={styles.primaryBtn}
              textStyle={styles.primaryBtnText}
            />
            <View style={{ height: spacing.sm }} />
          </>
        )}

        <Text style={styles.footer}>
          Tip: During breaks, play a 2-minute sprint instead of scrolling.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    wrap: {
      flex: 1,
      backgroundColor: theme.background,
    },

    content: {
      flexGrow: 1,
      padding: spacing.xl,
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

    card: {
      backgroundColor: "rgba(209, 225, 225, 0.5)",
      borderRadius: 24,
      padding: spacing.lg,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 12 },
      elevation: 2,
    },

    time: {
      color: theme.text,
      fontSize: 54,
      fontWeight: "900",
      marginTop: spacing.sm,
    },

    pillBtn: {
      backgroundColor: "rgba(209, 225, 225, 0.65)",
    },

    pillBtnText: {
      color: PALETTE.deep,
      fontWeight: "800",
    },

    primaryBtn: {
      backgroundColor: "rgba(163, 193, 195, 0.45)",
    },

    primaryBtnText: {
      color: PALETTE.deep,
      fontWeight: "800",
    },

    secondaryBtn: {
      backgroundColor: "rgba(209, 225, 225, 0.6)",
    },

    secondaryBtnText: {
      color: PALETTE.deep,
      fontWeight: "700",
    },

    footer: {
      color: theme.muted,
      fontSize: 12,
      fontWeight: "700",
      opacity: 0.85,
      marginTop: spacing.md,
    },
  });
