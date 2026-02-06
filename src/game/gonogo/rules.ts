import { RunStats, Stimulus } from "./types";

export function computeStats(stimuli: Stimulus[]): RunStats {
  let goCorrect = 0, goWrong = 0, noGoCorrect = 0, noGoWrong = 0;
  const rts: number[] = [];

  for (const s of stimuli) {
    if (s.kind === "GO") {
      if (s.correct) {
        goCorrect++;
        if (typeof s.reactionMs === "number") rts.push(s.reactionMs);
      } else {
        goWrong++;
      }
    } else {
      if (s.correct) noGoCorrect++;
      else noGoWrong++;
    }
  }

  const total = stimuli.length || 1;
  const correct = goCorrect + noGoCorrect;
  const accuracy = correct / total;

  const avgReactionMs = rts.length ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length) : null;

  // Focus score: weighted blend (simple + demo-friendly)
  // accuracy is king; fast RT helps; penalties for NOGO errors (impulsivity)
  const impulsivePenalty = Math.min(20, noGoWrong * 6);
  const rtScore =
    avgReactionMs === null ? 50 :
    avgReactionMs <= 350 ? 100 :
    avgReactionMs <= 450 ? 85 :
    avgReactionMs <= 600 ? 65 : 45;

  let focusScore = Math.round(accuracy * 70 + (rtScore * 0.30) - impulsivePenalty);
  focusScore = Math.max(0, Math.min(100, focusScore));

  return { goCorrect, goWrong, noGoCorrect, noGoWrong, accuracy, avgReactionMs, focusScore };
}
