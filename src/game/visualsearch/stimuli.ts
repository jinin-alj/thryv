import { VSDifficulty, VSMode, VSTrial, VSItem } from "./types";

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

const SHAPES: VSItem["shape"][] = ["circle", "square", "triangle", "diamond"];
const TARGET_COLOR = "#347679";
const DISTRACTOR_COLORS_LOW = ["#d1e1e1", "#a3c1c3"];
const DISTRACTOR_COLORS_MED = ["#74a3a5", "#a3c1c3", "#93DED5"];
const DISTRACTOR_COLORS_HIGH = ["#478387", "#5a8a8c", "#74a3a5"];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getDistractorColors(similarity: "low" | "medium" | "high"): string[] {
  switch (similarity) {
    case "low":
      return DISTRACTOR_COLORS_LOW;
    case "medium":
      return DISTRACTOR_COLORS_MED;
    case "high":
      return DISTRACTOR_COLORS_HIGH;
  }
}

export function generateTrial(mode: VSMode): VSTrial {
  const items: VSItem[] = [];
  const targetShape = randomFrom(SHAPES);
  const distractorColors = getDistractorColors(mode.distractorSimilarity);
  const targetIndex = Math.floor(Math.random() * mode.gridSize);

  for (let i = 0; i < mode.gridSize; i++) {
    if (i === targetIndex) {
      items.push({
        id: uid(),
        shape: targetShape,
        color: TARGET_COLOR,
        isTarget: true,
      });
    } else {
      // Distractor: different depending on mode
      let shape: VSItem["shape"];
      let color: string;

      if (mode.id === "feature") {
        // Feature search: same shape, different color
        shape = targetShape;
        color = randomFrom(distractorColors);
      } else if (mode.id === "conjunction") {
        // Conjunction: might share shape OR color but not both
        const shareShape = Math.random() < 0.5;
        shape = shareShape ? targetShape : randomFrom(SHAPES.filter((s) => s !== targetShape));
        color = shareShape
          ? randomFrom(distractorColors)
          : Math.random() < 0.3
          ? TARGET_COLOR
          : randomFrom(distractorColors);
      } else {
        // Spatial & crowded: mix of similar shapes and colors
        shape = randomFrom(SHAPES);
        color = randomFrom(distractorColors);
        // Some distractors share the target color to increase difficulty
        if (mode.distractorSimilarity === "high" && Math.random() < 0.3) {
          color = TARGET_COLOR;
          shape = randomFrom(SHAPES.filter((s) => s !== targetShape));
        }
      }

      items.push({
        id: uid(),
        shape,
        color,
        isTarget: false,
      });
    }
  }

  return {
    id: uid(),
    items,
    targetIndex,
  };
}

export function generateTrials(diff: VSDifficulty, mode: VSMode): VSTrial[] {
  return Array.from({ length: diff.trialCount }, () => generateTrial(mode));
}
