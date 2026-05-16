export const TASKS_UPDATED_EVENT = "interself:tasks:updated";

export function emitTasksUpdatedEvent() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(TASKS_UPDATED_EVENT));
}

export function subscribeToTasksUpdate(listener: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(TASKS_UPDATED_EVENT, listener);
  return () => window.removeEventListener(TASKS_UPDATED_EVENT, listener);
}
