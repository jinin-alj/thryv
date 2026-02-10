import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../app/navigation";
import { useAppTheme } from "../theme/themeContext";
import { spacing } from "../theme/spacing";
import PrimaryButton from "../ui/primarybutton";
import ProgressBar from "../ui/progressbar";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = NativeStackScreenProps<RootStackParamList, "FocusTimer">;

type Mode = "FOCUS" | "BREAK" | "LONG_BREAK";

type StudyPreset = {
  id: string;
  name: string;
  focusMin: number;
  breakMin: number;
  cyclesBeforeLongBreak?: number; // e.g. 4 (Pomodoro)
  longBreakMin?: number; // e.g. 15
  description: string;
  bestFor: string;
  evidenceLabel: "Evidence-aligned" | "Popular";
};

const STUDY_PRESETS: StudyPreset[] = [
  {
    id: "pomodoro",
    name: "Pomodoro (25/5)",
    focusMin: 25,
    breakMin: 5,
    cyclesBeforeLongBreak: 4,
    longBreakMin: 15,
    description:
      "Classic 25 min focus + 5 min break. Long break every 4 rounds.",
    bestFor:
      "Getting started, procrastination days, and building consistency with clear structure.",
    evidenceLabel: "Popular",
  },
  {
    id: "deep45",
    name: "Sustained Focus (45/10)",
    focusMin: 45,
    breakMin: 10,
    cyclesBeforeLongBreak: 3,
    longBreakMin: 20,
    description: "Longer focus blocks + recovery breaks to manage fatigue.",
    bestFor:
      "Deep work (problem sets, coding, writing) when you want fewer interruptions.",
    evidenceLabel: "Evidence-aligned",
  },
  {
    id: "short20",
    name: "Short Cycles (20/5)",
    focusMin: 20,
    breakMin: 5,
    cyclesBeforeLongBreak: 4,
    longBreakMin: 15,
    description: "Frequent resets for low-stamina / high-distraction days.",
    bestFor:
      "Low energy days, ADHD-like restlessness, or when attention drops quickly.",
    evidenceLabel: "Evidence-aligned",
  },
  {
    id: "exam60",
    name: "Exam Mode (60/10)",
    focusMin: 60,
    breakMin: 10,
    cyclesBeforeLongBreak: 2,
    longBreakMin: 25,
    description: "Fewer switches; longer recovery for heavier study sessions.",
    bestFor:
      "Mock exams, timed practice, and long reading/lecture consolidation blocks.",
    evidenceLabel: "Evidence-aligned",
  },
];

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

