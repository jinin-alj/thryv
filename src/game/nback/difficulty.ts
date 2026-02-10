import { NBackDifficulty, NBackMode } from "./types";

export function difficultyForLevel(level: number): NBackDifficulty {
  const lvl = Math.max(1, Math.min(3, level));
  switch (lvl) {
    case 1:
      return { level: 1, stimulusMs: 2000, isiMs: 1000, targetRate: 0.30 };
    case 2:
      return { level: 2, stimulusMs: 1500, isiMs: 750, targetRate: 0.33 };
    case 3:
    default:
      return { level: 3, stimulusMs: 1200, isiMs: 500, targetRate: 0.35 };
  }
}

export const NBACK_MODES: NBackMode[] = [
  { id: "visual", level: 1, name: "1-Back Letters", description: "Is this letter the same as the one before?", nLevel: 1, modality: "letter" },
  { id: "audio", level: 2, name: "2-Back Letters", description: "Is this letter the same as 2 letters ago?", nLevel: 2, modality: "letter" },
  { id: "positional", level: 3, name: "2-Back Position", description: "Is this position the same as 2 positions ago?", nLevel: 2, modality: "position" },
  { id: "dual", level: 4, name: "3-Back Letters", description: "Is this letter the same as 3 letters ago?", nLevel: 3, modality: "letter" },
];

export function getNBackMode(level: number): NBackMode {
  return NBACK_MODES[Math.max(0, Math.min(NBACK_MODES.length - 1, level - 1))];
}
