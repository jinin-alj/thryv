import { Difficulty } from "./types";

/**
 * 3 Clear Difficulty Tiers
 *
 * Level 1 = Beginner
 * Level 2 = Intermediate
 * Level 3 = Advanced
 *
 * Differences:
 * - Stimulus visible time
 * - Inter-stimulus interval (ISI)
 * - No-Go frequency
 *
 * Each level should FEEL noticeably harder.
 */

export function difficultyForLevel(level: number): Difficulty {
  const lvl = Math.max(1, Math.min(3, level));

  switch (lvl) {
    // 🟢 LEVEL 1 — Beginner
    case 1:
      return {
        level: 1,
        stimulusMs: 800,     // Slow
        isiMs: 700,          // Comfortable spacing
        noGoRate: 0.18,      // Few traps
      };

    // 🟡 LEVEL 2 — Intermediate
    case 2:
      return {
        level: 2,
        stimulusMs: 600,     // Noticeably faster
        isiMs: 520,          // Less breathing room
        noGoRate: 0.28,      // More impulse control
      };

    // 🔴 LEVEL 3 — Advanced
    case 3:
    default:
      return {
        level: 3,
        stimulusMs: 420,     // Fast
        isiMs: 380,          // Rapid transitions
        noGoRate: 0.40,      // Many traps
      };
  }
}
