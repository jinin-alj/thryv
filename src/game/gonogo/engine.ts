import { EngineConfig, Stimulus } from "./types";
import { generateStimuli } from "./stimuli";
import { computeStats } from "./rules";

export function createRun(config: EngineConfig) {
  const stimuli: Stimulus[] = generateStimuli(config.totalTrials, config.difficulty);
  return stimuli;
}

export function finishRun(stimuli: Stimulus[]) {
  return computeStats(stimuli);
}
