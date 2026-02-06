import { Difficulty, Stimulus } from "./types";

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export function generateStimuli(totalTrials: number, diff: Difficulty): Stimulus[] {
  const arr: Stimulus[] = [];
  for (let i = 0; i < totalTrials; i++) {
    const r = Math.random();
    const kind = r < diff.noGoRate ? "NOGO" : "GO";
    arr.push({ id: uid(), kind });
  }
  // ensure at least a few GO trials
  if (arr.filter(s => s.kind === "GO").length < Math.max(3, Math.floor(totalTrials * 0.4))) {
    for (let i = 0; i < Math.min(3, totalTrials); i++) arr[i].kind = "GO";
  }
  return arr;
}
