"use client";

type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

const DEFAULT_TTL_MS = 30_000;
const cache = new Map<string, CacheEntry<unknown>>();
const pending = new Map<string, Promise<unknown>>();

export function getCachedJson<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry || entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCachedJson<T>(key: string, data: T, ttlMs = DEFAULT_TTL_MS) {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

export function invalidateCachedJson(key: string) {
  cache.delete(key);
  pending.delete(key);
}

export async function fetchCachedJson<T>(
  key: string,
  options: { ttlMs?: number; force?: boolean } = {}
): Promise<T> {
  if (!options.force) {
    const cached = getCachedJson<T>(key);
    if (cached) return cached;

    const existing = pending.get(key);
    if (existing) return existing as Promise<T>;
  }

  const request = fetch(key, {
    cache: "no-store",
    credentials: "same-origin",
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Failed to fetch ${key}`);
    }

    const data = (await response.json()) as T;
    setCachedJson(key, data, options.ttlMs);
    return data;
  }).finally(() => {
    pending.delete(key);
  });

  pending.set(key, request);
  return request;
}
