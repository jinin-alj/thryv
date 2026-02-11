import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PALETTE = { deep: "#347679", bg: "rgba(52,118,121,0.12)" };

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

type SessionConfig = Record<string, unknown> & {
  prepDuration?: number;
  breakDuration?: number;
  currentCycle?: number;
  totalCycles?: number;
  cyclesBeforeLongBreak?: number;
  longBreakDuration?: number;
  presetId?: string;
  [key: string]: unknown;
};

type Phase = "prep" | "break" | null;

type SessionTimerContextValue = {
  phase: Phase;
  remaining: number;
  config: SessionConfig | null;
  startPrep: (config: SessionConfig, onEnd: () => void) => void;
  startBreak: (config: SessionConfig, onEnd: () => void, durationSeconds?: number) => void;
  stop: () => void;
};

const SessionTimerContext = createContext<SessionTimerContextValue | null>(null);

export function useSessionTimer() {
  const ctx = useContext(SessionTimerContext);
  return ctx;
}

export function SessionTimerProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [config, setConfig] = useState<SessionConfig | null>(null);
  const onEndRef = useRef<(() => void) | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = null;
    setPhase(null);
    setEndTime(null);
    setRemaining(0);
    setConfig(null);
    onEndRef.current = null;
  }, []);

  const startPrep = useCallback((cfg: SessionConfig, onEnd: () => void) => {
    if (tickRef.current) clearInterval(tickRef.current);
    const duration = (cfg.prepDuration ?? 5 * 60) * 1000;
    const end = Date.now() + duration;
    setPhase("prep");
    setEndTime(end);
    setRemaining(Math.ceil(duration / 1000));
    setConfig(cfg);
    onEndRef.current = onEnd;
  }, []);

  const startBreak = useCallback((cfg: SessionConfig, onEnd: () => void, durationSeconds?: number) => {
    if (tickRef.current) clearInterval(tickRef.current);
    const sec = durationSeconds ?? (cfg.breakDuration ?? 5 * 60);
    const duration = sec * 1000;
    const end = Date.now() + duration;
    setPhase("break");
    setEndTime(end);
    setRemaining(Math.ceil(duration / 1000));
    setConfig(cfg);
    onEndRef.current = onEnd;
  }, []);

  useEffect(() => {
    if (phase == null || endTime == null) return;
    function tick() {
      const sec = Math.max(0, Math.ceil((endTime! - Date.now()) / 1000));
      setRemaining(sec);
      if (sec <= 0) {
        if (tickRef.current) clearInterval(tickRef.current);
        tickRef.current = null;
        const fn = onEndRef.current;
        onEndRef.current = null;
        setPhase(null);
        setEndTime(null);
        setRemaining(0);
        setConfig(null);
        fn?.();
      }
    }
    tickRef.current = setInterval(tick, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = null;
    };
  }, [phase, endTime]);

  const value: SessionTimerContextValue = {
    phase,
    remaining,
    config,
    startPrep,
    startBreak,
    stop,
  };

  const barHeight = 52;
  return (
    <SessionTimerContext.Provider value={value}>
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingTop: phase != null ? barHeight : 0 }}>
          {children}
        </View>
        {phase != null && <SessionTimerBar remaining={remaining} phase={phase} />}
      </View>
    </SessionTimerContext.Provider>
  );
}

function SessionTimerBar({ remaining, phase }: { remaining: number; phase: "prep" | "break" }) {
  const insets = useSafeAreaInsets();
  const label = phase === "prep" ? "Warm-up" : "Break";
  return (
    <View style={[styles.bar, { paddingTop: Math.max(insets.top, 8) }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.time}>{fmt(remaining)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: PALETTE.bg,
    borderBottomWidth: 2,
    borderBottomColor: PALETTE.deep,
  },
  label: {
    fontSize: 14,
    fontWeight: "800",
    color: PALETTE.deep,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  time: {
    fontSize: 18,
    fontWeight: "900",
    color: PALETTE.deep,
  },
});
