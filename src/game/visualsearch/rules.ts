import { VSRunStats, VSTrial } from "./types";

export function computeStats(trials: VSTrial[]): VSRunStats {
  let correct = 0;
  let wrong = 0;
  let missed = 0;
  const rts: number[] = [];

  for (const t of trials) {
    if (t.correct === true) {
      correct++;
      if (typeof t.reactionMs === "number") rts.push(t.reactionMs);
    } else if (t.correct === false) {
      wrong++;
    } else {
      missed++;
    }
  }

  const total = trials.length || 1;
  const accuracy = correct / total;

  const avgReactionMs = rts.length
    ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length)
    : null;

  // Scan score: accuracy + speed + penalty for misses
  const missPenalty = Math.min(20, missed * 4);
  const rtScore =
    avgReactionMs === null
      ? 50
      : avgReactionMs <= 1500
      ? 100
      : avgReactionMs <= 2500
      ? 80
      : avgReactionMs <= 4000
      ? 60
      : 40;

  let scanScore = Math.round(accuracy * 65 + rtScore * 0.35 - missPenalty);
  scanScore = Math.max(0, Math.min(100, scanScore));

  return { correct, wrong, missed, accuracy, avgReactionMs, scanScore };
}
