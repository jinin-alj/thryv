import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth } from "firebase/auth";

function withUserScope(key: string): string {
  const auth = getAuth();
  const uid = auth.currentUser?.uid;
  if (!uid) return key;
  return `${key}:${uid}`;
}

export async function getJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const scopedKey = withUserScope(key);
    const raw = await AsyncStorage.getItem(scopedKey);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function setJSON<T>(key: string, value: T): Promise<void> {
  const scopedKey = withUserScope(key);
  await AsyncStorage.setItem(scopedKey, JSON.stringify(value));
}

export async function getString(key: string, fallback = ""): Promise<string> {
  const scopedKey = withUserScope(key);
  const v = await AsyncStorage.getItem(scopedKey);
  return v ?? fallback;
}

export async function setString(key: string, value: string): Promise<void> {
  const scopedKey = withUserScope(key);
  await AsyncStorage.setItem(scopedKey, value);
}

export async function removeKey(key: string): Promise<void> {
  const scopedKey = withUserScope(key);
  await AsyncStorage.removeItem(scopedKey);
}

export const Keys = {
  onboarded: "thryv:onboarded",
  profile: "thryv:profile",
  lastRun: "thryv:lastRun",
  runs: "thryv:runs",
  freePlaysDaily: "thryv:freePlaysDaily",
  gonogoProgress: "thryv:gonogoProgress",
} as const;

export type Profile = {
  createdAt: string;
  totalRuns: number;
  streakDays: number;
  lastActiveDate: string; 
  isPremium: boolean; 
};

export type GameRun = {
  id: string;
  game: "gonogo" | "nback" | "visualsearch";
  startedAt: string;
  endedAt: string;
  accuracy: number; 
  avgReactionMs: number | null; 
  focusScore: number; 
  difficultyLevel: number; 

  level?: 1 | 2 | 3 | 4;
  speedLevel?: 1 | 2 | 3;
  modeId?: "classic" | "color" | "shape" | "dual";

  goCorrect: number;
  goWrong: number;
  noGoCorrect: number;
  noGoWrong: number;
};

export type GoNoGoBlock = {
  id: number;
  completed: boolean;
  passed: boolean;
};

export type GoNoGoTierProgress = {
  unlocked: boolean;
  sampleUsed: boolean;
  blocks: GoNoGoBlock[];
};

export type GoNoGoProgress = {
  beginner: GoNoGoTierProgress;
  intermediate: GoNoGoTierProgress;
  advanced: GoNoGoTierProgress;
  expert: GoNoGoTierProgress;
};

function createBlocks(): GoNoGoBlock[] {
  return Array.from({ length: 20 }).map((_, i) => ({
    id: i + 1,
    completed: false,
    passed: false,
  }));
}

export function createInitialGoNoGoProgress(): GoNoGoProgress {
  return {
    beginner: {
      unlocked: true,
      sampleUsed: false,
      blocks: createBlocks(),
    },
    intermediate: {
      unlocked: false,
      sampleUsed: false,
      blocks: createBlocks(),
    },
    advanced: {
      unlocked: false,
      sampleUsed: false,
      blocks: createBlocks(),
    },
    expert: {
      unlocked: false,
      sampleUsed: false,
      blocks: createBlocks(),
    },
  };
}

export async function getGoNoGoProgress(): Promise<GoNoGoProgress> {
  return await getJSON<GoNoGoProgress>(
    Keys.gonogoProgress,
    createInitialGoNoGoProgress()
  );
}

export async function setGoNoGoProgress(progress: GoNoGoProgress): Promise<void> {
  await setJSON(Keys.gonogoProgress, progress);
}

export function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
