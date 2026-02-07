import { Difficulty, GoNoGoMode } from "./types";

/**
 * Difficulty = SPEED & FREQUENCY
 * Mode = WHAT the player must pay attention to
 *
 * We keep these concepts separate on purpose.
 */

/**
 * SPEED DIFFICULTY (unchanged behavior)
 *
 * Level 1 = Beginner
 * Level 2 = Intermediate
 * Level 3 = Advanced
 */
export function difficultyForLevel(level: number): Difficulty {
  const lvl = Math.max(1, Math.min(3, level));

  switch (lvl) {
    // 🟢 LEVEL 1 — Beginner
    case 1:
      return {
        level: 1,
        stimulusMs: 800,
        isiMs: 700,
        noGoRate: 0.18,
      };

    // 🟡 LEVEL 2 — Intermediate
    case 2:
      return {
        level: 2,
        stimulusMs: 600,
        isiMs: 520,
        noGoRate: 0.28,
      };

    // 🔴 LEVEL 3 — Advanced
    case 3:
    default:
      return {
        level: 3,
        stimulusMs: 420,
        isiMs: 380,
        noGoRate: 0.40,
      };
  }
}

/**
 * GO / NO-GO MODES
 *
 * These define WHAT the user must respond to.
 * One game, escalating cognitive demand.
 */

export const GO_NOGO_MODES: GoNoGoMode[] = [
  {
    id: "classic",
    level: 1,
    name: "Classic",
    description: "Tap only when you see the target symbol",
    stimulusType: "symbol",
    rule: "identity",
  },
  {
    id: "color",
    level: 2,
    name: "Color",
    description: "Tap when the stimulus is blue",
    stimulusType: "symbol",
    rule: "color",
  },
  {
    id: "shape",
    level: 3,
    name: "Shape",
    description: "Tap when the shape is a circle",
    stimulusType: "shape",
    rule: "shape",
  },
  {
    id: "dual",
    level: 4,
    name: "Dual",
    description: "Tap only when the shape is a blue circle",
    stimulusType: "colored-shape",
    rule: "dual",
  },
];

/**
 * Helper
 */
export function getGoNoGoMode(level: number): GoNoGoMode {
  return GO_NOGO_MODES[Math.max(0, Math.min(GO_NOGO_MODES.length - 1, level - 1))];
}
