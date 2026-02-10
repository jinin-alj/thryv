import { NBackEngineConfig, NBackTrial } from "./types";
import { generateTrials } from "./stimuli";
import { computeStats } from "./rules";

export function createRun(config: NBackEngineConfig) {
  const trials: NBackTrial[] = generateTrials(
    config.totalTrials,
    config.difficulty,
    config.mode
  );
  return trials;
}

export function finishRun(trials: NBackTrial[]) {
  return computeStats(trials);
}
