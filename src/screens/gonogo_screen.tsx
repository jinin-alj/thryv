import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useAppTheme } from "../theme/themeContext";
import { spacing } from "../theme/spacing";
import ProgressBar from "../ui/progressbar";
import { createRun, finishRun } from "../game/gonogo/engine";
import { difficultyForLevel, getGoNoGoMode } from "../game/gonogo/difficulty";
import { Stimulus, RunStats } from "../game/gonogo/types";
import {
  getJSON,
  setJSON,
  Keys,
  GameRun,
  getGoNoGoProgress,
  setGoNoGoProgress,
} from "../storage/local";
import { SafeAreaView } from "react-native-safe-area-context";

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export default function GoNoGoGame({
  onFinished,
  level,
  tier,
  blockId,
}: {
  onFinished: () => void;
  level: 1 | 2 | 3 | 4;
  tier: 1 | 2 | 3 | 4;
  blockId: number;
}) {
  const { theme } = useAppTheme();
  const styles = makeStyles(theme);

  const totalTrials = 20;

  const speedLevel: 1 | 2 | 3 =
    level === 1 ? 1 : level === 2 ? 2 : 3;

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
            copy[index] = {
              ...s,
              correct: s.kind === "NOGO",
              reactionMs: null,
            };
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
      level,
      speedLevel,
      modeId: mode.id,
      goCorrect: stats.goCorrect,
      goWrong: stats.goWrong,
      noGoCorrect: stats.noGoCorrect,
      noGoWrong: stats.noGoWrong,
    };

    const runs = await getJSON<GameRun[]>(Keys.runs, []);
    await setJSON(Keys.runs, [run, ...runs]);
    await setJSON(Keys.lastRun, run);

    const progress = await getGoNoGoProgress();

    const tierKey =
      tier === 1
        ? "beginner"
        : tier === 2
        ? "intermediate"
        : tier === 3
        ? "advanced"
        : "expert";

    const tierData = progress[tierKey];

    const block = tierData.blocks.find((b) => b.id === blockId);
    if (block) {
      block.completed = true;
      block.passed = stats.accuracy > 0.75;
    }

    if (!tierData.unlocked && !tierData.sampleUsed) {
      tierData.sampleUsed = true;
    }

    const passedCount = tierData.blocks.filter((b) => b.passed).length;

    if (passedCount >= 15) {
      const nextTier =
        tier === 1
          ? "intermediate"
          : tier === 2
          ? "advanced"
          : tier === 3
          ? "expert"
          : null;

      if (nextTier) {
        progress[nextTier].unlocked = true;
      }
    }

    await setGoNoGoProgress(progress);

    onFinished();
  }

  const progressPercent = index / totalTrials;

  const ruleText =
    mode.rule === "identity"
      ? "Tap when it says GO"
      : mode.rule === "color"
      ? "Tap only when the letters are BLUE"
      : mode.rule === "shape"
      ? "Tap only when it’s a CIRCLE"
      : "Tap only when it’s a BLUE CIRCLE";

  return (
    <SafeAreaView style={styles.wrap}>
      <Text style={styles.h}>Go / No-Go</Text>
      <Text style={styles.rule}>{ruleText}</Text>

      <ProgressBar value={progressPercent} />

      <View style={styles.center}>
        <Pressable onPress={tap} style={styles.pad}>
          <View style={styles.stimulus}>
            {phase === "SHOW" && nowStimulus ? (
              mode.rule === "shape" || mode.rule === "dual" ? (
                nowStimulus.shape === "circle" ? (
                  <View style={[styles.circle, { backgroundColor: nowStimulus.color ?? theme.text }]} />
                ) : nowStimulus.shape === "square" ? (
                  <View style={[styles.square, { backgroundColor: nowStimulus.color ?? theme.text }]} />
                ) : (
                  <View style={[styles.triangle, { borderBottomColor: nowStimulus.color ?? theme.text }]} />
                )
              ) : (
                <Text
                  style={[
                    styles.stxt,
                    {
                      color:
                        mode.rule === "color"
                          ? nowStimulus.color === "blue"
                            ? "#347679"
                            : "#333"
                          : theme.text,
                    },
                  ]}
                >
                  {nowStimulus.symbol ?? ""}
                </Text>
              )
            ) : (
              <Text style={styles.stxt}>{""}</Text>
            )}
          </View>
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
    h: {
      color: theme.text,
      fontSize: 28,
      fontWeight: "900",
    },
    rule: {
      color: theme.text,
      fontWeight: "800",
      marginBottom: spacing.md,
      opacity: 0.85,
    },
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    pad: {
      alignItems: "center",
    },
    stimulus: {
      width: 220,
      height: 220,
      borderRadius: 44,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(209, 225, 225, 0.45)",
    },
    stxt: {
      fontSize: 44,
      fontWeight: "900",
    },
    circle: {
      width: 100,
      height: 100,
      borderRadius: 50,
    },
    square: {
      width: 100,
      height: 100,
    },
    triangle: {
      width: 0,
      height: 0,
      borderLeftWidth: 50,
      borderRightWidth: 50,
      borderBottomWidth: 100,
      borderLeftColor: "transparent",
      borderRightColor: "transparent",
    },
  });
