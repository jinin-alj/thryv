import { Difficulty, RunStats } from "./types";

export function difficultyForLevel(level: number): Difficulty {
  const lvl = Math.max(1, Math.min(10, level));
  // harder => shorter stimulus + shorter ISI + more NOGO
  const stimulusMs = 750 - (lvl - 1) * 45; // ~750 -> ~345
  const isiMs = 650 - (lvl - 1) * 35; // ~650 -> ~335
  const noGoRate = 0.18 + (lvl - 1) * 0.03; // ~0.18 -> ~0.45
  return {
    level: lvl,
    stimulusMs: Math.max(280, stimulusMs),
    isiMs: Math.max(250, isiMs),
    noGoRate: Math.min(0.5, noGoRate),
  };
}

export function adaptLevel(current: number, stats: RunStats): number {
  // simple adaptive rule: accuracy + reaction time
  const acc = stats.accuracy;
  const rt = stats.avgReactionMs ?? 9999;

  if (acc >= 0.88 && rt <= 420) return Math.min(10, current + 1);
  if (acc >= 0.80 && rt <= 520) return Math.min(10, current + 1);
  if (acc <= 0.62) return Math.max(1, current - 1);
  return current;
}
