import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { useAppTheme } from "../theme/themeContext";
import { spacing } from "../theme/spacing";
import ProgressBar from "../ui/progressbar";
import { createRun, finishRun } from "../game/visualsearch/engine";
import { difficultyForLevel, getVSMode } from "../game/visualsearch/difficulty";
import { VSTrial, VSRunStats, VSItem } from "../game/visualsearch/types";
import { getJSON, setJSON, Keys } from "../storage/local";
import { SafeAreaView } from "react-native-safe-area-context";

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function ShapeView({ item, size, onPress }: { item: VSItem; size: number; onPress: () => void }) {
  const half = size / 2;

  const shapeStyle = (() => {
    switch (item.shape) {
      case "circle":
        return {
          width: size,
          height: size,
          borderRadius: half,
          backgroundColor: item.color,
        };
      case "square":
        return {
          width: size,
          height: size,
          borderRadius: 4,
          backgroundColor: item.color,
        };
      case "diamond":
        return {
          width: size * 0.75,
          height: size * 0.75,
          backgroundColor: item.color,
          transform: [{ rotate: "45deg" }],
          borderRadius: 3,
        };
      case "triangle":
        return {
          width: 0,
          height: 0,
          borderLeftWidth: half,
          borderRightWidth: half,
          borderBottomWidth: size,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderBottomColor: item.color,
          backgroundColor: "transparent",
        };
      default:
        return { width: size, height: size, backgroundColor: item.color };
    }
  })();

  return (
    <Pressable
      onPress={onPress}
      style={{
        width: size + 8,
        height: size + 8,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View style={shapeStyle} />
    </Pressable>
  );
}

export default function VSGame({
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

  const speedLevel: 1 | 2 | 3 = level === 1 ? 1 : level === 2 ? 2 : 3;
  const diff = useMemo(() => difficultyForLevel(speedLevel), [speedLevel]);
  const mode = useMemo(() => getVSMode(level), [level]);

  const [trials, setTrials] = useState<VSTrial[]>(() =>
    createRun({ difficulty: diff, mode })
  );
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"PLAY" | "FEEDBACK" | "DONE">("PLAY");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearTimer() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }

  useEffect(() => {
    setTrials(createRun({ difficulty: diff, mode }));
    setIndex(0);
    setPhase("PLAY");
  }, [diff, mode]);

  // Mark shownAt when a new trial starts
  useEffect(() => {
    if (phase === "PLAY") {
      setFeedback(null);
      setTrials((prev) => {
        const copy = [...prev];
        if (copy[index]) {
          copy[index] = { ...copy[index], shownAt: Date.now() };
        }
        return copy;
      });

      // Auto-timeout
      clearTimer();
      timerRef.current = setTimeout(() => {
        // Missed
        setTrials((prev) => {
          const copy = [...prev];
          if (copy[index] && copy[index].responded === undefined) {
            copy[index] = { ...copy[index], responded: false, correct: undefined, reactionMs: null };
          }
          return copy;
        });
        advanceTrial();
      }, diff.timeoutMs);
    }

    return clearTimer;
  }, [phase, index]);

  function advanceTrial() {
    setPhase("FEEDBACK");
    setTimeout(() => {
      const next = index + 1;
      if (next >= trials.length) {
        setPhase("DONE");
      } else {
        setIndex(next);
        setPhase("PLAY");
      }
    }, 400);
  }

  async function tapItem(itemIndex: number) {
    if (phase !== "PLAY") return;
    clearTimer();

    const now = Date.now();
    const shownAt = trials[index]?.shownAt ?? now;
    const isCorrect = itemIndex === trials[index]?.targetIndex;

    if (isCorrect) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setFeedback("correct");
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setFeedback("wrong");
    }

    setTrials((prev) => {
      const copy = [...prev];
      const t = copy[index];
      if (!t) return prev;
      copy[index] = {
        ...t,
        responded: true,
        respondedAt: now,
        reactionMs: now - shownAt,
        correct: isCorrect,
      };
      return copy;
    });

    advanceTrial();
  }

  useEffect(() => {
    if (phase === "DONE") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const stats = finishRun(trials);
      persist(stats);
    }
  }, [phase]);

  async function persist(stats: VSRunStats) {
    const run = {
      id: uid(),
      game: "visualsearch" as const,
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      accuracy: stats.accuracy,
      avgReactionMs: stats.avgReactionMs,
      focusScore: stats.scanScore,
      difficultyLevel: level,
      level,
      speedLevel,
      modeId: mode.id,
      correct: stats.correct,
      wrong: stats.wrong,
      missed: stats.missed,
      goCorrect: stats.correct,
      goWrong: stats.wrong,
      noGoCorrect: 0,
      noGoWrong: stats.missed,
    };

    const runs = await getJSON<any[]>(Keys.runs, []);
    await setJSON(Keys.runs, [run, ...runs]);
    await setJSON(Keys.lastRun, run);

    const progressKey = "thryv:vsProgress";
    const progress = await getJSON<any>(progressKey, null);
    if (progress) {
      const tierKey =
        tier === 1 ? "beginner" : tier === 2 ? "intermediate" : tier === 3 ? "advanced" : "expert";
      const block = progress[tierKey]?.blocks?.find((b: any) => b.id === blockId);
      if (block) {
        block.completed = true;
        block.passed = stats.accuracy > 0.7;
      }
      await setJSON(progressKey, progress);
    }

    onFinished();
  }

  const progressPercent = index / trials.length;
  const currentTrial = trials[index];

  const cols = mode.gridSize <= 9 ? 3 : mode.gridSize <= 16 ? 4 : 5;
  const itemSize = mode.gridSize <= 9 ? 48 : mode.gridSize <= 16 ? 40 : 34;

  const ruleText =
    mode.id === "feature"
      ? "Tap the unique colored shape"
      : mode.id === "conjunction"
      ? "Tap the dark teal target shape"
      : "Tap the dark teal target";

  return (
    <SafeAreaView style={styles.wrap}>
      <Text style={styles.h}>Visual Search</Text>

      <View style={styles.banner}>
        <Text style={styles.bannerText}>{ruleText}</Text>
      </View>

      <ProgressBar value={progressPercent} />

      <View style={styles.center}>
        {phase !== "DONE" && currentTrial && (
          <View
            style={[
              styles.grid,
              {
                flexDirection: "row",
                flexWrap: "wrap",
                width: cols * (itemSize + 12),
                justifyContent: "center",
              },
            ]}
          >
            {currentTrial.items.map((item, i) => (
              <ShapeView
                key={item.id}
                item={item}
                size={itemSize}
                onPress={() => tapItem(i)}
              />
            ))}
          </View>
        )}

        {feedback && (
          <Text
            style={[
              styles.feedbackText,
              { color: feedback === "correct" ? "#347679" : "#c0392b" },
            ]}
          >
            {feedback === "correct" ? "Correct!" : "Wrong"}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    wrap: { flex: 1, backgroundColor: theme.background, padding: spacing.xl },
    h: { color: theme.text, fontSize: 28, fontWeight: "900" },
    banner: {
      backgroundColor: "rgba(209, 225, 225, 0.6)",
      paddingVertical: 10, paddingHorizontal: 16,
      borderRadius: 16, marginTop: spacing.sm, marginBottom: spacing.md,
      alignSelf: "flex-start",
    },
    bannerText: { color: theme.text, fontWeight: "800", fontSize: 14 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    grid: { alignItems: "center" },
    feedbackText: { fontSize: 18, fontWeight: "900", marginTop: spacing.md },
  });