function clampInt(n: number, min: number, max: number) {
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

export default function FocusTimerScreen({ navigation }: Props) {
  const { theme } = useAppTheme();
  const styles = makeStyles(theme);

  // ===== Session config =====
  const [focusDuration, setFocusDuration] = useState(25 * 60);
  const [breakDuration, setBreakDuration] = useState(5 * 60);
  const [cyclesBeforeLongBreak, setCyclesBeforeLongBreak] = useState(4);
  const [longBreakDuration, setLongBreakDuration] = useState(15 * 60);

  // ===== Runtime state =====
  const [mode, setMode] = useState<Mode>("FOCUS");
  const [focusBlocksDone, setFocusBlocksDone] = useState(0);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  // ===== Presets selection =====
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(
    STUDY_PRESETS[0].id
  );

  // ===== Personalized timer inputs =====
  const [customFocusMinText, setCustomFocusMinText] = useState("25");
  const [customBreakMinText, setCustomBreakMinText] = useState("5");
  const [customError, setCustomError] = useState<string | null>(null);

  // ===== Interval + refs (avoid stale closure bugs) =====
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const modeRef = useRef<Mode>("FOCUS");
  const focusBlocksDoneRef = useRef<number>(0);
  const focusDurationRef = useRef<number>(focusDuration);
  const breakDurationRef = useRef<number>(breakDuration);
  const cyclesRef = useRef<number>(cyclesBeforeLongBreak);
  const longBreakDurationRef = useRef<number>(longBreakDuration);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    focusBlocksDoneRef.current = focusBlocksDone;
  }, [focusBlocksDone]);

  useEffect(() => {
    focusDurationRef.current = focusDuration;
  }, [focusDuration]);

  useEffect(() => {
    breakDurationRef.current = breakDuration;
  }, [breakDuration]);

  useEffect(() => {
    cyclesRef.current = cyclesBeforeLongBreak;
  }, [cyclesBeforeLongBreak]);

  useEffect(() => {
    longBreakDurationRef.current = longBreakDuration;
  }, [longBreakDuration]);

  function clear() {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = null;
  }

  function hardResetToFocus(focusSec: number) {
    setMode("FOCUS");
    setFocusBlocksDone(0);
    setRemaining(focusSec);
    setRunning(false);

    modeRef.current = "FOCUS";
    focusBlocksDoneRef.current = 0;
  }

  function applyPreset(p: StudyPreset) {
    setSelectedPresetId(p.id);
    setCustomError(null);

    const focusSec = p.focusMin * 60;
    const breakSec = p.breakMin * 60;

    const cycles = p.cyclesBeforeLongBreak ?? 0;
    const longSec = (p.longBreakMin ?? p.breakMin) * 60;

    setFocusDuration(focusSec);
    setBreakDuration(breakSec);
    setCyclesBeforeLongBreak(cycles);
    setLongBreakDuration(longSec);

    // Keep refs in sync immediately
    focusDurationRef.current = focusSec;
    breakDurationRef.current = breakSec;
    cyclesRef.current = cycles;
    longBreakDurationRef.current = longSec;

    // Also reflect in the custom inputs (nice UX)
    setCustomFocusMinText(String(p.focusMin));
    setCustomBreakMinText(String(p.breakMin));

    hardResetToFocus(focusSec);
  }

  function applyCustomTimer() {
    setCustomError(null);

    // parse ints
    const focusMinRaw = parseInt(customFocusMinText.trim(), 10);
    const breakMinRaw = parseInt(customBreakMinText.trim(), 10);

    // basic validation (you can tune these ranges)
    if (Number.isNaN(focusMinRaw) || Number.isNaN(breakMinRaw)) {
      setCustomError("Please enter valid numbers for focus and break minutes.");
      return;
    }

    const focusMin = clampInt(focusMinRaw, 1, 180);
    const breakMin = clampInt(breakMinRaw, 1, 60);

    // Personalized timer: NO long breaks by default (you asked not to mix with study methods)
    setSelectedPresetId(null);

    const focusSec = focusMin * 60;
    const breakSec = breakMin * 60;

    setFocusDuration(focusSec);
    setBreakDuration(breakSec);
    setCyclesBeforeLongBreak(0);
    setLongBreakDuration(breakSec);

    focusDurationRef.current = focusSec;
    breakDurationRef.current = breakSec;
    cyclesRef.current = 0;
    longBreakDurationRef.current = breakSec;

    // Ensure input boxes show clamped values
    setCustomFocusMinText(String(focusMin));
    setCustomBreakMinText(String(breakMin));

    hardResetToFocus(focusSec);
  }

  useEffect(() => {
    clear();

    if (running) {
      tickRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            clear();
            setRunning(false);

            const currentMode = modeRef.current;

            if (currentMode === "FOCUS") {
              const nextCount = focusBlocksDoneRef.current + 1;
              focusBlocksDoneRef.current = nextCount;
              setFocusBlocksDone(nextCount);

              const cycles = cyclesRef.current;
              const isLong =
                cycles > 0 &&
                nextCount % cycles === 0 &&
                longBreakDurationRef.current > 0;

              const nextMode: Mode = isLong ? "LONG_BREAK" : "BREAK";
              modeRef.current = nextMode;
              setMode(nextMode);

              return isLong
                ? longBreakDurationRef.current
                : breakDurationRef.current;
            } else {
              modeRef.current = "FOCUS";
              setMode("FOCUS");
              return focusDurationRef.current;
            }
          }

          return r - 1;
        });
      }, 1000);
    }

    return clear;
  }, [running]);

  const total =
    mode === "FOCUS"
      ? focusDuration
      : mode === "BREAK"
      ? breakDuration
      : longBreakDuration;

  const progress = 1 - remaining / total;

  const selectedPreset =
    selectedPresetId === null
      ? null
      : STUDY_PRESETS.find((p) => p.id === selectedPresetId) ?? null;

  // PrimaryButton.textStyle expects a single object, not an array
  function presetTextStyle(active: boolean) {
    return active ? styles.presetBtnTextActive : styles.presetBtnText;
  }

  const isEditingLocked = running; // disable config while running

  return (
    <SafeAreaView style={styles.wrap}>
      <View style={styles.blobTop} />
      <View style={styles.blobRight} />
      <View style={styles.blobBottom} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.h}>Focus Session</Text>

          <Text style={styles.sub}>
            {mode === "FOCUS"
              ? "Focus block"
              : mode === "BREAK"
              ? "Break"
              : "Long break"}
          </Text>

          <View style={{ height: spacing.lg }} />

          <View style={styles.card}>
            <Text style={styles.time}>{fmt(remaining)}</Text>

            <View style={{ height: spacing.md }} />
            <ProgressBar value={progress} />
          </View>

          <View style={{ height: spacing.lg }} />

          {/* ===== Study methods (presets) ===== */}
          <Text style={styles.sectionLabel}>Study methods</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.presetRow}
          >
            {STUDY_PRESETS.map((p) => {
              const selected = selectedPresetId === p.id;

              return (
                <View key={p.id} style={{ marginRight: spacing.sm }}>
                  <PrimaryButton
                    title={p.name}
                    disabled={isEditingLocked}
                    onPress={() => applyPreset(p)}
                    style={selected ? styles.presetBtnActive : styles.presetBtn}
                    textStyle={presetTextStyle(selected)}
                  />
                </View>
              );
            })}
          </ScrollView>

          {selectedPreset && (
            <View style={styles.presetInfoBox}>
              <Text style={styles.presetInfoTitle}>
                {selectedPreset.description} • {selectedPreset.evidenceLabel}
              </Text>
              <Text style={styles.presetInfoText}>
                <Text style={{ fontWeight: "900" }}>Best for: </Text>
                {selectedPreset.bestFor}
              </Text>
            </View>
          )}

          <View style={{ height: spacing.lg }} />

          {/* ===== Personalized timer (below study methods) ===== */}
          <Text style={styles.sectionLabel}>Personalized timer</Text>
          <Text style={styles.helper}>
            Choose your own focus and break minutes. (This does not add long
            breaks.)
          </Text>

          <View style={{ height: spacing.sm }} />

          <View style={styles.customRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Focus (min)</Text>
              <TextInput
                value={customFocusMinText}
                onChangeText={setCustomFocusMinText}
                editable={!isEditingLocked}
                keyboardType="number-pad"
                placeholder="e.g. 50"
                placeholderTextColor={theme.muted}
                style={[
                  styles.input,
                  isEditingLocked ? styles.inputDisabled : null,
                ]}
              />
            </View>

            <View style={{ width: spacing.sm }} />

            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Break (min)</Text>
              <TextInput
                value={customBreakMinText}
                onChangeText={setCustomBreakMinText}
                editable={!isEditingLocked}
                keyboardType="number-pad"
                placeholder="e.g. 10"
                placeholderTextColor={theme.muted}
                style={[
                  styles.input,
                  isEditingLocked ? styles.inputDisabled : null,
                ]}
              />
            </View>
          </View>

          {customError && <Text style={styles.errorText}>{customError}</Text>}

          <View style={{ height: spacing.sm }} />

          <PrimaryButton
            title="Apply personalized timer"
            disabled={isEditingLocked}
            onPress={applyCustomTimer}
            style={styles.secondaryBtn}
            textStyle={styles.secondaryBtnText}
          />

          <View style={{ height: spacing.lg }} />

          {/* ===== Controls ===== */}
          <PrimaryButton
            title={running ? "Pause" : "Start"}
            onPress={() => {
              if (!running && remaining === (mode === "FOCUS" ? focusDuration : mode === "BREAK" ? breakDuration : longBreakDuration)) {
                // Fresh start -> navigate to prep flow
                navigation.navigate("PrepTimePicker", {
                  focusDuration,
                  breakDuration,
                  cyclesBeforeLongBreak,
                  longBreakDuration,
                  presetId: selectedPresetId,
                  totalCycles: cyclesBeforeLongBreak > 0 ? cyclesBeforeLongBreak : 4,
                  currentCycle: 1,
                });
              } else {
                setRunning((r) => !r);
              }
            }}
            style={styles.primaryBtn}
            textStyle={styles.primaryBtnText}
          />

          <View style={{ height: spacing.sm }} />

          <PrimaryButton
            title="Reset"
            onPress={() => {
              setRunning(false);
              setRemaining(
                mode === "FOCUS"
                  ? focusDuration
                  : mode === "BREAK"
                  ? breakDuration
                  : longBreakDuration
              );
            }}
            style={styles.secondaryBtn}
            textStyle={styles.secondaryBtnText}
          />

          <View style={{ flex: 1 }} />

          {(mode === "BREAK" || mode === "LONG_BREAK") && (
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
      </KeyboardAvoidingView>
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

    sectionLabel: {
      color: theme.muted,
      fontWeight: "800",
      marginBottom: spacing.xs,
    },

    helper: {
      color: theme.muted,
      fontSize: 12,
      fontWeight: "700",
      opacity: 0.9,
      lineHeight: 16,
    },

    presetRow: {
      paddingTop: spacing.sm,
      paddingBottom: spacing.xs,
    },

    presetBtn: {
      backgroundColor: "rgba(209, 225, 225, 0.55)",
      borderRadius: 16,
    },

    presetBtnActive: {
      backgroundColor: "rgba(116, 163, 165, 0.35)",
      borderRadius: 16,
    },

    presetBtnText: {
      color: PALETTE.deep,
      fontWeight: "800",
      fontSize: 14,
    },

    presetBtnTextActive: {
      color: PALETTE.deep,
      fontWeight: "900",
      fontSize: 14,
    },

    presetInfoBox: {
      marginTop: spacing.sm,
      backgroundColor: "rgba(209, 225, 225, 0.35)",
      borderRadius: 16,
      padding: spacing.md,
    },

    presetInfoTitle: {
      color: theme.text,
      fontWeight: "800",
      fontSize: 12,
      marginBottom: 6,
    },

    presetInfoText: {
      color: theme.muted,
      fontWeight: "700",
      fontSize: 12,
      lineHeight: 16,
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

    customRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      marginTop: spacing.xs,
    },

    inputLabel: {
      color: theme.muted,
      fontWeight: "800",
      fontSize: 12,
      marginBottom: 6,
    },

    input: {
      borderWidth: 1,
      borderColor: "rgba(163, 193, 195, 0.65)",
      backgroundColor: "rgba(209, 225, 225, 0.35)",
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 14,
      color: theme.text,
      fontWeight: "800",
      fontSize: 14,
    },

    inputDisabled: {
      opacity: 0.6,
    },

    errorText: {
      marginTop: spacing.xs,
      color: "#B00020",
      fontWeight: "800",
      fontSize: 12,
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
