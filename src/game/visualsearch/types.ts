export type VSModeId = "feature" | "conjunction" | "spatial" | "crowded";

export type VSMode = {
  id: VSModeId;
  level: 1 | 2 | 3 | 4;
  name: string;
  description: string;
  gridSize: number; // number of items in the grid
  distractorSimilarity: "low" | "medium" | "high";
};

export type VSItem = {
  id: string;
  shape: "circle" | "square" | "triangle" | "diamond";
  color: string;
  isTarget: boolean;
};

export type VSTrial = {
  id: string;
  items: VSItem[];
  targetIndex: number;
  responded?: boolean;
  correct?: boolean;
  shownAt?: number;
  respondedAt?: number;
  reactionMs?: number | null;
};

export type VSDifficulty = {
  level: number;
  timeoutMs: number; // max time allowed per trial
  trialCount: number; // number of trials per block
};

export type VSRunStats = {
  correct: number;
  wrong: number;
  missed: number;
  accuracy: number;
  avgReactionMs: number | null;
  scanScore: number; // 0..100
};

export type VSEngineConfig = {
  difficulty: VSDifficulty;
  mode: VSMode;
};
