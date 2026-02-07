import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function setJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getString(key: string, fallback = ""): Promise<string> {
  const v = await AsyncStorage.getItem(key);
  return v ?? fallback;
}

export async function setString(key: string, value: string): Promise<void> {
  await AsyncStorage.setItem(key, value);
}

export async function removeKey(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export const Keys = {
  onboarded: "thryv:onboarded",
  profile: "thryv:profile",
  lastRun: "thryv:lastRun",
  runs: "thryv:runs",
  freePlaysDaily: "thryv:freePlaysDaily",
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
  game: "gonogo";
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

export function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}