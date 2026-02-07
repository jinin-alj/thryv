export type StimulusKind = "GO" | "NOGO";

export type StimulusType = "symbol" | "shape" | "colored-shape";
export type RuleType = "identity" | "color" | "shape" | "dual";

export type GoNoGoModeId = "classic" | "color" | "shape" | "dual";

export type GoNoGoMode = {
  id: GoNoGoModeId;
  level: 1 | 2 | 3 | 4;
  name: string;
  description: string;
  stimulusType: StimulusType;
  rule: RuleType;
};

export type Stimulus = {
  id: string;
  kind: StimulusKind;
  shownAt?: number;
  respondedAt?: number;
  correct?: boolean;
  reactionMs?: number | null;

  // Optional presentation + rule features (used by higher modes)
  symbol?: string; // e.g. "X", "O", "A"
  shape?: "circle" | "triangle" | "square";
  color?: "blue" | "gray" | "red";
};

export type Difficulty = {
  level: number; // 1..10
  stimulusMs: number; // how long stimulus is visible
  isiMs: number; // time between stimuli
  noGoRate: number; // 0..1
};

export type RunStats = {
  goCorrect: number;
  goWrong: number;
  noGoCorrect: number;
  noGoWrong: number;
  accuracy: number; // 0..1
  avgReactionMs: number | null;
  focusScore: number; // 0..100
};

export type EngineConfig = {
  totalTrials: number;
  difficulty: Difficulty;

  // Which cognitive mode is being played (defaults can be handled by callers)
  mode?: GoNoGoMode;
};