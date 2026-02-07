import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import { useAppTheme } from "../theme/themeContext";
import { spacing } from "../theme/spacing";
import ProgressBar from "../ui/progressbar";
import { createRun, finishRun } from "../game/gonogo/engine";
import { difficultyForLevel, getGoNoGoMode } from "../game/gonogo/difficulty";
import { Stimulus, RunStats } from "../game/gonogo/types";
import { getJSON, setJSON, Keys, GameRun } from "../storage/local";
import { SafeAreaView } from "react-native-safe-area-context";

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

const MAX_LEVEL = 4;
const RUNS_PER_LEVEL = 3;

const PALETTE = {
  deep: "#347679",
  mid: "#478387",
  soft: "#74a3a5",
  light: "#a3c1c3",
  mist: "#d1e1e1",
};

export default function GoNoGoGame({
  onFinished,
  level: forcedLevel,
}: {
  onFinished: () => void;
  level?: 1 | 2 | 3 | 4;
}) {
  const { theme } = useAppTheme();
  const styles = makeStyles(theme);

  const totalTrials = 20;

  const [level, setLevel] = useState(1);
  const [totalRuns, setTotalRuns] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);

  const levelUpAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const runs = await getJSON<GameRun[]>(Keys.runs, []);
      setTotalRuns(runs.length);

      // If a level is provided (MVP difficulty selection), use it.
      // Otherwise fall back to progressive unlocks.
      const unlocked = Math.min(
        MAX_LEVEL,
        1 + Math.floor(runs.length / RUNS_PER_LEVEL)
      );
      setLevel(forcedLevel ?? unlocked);
    })();
  }, [forcedLevel]);

  const runsIntoLevel = totalRuns % RUNS_PER_LEVEL;
  const runsRemaining = level < MAX_LEVEL ? RUNS_PER_LEVEL - runsIntoLevel : 0;

  const xpProgress = level === MAX_LEVEL ? 1 : runsIntoLevel / RUNS_PER_LEVEL;

  const speedLevel = level === 1 ? 1 : level === 2 ? 2 : 3;

  const diff = useMemo(() => difficultyForLevel(speedLevel), [speedLevel]);
  const mode = useMemo(() => getGoNoGoMode(level), [level]);

  const [stimuli, setStimuli] = useState<Stimulus[]>(() =>
    createRun({ totalTrials, difficulty: diff, mode })
  );

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"SHOW" | "ISI" | "DONE">("SHOW");
  const [nowStimulus, setNowStimulus] = useState<Stimulus | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearTimer() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }

  useEffect(() => {
    setStimuli(createRun({ totalTrials, difficulty: diff, mode }));
    setIndex(0);
    setPhase("SHOW");
  }, [diff, mode]);

  useEffect(() => {
    clearTimer();

    if (phase === "SHOW") {
      timerRef.current = setTimeout(() => {
        setStimuli((prev) => {
          const copy = [...prev];
          const s = copy[index];
          if (s && s.respondedAt == null) {
            copy[index] = { ...s, correct: s.kind === "NOGO", reactionMs: null };
          }
          return copy;
        });
        setPhase("ISI");
      }, diff.stimulusMs);
    }

    if (phase === "ISI") {
      timerRef.current = setTimeout(() => {
        const next = index + 1;
        if (next >= stimuli.length) setPhase("DONE");
        else {
          setIndex(next);
          setPhase("SHOW");
        }
      }, diff.isiMs);
    }

    return clearTimer;
  }, [phase, index]);

  useEffect(() => {
    if (phase === "SHOW") {
      const s = stimuli[index];
      setNowStimulus(s ? { ...s, shownAt: Date.now() } : null);
    } else {
      setNowStimulus(null);
    }
  }, [phase, index]);

  function tap() {
    if (phase !== "SHOW") return;

    const reactedAt = Date.now();
    const shownAt = nowStimulus?.shownAt ?? reactedAt;

    setStimuli((prev) => {
      const copy = [...prev];
      const s = copy[index];
      if (!s) return prev;

      copy[index] = {
        ...s,
        respondedAt: reactedAt,
        reactionMs: reactedAt - shownAt,
        correct: s.kind === "GO",
      };

      return copy;
    });

    setPhase("ISI");
  }

  useEffect(() => {
    if (phase === "DONE") {
      const stats = finishRun(stimuli);
      persist(stats);
    }
  }, [phase]);

  async function persist(stats: RunStats) {
    const run: GameRun = {
      id: uid(),
      game: "gonogo",
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      accuracy: stats.accuracy,
      avgReactionMs: stats.avgReactionMs,
      focusScore: stats.focusScore,
      difficultyLevel: level,
      goCorrect: stats.goCorrect,
      goWrong: stats.goWrong,
      noGoCorrect: stats.noGoCorrect,
      noGoWrong: stats.noGoWrong,
    };

    const runs = await getJSON<GameRun[]>(Keys.runs, []);
    const newRuns = [run, ...runs];
    await setJSON(Keys.runs, newRuns);

    await setJSON(Keys.lastRun, run);

    const newLevel = Math.min(
      MAX_LEVEL,
      1 + Math.floor(newRuns.length / RUNS_PER_LEVEL)
    );

    if (!forcedLevel && newLevel > level) {
      await playLevelUpAnimation();
    }

    onFinished();
  }

  function playLevelUpAnimation(): Promise<void> {
    return new Promise((resolve) => {
      setShowLevelUp(true);
      Animated.sequence([
        Animated.timing(levelUpAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.delay(600),
        Animated.timing(levelUpAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowLevelUp(false);
        resolve();
      });
    });
  }

  const progress = index / totalTrials;

  const instruction =
    mode.rule === "identity"
      ? "Tap when it says GO"
      : mode.rule === "color"
      ? "Tap only when the letters are BLUE"
      : mode.rule === "shape"
      ? "Tap only when it’s a CIRCLE"
      : "Tap only when it’s a BLUE CIRCLE";

  const textColor =
    nowStimulus?.color === "blue"
      ? PALETTE.deep
      : nowStimulus?.color === "gray"
      ? "rgba(10,10,10,0.85)"
      : theme.text;

  const shapeFill = mode.rule === "dual" ? textColor : theme.text;

  const label =
    level === 1
      ? "Beginner"
      : level === 2
      ? "Intermediate"
      : level === 3
      ? "Advanced"
      : "Expert";

  return (
    <SafeAreaView style={styles.wrap}>
      <View style={styles.blobTop} />
      <View style={styles.blobRight} />
      <View style={styles.blobBottom} />

      <Text style={styles.h}>Go / No-Go</Text>
      <Text style={styles.level}>
        {label} · Level {level}
      </Text>

      <View style={styles.card}>
        <Text style={styles.xpLabel}>XP Progress</Text>
        <ProgressBar value={xpProgress} />

        {level < MAX_LEVEL && (
          <Text style={styles.xpText}>
            {runsRemaining} run(s) until next level
          </Text>
        )}
      </View>

      {showLevelUp && (
        <Animated.Text
          style={[
            styles.levelUp,
            {
              opacity: levelUpAnim,
              transform: [{ scale: levelUpAnim }],
            },
          ]}
        >
          LEVEL UP!
        </Animated.Text>
      )}

      <View style={{ height: spacing.md }} />
      <ProgressBar value={progress} />

      <View style={styles.center}>
        <Pressable onPress={tap} style={styles.pad}>
          <View style={styles.stimulus}>
            {phase === "SHOW" && nowStimulus ? (
              mode.rule === "shape" || mode.rule === "dual" ? (
                nowStimulus.shape === "circle" ? (
                  <View style={[styles.shapeCircle, { backgroundColor: shapeFill }]} />
                ) : nowStimulus.shape === "square" ? (
                  <View style={[styles.shapeSquare, { backgroundColor: shapeFill }]} />
                ) : (
                  <View style={[styles.shapeTriangle, { borderBottomColor: shapeFill }]} />
                )
              ) : (
                <Text
                  style={[
                    styles.stxt,
                    { color: mode.rule === "color" ? textColor : theme.text },
                  ]}
                >
                  {nowStimulus.symbol ?? ""}
                </Text>
              )
            ) : (
              <Text style={styles.stxt}>{""}</Text>
            )}
          </View>

          <Text style={styles.hint}>{instruction}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    wrap: {
      flex: 1,
      backgroundColor: theme.background,
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
      opacity: 0.35,
    },
    blobRight: {
      position: "absolute",
      top: 40,
      right: -180,
      width: 380,
      height: 380,
      borderRadius: 190,
      backgroundColor: PALETTE.light,
      opacity: 0.18,
    },
    blobBottom: {
      position: "absolute",
      bottom: -220,
      left: -120,
      width: 520,
      height: 520,
      borderRadius: 260,
      backgroundColor: PALETTE.soft,
      opacity: 0.09,
    },

    h: {
      color: theme.text,
      fontSize: 28,
      fontWeight: "900",
    },

    level: {
      color: theme.primary,
      fontWeight: "800",
      marginBottom: 6,
    },

    card: {
      backgroundColor: "rgba(209, 225, 225, 0.5)",
      borderRadius: 20,
      padding: spacing.lg,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 2,
      marginTop: spacing.sm,
    },

    xpLabel: {
      color: theme.text,
      fontSize: 12,
      fontWeight: "800",
      marginBottom: 4,
    },

    xpText: {
      color: theme.text,
      fontSize: 12,
      marginTop: 4,
      fontWeight: "600",
      opacity: 0.85,
    },

    levelUp: {
      position: "absolute",
      top: 120,
      alignSelf: "center",
      color: theme.success,
      fontSize: 30,
      fontWeight: "900",
      zIndex: 10,
    },

    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },

    pad: {
      alignItems: "center",
      gap: spacing.md,
    },

    stimulus: {
      width: 220,
      height: 220,
      borderRadius: 44,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(209, 225, 225, 0.45)",
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 2,
    },

    stxt: {
      color: theme.text,
      fontSize: 44,
      fontWeight: "900",
    },

    hint: {
      color: theme.text,
      fontWeight: "900",
      opacity: 0.9,
    },

    shapeCircle: {
      width: 96,
      height: 96,
      borderRadius: 48,
    },

    shapeSquare: {
      width: 92,
      height: 92,
      borderRadius: 14,
    },

    shapeTriangle: {
      width: 0,
      height: 0,
      borderLeftWidth: 56,
      borderRightWidth: 56,
      borderBottomWidth: 96,
      borderLeftColor: "transparent",
      borderRightColor: "transparent",
      borderBottomColor: theme.text,
    },
  });