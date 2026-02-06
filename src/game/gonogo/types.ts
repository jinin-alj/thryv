export type StimulusKind = "GO" | "NOGO";

export type Stimulus = {
  id: string;
  kind: StimulusKind;
  shownAt?: number;
  respondedAt?: number;
  correct?: boolean;
  reactionMs?: number | null;
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
};
