import { VSEngineConfig, VSTrial } from "./types";
import { generateTrials } from "./stimuli";
import { computeStats } from "./rules";

export function createRun(config: VSEngineConfig) {
  return generateTrials(config.difficulty, config.mode);
}

export function finishRun(trials: VSTrial[]) {
  return computeStats(trials);
}
