/**
 * Fast in-memory cache for appointment queries to deliver ultra-fast (<5ms) responses
 * for /api/admin/today and /api/appointments.
 * Persisted on globalThis to survive Next.js dev re-bundling.
 * Automatically invalidated upon any appointment creation, update, reschedule, or status change.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// TTL for read cache (5 seconds max before background fresh query, but immediately invalidated on mutations)
const DEFAULT_TTL_MS = 5000;

const globalForCache = globalThis as unknown as {
  __todayAppointmentsCache?: Map<string, CacheEntry<any>>;
  __appointmentsListCache?: Map<string, CacheEntry<any>>;
  __queueOrderMemoryCache?: Record<string, string[]>;
  __lastInvalidationTimestamp?: number;
};

if (!globalForCache.__todayAppointmentsCache) {
  globalForCache.__todayAppointmentsCache = new Map();
}
if (!globalForCache.__appointmentsListCache) {
  globalForCache.__appointmentsListCache = new Map();
}
if (!globalForCache.__lastInvalidationTimestamp) {
  globalForCache.__lastInvalidationTimestamp = Date.now();
}

const todayAppointmentsCache = globalForCache.__todayAppointmentsCache;
const appointmentsListCache = globalForCache.__appointmentsListCache;

/**
 * Invalidate all cached appointment data across the server.
 * Call this whenever an appointment is created, updated, status-changed, or rescheduled.
 */
export function invalidateAppointmentsCache(): void {
  todayAppointmentsCache.clear();
  appointmentsListCache.clear();
  globalForCache.__lastInvalidationTimestamp = Date.now();
}

/**
 * Returns the timestamp of the latest cache invalidation.
 */
export function getLastCacheInvalidationTime(): number {
  return globalForCache.__lastInvalidationTimestamp || Date.now();
}

/**
 * Get cached today appointments for a specific date if fresh.
 */
export function getCachedTodayAppointments(dateStr: string): any | null {
  const entry = todayAppointmentsCache.get(dateStr);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > DEFAULT_TTL_MS) {
    todayAppointmentsCache.delete(dateStr);
    return null;
  }
  return entry.data;
}

/**
 * Set cached today appointments for a specific date.
 */
export function setCachedTodayAppointments(dateStr: string, data: any): void {
  todayAppointmentsCache.set(dateStr, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Get cached appointments query response if fresh.
 */
export function getCachedAppointmentsList(cacheKey: string): any | null {
  const entry = appointmentsListCache.get(cacheKey);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > DEFAULT_TTL_MS) {
    appointmentsListCache.delete(cacheKey);
    return null;
  }
  return entry.data;
}

/**
 * Set cached appointments query response.
 */
export function setCachedAppointmentsList(cacheKey: string, data: any): void {
  appointmentsListCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * In-memory cached queue order to eliminate synchronous file system reads on every GET request.
 */
export function getCachedQueueOrder(dateStr: string): string[] | null {
  if (globalForCache.__queueOrderMemoryCache && Array.isArray(globalForCache.__queueOrderMemoryCache[dateStr])) {
    return globalForCache.__queueOrderMemoryCache[dateStr];
  }
  return null;
}

export function setCachedQueueOrder(dateStr: string, order: string[], fullData?: Record<string, string[]>): void {
  if (!globalForCache.__queueOrderMemoryCache) {
    globalForCache.__queueOrderMemoryCache = fullData || {};
  }
  globalForCache.__queueOrderMemoryCache[dateStr] = order;
}

export function setAllCachedQueueOrder(data: Record<string, string[]>): void {
  globalForCache.__queueOrderMemoryCache = data;
}
