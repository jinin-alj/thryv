import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import ProgressBar from "../ui/progressbar";
import PrimaryButton from "../ui/primarybutton";
import { createRun, finishRun } from "../game/gonogo/engine";
import { difficultyForLevel, adaptLevel } from "../game/gonogo/difficulty";
import { Stimulus, RunStats } from "../game/gonogo/types";
import { getJSON, setJSON, Keys, GameRun, Profile, todayKey } from "../storage/local";

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export default function GoNoGoGame({
  onExit,
  onFinished,
}: {
  onExit: () => void;
  onFinished: () => void;
}) {
  const totalTrials = 20;

  const [level, setLevel] = useState(3);
  const diff = useMemo(() => difficultyForLevel(level), [level]);

  const [stimuli, setStimuli] = useState<Stimulus[]>(() =>
    createRun({ totalTrials, difficulty: diff })
  );
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"READY" | "SHOW" | "ISI" | "DONE">("READY");
  const [nowStimulus, setNowStimulus] = useState<Stimulus | null>(null);

  const startedAtRef = useRef<string>(new Date().toISOString());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  function clearTimer() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }

  useEffect(() => {
    // regenerate run if difficulty changes before start
    if (phase === "READY") {
      setStimuli(createRun({ totalTrials, difficulty: diff }));
      setIndex(0);
      setNowStimulus(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diff.level]);

  useEffect(() => {
    clearTimer();
    if (phase === "SHOW") {
      timerRef.current = setTimeout(() => {
        // if GO and no response => wrong; if NOGO and no response => correct
        setStimuli((prev) => {
          const copy = [...prev];
          const s = copy[index];
          if (s && s.respondedAt == null) {
            const correct = s.kind === "NOGO";
            copy[index] = { ...s, correct, reactionMs: null };
          }
          return copy;
        });
        setPhase("ISI");
      }, diff.stimulusMs);
    } else if (phase === "ISI") {
      timerRef.current = setTimeout(() => {
        const nextIndex = index + 1;
        if (nextIndex >= stimuli.length) {
          setPhase("DONE");
        } else {
          setIndex(nextIndex);
          setPhase("SHOW");
        }
      }, diff.isiMs);
    }
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index]);

  useEffect(() => {
    if (phase === "SHOW") {
      setNowStimulus(() => {
        const s = stimuli[index];
        return s ? { ...s, shownAt: Date.now() } : null;
      });
    } else {
      setNowStimulus(null);
    }
  }, [phase, index, stimuli]);

  function start() {
    startedAtRef.current = new Date().toISOString();
    setIndex(0);
    setPhase("SHOW");
  }

  function tap() {
    if (phase !== "SHOW") return;
    const shownAt = nowStimulus?.shownAt ?? Date.now();
    const respondedAt = Date.now();
    const reactionMs = Math.max(0, respondedAt - shownAt);

    setStimuli((prev) => {
      const copy = [...prev];
      const s = copy[index];
      if (!s) return prev;

      // GO => tap is correct; NOGO => tap is wrong
      const correct = s.kind === "GO";
      copy[index] = { ...s, shownAt, respondedAt, reactionMs, correct };
      return copy;
    });

    // immediately move to ISI after response
    setPhase("ISI");
  }

  async function persistAndFinish(stats: RunStats) {
    const endedAt = new Date().toISOString();

    const run: GameRun = {
      id: uid(),
      game: "gonogo",
      startedAt: startedAtRef.current,
      endedAt,
      accuracy: stats.accuracy,
      avgReactionMs: stats.avgReactionMs,
      focusScore: stats.focusScore,
      difficultyLevel: level,
      goCorrect: stats.goCorrect,
      goWrong: stats.goWrong,
      noGoCorrect: stats.noGoCorrect,
      noGoWrong: stats.noGoWrong,
    };

    // Save last run + append to runs
    const runs = await getJSON<GameRun[]>(Keys.runs, []);
    await setJSON(Keys.runs, [run, ...runs].slice(0, 50));
    await setJSON(Keys.lastRun, run);

    // Update profile streak + totals
    const profile = await getJSON<Profile>(Keys.profile, {
      createdAt: new Date().toISOString(),
      totalRuns: 0,
      streakDays: 0,
      lastActiveDate: todayKey(),
      isPremium: false,
    });

    const today = todayKey();
    let streak = profile.streakDays;
    if (profile.lastActiveDate !== today) {
      // if yesterday then +1 else reset to 1
      const prev = new Date(profile.lastActiveDate + "T00:00:00");
      const cur = new Date(today + "T00:00:00");
      const diffDays = Math.round((cur.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
      streak = diffDays === 1 ? Math.max(1, streak + 1) : 1;
    } else if (streak === 0) {
      streak = 1;
    }

    await setJSON(Keys.profile, {
      ...profile,
      totalRuns: profile.totalRuns + 1,
      lastActiveDate: today,
      streakDays: streak,
    });

    // Adapt difficulty next time
    const nextLevel = adaptLevel(level, stats);
    await setJSON("thryv:gonogo:level", nextLevel);

    onFinished();
  }

  useEffect(() => {
    (async () => {
      const saved = await getJSON<number>("thryv:gonogo:level", 3);
      setLevel(saved);
    })();
  }, []);

  useEffect(() => {
    if (phase === "DONE") {
      const stats = finishRun(stimuli);
      persistAndFinish(stats).catch(() => onFinished());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const progress = (index / totalTrials);

  const kind = nowStimulus?.kind;
  const isGo = kind === "GO";

  return (
    <View style={styles.wrap}>
      <Text style={styles.h}>Go / No-Go</Text>
      <Text style={styles.sub}>Tap on GO. Don’t tap on NO-GO.</Text>

      <View style={{ height: spacing.md }} />
      <ProgressBar value={progress} />
      <Text style={styles.meta}>Difficulty L{level} • Trial {Math.min(index + 1, totalTrials)}/{totalTrials}</Text>

      <View style={{ flex: 1 }} />

      {phase === "READY" ? (
        <View style={{ gap: spacing.sm }}>
          <PrimaryButton title="Start 2-min Sprint" onPress={start} />
          <PrimaryButton title="Exit" onPress={onExit} style={{ backgroundColor: colors.card }} />
        </View>
      ) : (
        <Pressable onPress={tap} style={styles.pad}>
          <View style={[
            styles.stimulus,
            kind === "GO" ? { backgroundColor: colors.success } : null,
            kind === "NOGO" ? { backgroundColor: colors.danger } : null,
            !kind ? { backgroundColor: "rgba(255,255,255,0.08)" } : null,
          ]}>
            <Text style={styles.stxt}>{kind ? (isGo ? "GO" : "NO") : ""}</Text>
          </View>
          <Text style={styles.hint}>{kind ? (isGo ? "TAP" : "DON'T TAP") : ""}</Text>
        </Pressable>
      )}

      <View style={{ flex: 1 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl },
  h: { color: colors.text, fontSize: 28, fontWeight: "900" },
  sub: { color: colors.muted, marginTop: 6, fontWeight: "700" },
  meta: { color: colors.muted, marginTop: spacing.sm, fontWeight: "700", fontSize: 12, opacity: 0.85 },
  pad: { alignItems: "center", justifyContent: "center", gap: spacing.md },
  stimulus: {
    width: 220,
    height: 220,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  stxt: { color: colors.text, fontSize: 44, fontWeight: "900" },
  hint: { color: colors.muted, fontWeight: "900", letterSpacing: 2 },
});
