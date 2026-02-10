import { NBackRunStats, NBackTrial } from "./types";

export function computeStats(trials: NBackTrial[]): NBackRunStats {
  let hits = 0, misses = 0, falseAlarms = 0, correctRejects = 0;
  const rts: number[] = [];

  for (const t of trials) {
    if (t.isTarget) {
      if (t.responded) {
        hits++;
        if (typeof t.reactionMs === "number") rts.push(t.reactionMs);
      } else { misses++; }
    } else {
      if (t.responded) { falseAlarms++; } else { correctRejects++; }
    }
  }

  const total = trials.length || 1;
  const correct = hits + correctRejects;
  const accuracy = correct / total;
  const avgReactionMs = rts.length ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length) : null;

  const falsePenalty = Math.min(25, falseAlarms * 5);
  const rtScore = avgReactionMs === null ? 50 : avgReactionMs <= 500 ? 100 : avgReactionMs <= 700 ? 80 : avgReactionMs <= 1000 ? 60 : 40;

  let memoryScore = Math.round(accuracy * 65 + rtScore * 0.35 - falsePenalty);
  memoryScore = Math.max(0, Math.min(100, memoryScore));

  return { hits, misses, falseAlarms, correctRejects, accuracy, avgReactionMs, memoryScore };
}
