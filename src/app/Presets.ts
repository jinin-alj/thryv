export type StudyPreset = {
  id: string;
  name: string;
  focusMin: number;
  breakMin: number;

  cyclesBeforeLongBreak?: number;
  longBreakMin?: number;

  description: string;
  evidenceLabel: "Evidence-aligned" | "Popular";
};

export const STUDY_PRESETS: StudyPreset[] = [
  {
    id: "pomodoro",
    name: "Pomodoro (25/5)",
    focusMin: 25,
    breakMin: 5,
    cyclesBeforeLongBreak: 4,
    longBreakMin: 15,
    description: "Classic 25 min focus + 5 min break. Long break every 4 rounds.",
    evidenceLabel: "Popular",
  },
  {
    id: "deep45",
    name: "Sustained Focus (45/10)",
    focusMin: 45,
    breakMin: 10,
    cyclesBeforeLongBreak: 3,
    longBreakMin: 20,
    description: "Longer focus blocks + recovery breaks (good for deep work).",
    evidenceLabel: "Evidence-aligned",
  },
  {
    id: "short20",
    name: "Short Cycles (20/5)",
    focusMin: 20,
    breakMin: 5,
    cyclesBeforeLongBreak: 4,
    longBreakMin: 15,
    description: "More frequent resets for low-stamina / high-distraction days.",
    evidenceLabel: "Evidence-aligned",
  },
  {
    id: "exam60",
    name: "Exam Mode (60/10)",
    focusMin: 60,
    breakMin: 10,
    cyclesBeforeLongBreak: 2,
    longBreakMin: 25,
    description: "Fewer switches; longer recovery for heavier study sessions.",
    evidenceLabel: "Evidence-aligned",
  },
];
