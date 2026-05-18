export const TASKS_UPDATED_EVENT = "interself:tasks:updated";
export const BOSS_DAMAGE_EVENT = "interself:boss:damage";

export type BossDamagePayload = {
  damage: number;
  source: string;
  critical?: boolean;
  defeated?: boolean;
  rewards?: {
    exp?: number;
    coins?: number;
    itemName?: string | null;
  } | null;
};

export function emitTasksUpdatedEvent() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(TASKS_UPDATED_EVENT));
}

export function subscribeToTasksUpdate(listener: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(TASKS_UPDATED_EVENT, listener);
  return () => window.removeEventListener(TASKS_UPDATED_EVENT, listener);
}

export function emitBossDamageEvent(payload: BossDamagePayload) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(BOSS_DAMAGE_EVENT, { detail: payload }));
}

export function subscribeToBossDamage(listener: (payload: BossDamagePayload) => void) {
  if (typeof window === "undefined") return () => {};
  const handler = (event: Event) => {
    const detail = (event as CustomEvent<BossDamagePayload>).detail;
    listener(detail);
  };
  window.addEventListener(BOSS_DAMAGE_EVENT, handler as EventListener);
  return () => window.removeEventListener(BOSS_DAMAGE_EVENT, handler as EventListener);
}
