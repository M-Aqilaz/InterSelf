export const LEVEL_BASE_EXP = 500;
export const LEVEL_GROWTH = 1.2;

export type LevelProgress = {
  level: number;
  expIntoLevel: number;
  expForNextLevel: number;
  totalExp: number;
};

export function calculateLevelFromTotalExp(totalExp: number): LevelProgress {
  let level = 1;
  let expForNextLevel = LEVEL_BASE_EXP;
  let expIntoLevel = totalExp;

  while (expIntoLevel >= expForNextLevel) {
    expIntoLevel -= expForNextLevel;
    level += 1;
    expForNextLevel = Math.floor(expForNextLevel * LEVEL_GROWTH);
  }

  return {
    level,
    expIntoLevel,
    expForNextLevel,
    totalExp,
  };
}
