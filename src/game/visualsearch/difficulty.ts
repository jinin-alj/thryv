import { VSDifficulty, VSMode } from "./types";

/**
 * SPEED DIFFICULTY — controls time limit and trial count.
 */
export function difficultyForLevel(level: number): VSDifficulty {
  const lvl = Math.max(1, Math.min(3, level));

  switch (lvl) {
    case 1:
      return { level: 1, timeoutMs: 8000, trialCount: 15 };
    case 2:
      return { level: 2, timeoutMs: 5000, trialCount: 18 };
    case 3:
    default:
      return { level: 3, timeoutMs: 3500, trialCount: 20 };
  }
}

/**
 * VISUAL SEARCH MODES
 *
 * Define WHAT the user must find and how hard distractors are.
 */
export const VS_MODES: VSMode[] = [
  {
    id: "feature",
    level: 1,
    name: "Feature Search",
    description: "Find the unique color — one stands out",
    gridSize: 9,
    distractorSimilarity: "low",
  },
  {
    id: "conjunction",
    level: 2,
    name: "Conjunction Search",
    description: "Find the target defined by color AND shape",
    gridSize: 12,
    distractorSimilarity: "medium",
  },
  {
    id: "spatial",
    level: 3,
    name: "Spatial Search",
    description: "Find the target in a larger, spread-out field",
    gridSize: 16,
    distractorSimilarity: "medium",
  },
  {
    id: "crowded",
    level: 4,
    name: "Crowded Field",
    description: "Find the target in a dense, similar field",
    gridSize: 20,
    distractorSimilarity: "high",
  },
];

export function getVSMode(level: number): VSMode {
  return VS_MODES[Math.max(0, Math.min(VS_MODES.length - 1, level - 1))];
}
