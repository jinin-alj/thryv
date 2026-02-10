export type NBackModeId = "visual" | "audio" | "dual" | "positional";

export type NBackMode = {
  id: NBackModeId;
  level: 1 | 2 | 3 | 4;
  name: string;
  description: string;
  nLevel: number;
  modality: "letter" | "position" | "dual";
};

export type NBackTrial = {
  id: string;
  letter: string;
  position?: number;
  isTarget: boolean;
  responded?: boolean;
  correct?: boolean;
  shownAt?: number;
  respondedAt?: number;
  reactionMs?: number | null;
};

export type NBackDifficulty = {
  level: number;
  stimulusMs: number;
  isiMs: number;
  targetRate: number;
};

export type NBackRunStats = {
  hits: number;
  misses: number;
  falseAlarms: number;
  correctRejects: number;
  accuracy: number;
  avgReactionMs: number | null;
  memoryScore: number;
};

export type NBackEngineConfig = {
  totalTrials: number;
  difficulty: NBackDifficulty;
  mode: NBackMode;
};
