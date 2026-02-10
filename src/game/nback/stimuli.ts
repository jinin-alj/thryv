import { NBackDifficulty, NBackTrial, NBackMode } from "./types";

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

const LETTERS = ["B", "C", "D", "F", "G", "H", "K", "L", "N", "P", "Q", "R", "S", "T"];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateTrials(
  totalTrials: number,
  diff: NBackDifficulty,
  mode: NBackMode
): NBackTrial[] {
  const n = mode.nLevel;
  const usesPosition = mode.modality === "position" || mode.modality === "dual";
  const usesLetter = mode.modality === "letter" || mode.modality === "dual";
  const arr: NBackTrial[] = [];

  for (let i = 0; i < totalTrials; i++) {
    const canBeTarget = i >= n;
    const shouldBeTarget = canBeTarget && Math.random() < diff.targetRate;

    let letter: string;
    let position: number | undefined;

    if (shouldBeTarget) {
      const ref = arr[i - n];
      letter = usesLetter ? ref.letter : randomFrom(LETTERS);
      position = usesPosition ? ref.position : undefined;
    } else {
      if (canBeTarget) {
        const ref = arr[i - n];
        if (usesLetter) {
          const pool = LETTERS.filter((l) => l !== ref.letter);
          letter = randomFrom(pool);
        } else {
          letter = randomFrom(LETTERS);
        }
        if (usesPosition) {
          const pool = Array.from({ length: 9 }, (_, idx) => idx).filter(
            (p) => p !== ref.position
          );
          position = randomFrom(pool);
        }
      } else {
        letter = randomFrom(LETTERS);
        position = usesPosition ? Math.floor(Math.random() * 9) : undefined;
      }
    }

    arr.push({
      id: uid(),
      letter: letter!,
      position,
      isTarget: shouldBeTarget,
    });
  }

  const minTargets = Math.max(3, Math.floor(totalTrials * 0.2));
  let targetCount = arr.filter((t) => t.isTarget).length;

  if (targetCount < minTargets) {
    for (let i = n; i < arr.length && targetCount < minTargets; i++) {
      if (!arr[i].isTarget) {
        const ref = arr[i - n];
        if (usesLetter) arr[i].letter = ref.letter;
        if (usesPosition) arr[i].position = ref.position;
        arr[i].isTarget = true;
        targetCount++;
      }
    }
  }

  return arr;
}
