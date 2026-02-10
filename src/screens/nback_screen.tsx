import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { useAppTheme } from "../theme/themeContext";
import { spacing } from "../theme/spacing";
import ProgressBar from "../ui/progressbar";
import { createRun, finishRun } from "../game/nback/engine";
import { difficultyForLevel, getNBackMode } from "../game/nback/difficulty";
import { NBackTrial, NBackRunStats } from "../game/nback/types";
import { getJSON, setJSON, Keys } from "../storage/local";
import { SafeAreaView } from "react-native-safe-area-context";

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export default function NBackGame({
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

  const speedLevel: 1 | 2 | 3 = level === 1 ? 1 : level === 2 ? 2 : 3;
  const diff = useMemo(() => difficultyForLevel(speedLevel), [speedLevel]);
  const mode = useMemo(() => getNBackMode(level), [level]);

  const [trials, setTrials] = useState<NBackTrial[]>(() =>
    createRun({ totalTrials, difficulty: diff, mode })
  );
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"SHOW" | "ISI" | "DONE">("SHOW");
  const [responded, setResponded] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearTimer() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }

  // Re-generate on config change
  useEffect(() => {
    setTrials(createRun({ totalTrials, difficulty: diff, mode }));
    setIndex(0);
    setPhase("SHOW");
  }, [diff, mode]);

  // Phase timer
  useEffect(() => {
    clearTimer();

    if (phase === "SHOW") {
      setResponded(false);
      // Mark shownAt
      setTrials((prev) => {
        const copy = [...prev];
        if (copy[index]) {
          copy[index] = { ...copy[index], shownAt: Date.now() };
        }
        return copy;
      });

      timerRef.current = setTimeout(() => {
        // Auto-resolve: if player didn't respond
        setTrials((prev) => {
          const copy = [...prev];
          const t = copy[index];
          if (t && t.responded === undefined) {
            copy[index] = {
              ...t,
              responded: false,
              correct: !t.isTarget, // correct to NOT respond if not a target
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
        if (next >= trials.length) setPhase("DONE");
        else {
          setIndex(next);
          setPhase("SHOW");
        }
      }, diff.isiMs);
    }

    return clearTimer;
  }, [phase, index]);

  // Handle "Match" press
  async function tapMatch() {
    if (phase !== "SHOW" || responded) return;
    setResponded(true);

    const now = Date.now();
    const shownAt = trials[index]?.shownAt ?? now;
    const isTarget = trials[index]?.isTarget ?? false;

    if (isTarget) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
        correct: t.isTarget,
      };
      return copy;
    });
  }

  // Finish
  useEffect(() => {
    if (phase === "DONE") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const stats = finishRun(trials);
      persist(stats);
    }
  }, [phase]);

  async function persist(stats: NBackRunStats) {
    const run = {
      id: uid(),
      game: "nback" as const,
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      accuracy: stats.accuracy,
      avgReactionMs: stats.avgReactionMs,
      focusScore: stats.memoryScore,
      difficultyLevel: level,
      level,
      speedLevel,
      modeId: mode.id,
      hits: stats.hits,
      misses: stats.misses,
      falseAlarms: stats.falseAlarms,
      correctRejects: stats.correctRejects,
      goCorrect: stats.hits,
      goWrong: stats.misses,
      noGoCorrect: stats.correctRejects,
      noGoWrong: stats.falseAlarms,
    };

    const runs = await getJSON<any[]>(Keys.runs, []);
    await setJSON(Keys.runs, [run, ...runs]);
    await setJSON(Keys.lastRun, run);

    // Update nback progress
    const progressKey = "thryv:nbackProgress";
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

  const progressPercent = index / totalTrials;
  const current = trials[index];

  const ruleText =
    mode.nLevel === 1
      ? "Tap MATCH if same as 1 back"
      : mode.nLevel === 2
      ? mode.modality === "position"
        ? "Tap MATCH if same position as 2 back"
        : "Tap MATCH if same as 2 back"
      : "Tap MATCH if same as 3 back";

  return (
    <SafeAreaView style={styles.wrap}>
      <Text style={styles.h}>N-Back Sprint</Text>

      <View style={styles.banner}>
        <Text style={styles.bannerText}>{ruleText}</Text>
      </View>

      <ProgressBar value={progressPercent} />

      <View style={styles.center}>
        <View style={styles.stimulus}>
          {phase === "SHOW" && current ? (
            <Text style={styles.stxt}>{current.letter}</Text>
          ) : (
            <Text style={styles.stxt}>{""}</Text>
          )}
        </View>

        <View style={{ height: spacing.lg }} />

        <Pressable
          onPress={tapMatch}
          disabled={phase !== "SHOW" || responded}
          style={({ pressed }) => [
            styles.matchBtn,
            {
              opacity: phase !== "SHOW" || responded ? 0.4 : pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text style={styles.matchText}>MATCH</Text>
        </Pressable>
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
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 16,
      marginTop: spacing.sm,
      marginBottom: spacing.md,
      alignSelf: "flex-start",
    },
    bannerText: { color: theme.text, fontWeight: "800", fontSize: 14 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    stimulus: {
      width: 180,
      height: 180,
      borderRadius: 40,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(209, 225, 225, 0.45)",
    },
    stxt: { fontSize: 64, fontWeight: "900", color: theme.text },
    matchBtn: {
      paddingVertical: 18,
      paddingHorizontal: 48,
      borderRadius: 22,
      backgroundColor: "rgba(52, 118, 121, 0.18)",
    },
    matchText: {
      color: "#347679",
      fontWeight: "900",
      fontSize: 20,
    },
  });
