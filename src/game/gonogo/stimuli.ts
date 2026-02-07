import { Difficulty, Stimulus, GoNoGoMode } from "./types";

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

const SHAPES: Array<"circle" | "triangle" | "square"> = [
  "circle",
  "triangle",
  "square",
];

export function generateStimuli(
  totalTrials: number,
  diff: Difficulty,
  mode?: GoNoGoMode
): Stimulus[] {
  const arr: Stimulus[] = [];

  for (let i = 0; i < totalTrials; i++) {
    const isNoGo = Math.random() < diff.noGoRate;

    const s: Stimulus = {
      id: uid(),
      kind: isNoGo ? "NOGO" : "GO",
    };

    // Default to classic if mode not provided
    const rule = mode?.rule ?? "identity";

    // LEVEL 1 — words: GO / NO GO
    if (rule === "identity") {
      s.symbol = isNoGo ? "NO GO" : "GO";
    }

    // LEVEL 2 — words stay, but ONLY blue letters mean TAP
    // We keep the word as "GO" always, so the rule is purely color-based.
    if (rule === "color") {
      s.symbol = "GO";
      s.color = isNoGo ? "gray" : "blue";
    }

    // LEVEL 3 — shapes only: circle means TAP
    if (rule === "shape") {
      s.shape = isNoGo ? randomFrom(SHAPES.filter((x) => x !== "circle")) : "circle";
    }

    // LEVEL 4 — shapes + color: ONLY blue circle means TAP
    if (rule === "dual") {
      if (isNoGo) {
        // Specifically include the "black/gray circle" no-go case often,
        // since you called it out explicitly.
        const makeGrayCircle = Math.random() < 0.55;
        if (makeGrayCircle) {
          s.shape = "circle";
          s.color = "gray";
        } else {
          // Or a non-circle (any color is irrelevant, still no-go)
          s.shape = randomFrom(SHAPES.filter((x) => x !== "circle"));
          s.color = Math.random() < 0.5 ? "blue" : "gray";
        }
      } else {
        s.shape = "circle";
        s.color = "blue";
      }
    }

    arr.push(s);
  }

  // Ensure enough GO trials
  const minGo = Math.max(3, Math.floor(totalTrials * 0.4));
  const goCount = arr.filter((x) => x.kind === "GO").length;

  if (goCount < minGo) {
    for (let i = 0; i < arr.length && i < minGo; i++) {
      arr[i].kind = "GO";
      // Also ensure the stimulus content matches GO for that rule
      const rule = mode?.rule ?? "identity";
      if (rule === "identity") arr[i].symbol = "GO";
      if (rule === "color") {
        arr[i].symbol = "GO";
        arr[i].color = "blue";
      }
      if (rule === "shape") arr[i].shape = "circle";
      if (rule === "dual") {
        arr[i].shape = "circle";
        arr[i].color = "blue";
      }
    }
  }

  return arr;
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}