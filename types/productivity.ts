export type FocusSession = {
  id: string;
  duration: number; // minutes
  label: string;
  completedAt: string; // ISO string
  reward?: {
    damage?: number;
    exp?: number;
    coins?: number;
  };
};

export type HabitProgressMap = Record<string, string[]>;

export type GoalRecord = {
  id: string;
  title: string;
  timeframe: "WEEKLY" | "MONTHLY";
  progress: number;
  focusArea: string;
  tasks: string[];
};

export type TaskSummary = {
  total: number;
  completed: number;
  byCategory: Record<string, { total: number; completed: number }>;
};

export type FocusTrendPoint = {
  dayLabel: string;
  minutes: number;
};

export type HabitScoreSnapshot = {
  completion: number;
  strongest?: string;
  weakest?: string;
};
