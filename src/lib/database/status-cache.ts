/**
 * In-memory status ping cache to prevent spamming connections to PostgreSQL/Supabase
 * while allowing instant invalidation when an admin toggles database modes.
 */

let lastPingTime = 0;
let lastPingSuccess = true;
let lastPingLatency: number | null = 50;

export function getStatusPingCache(): {
  lastPingTime: number;
  lastPingSuccess: boolean;
  lastPingLatency: number | null;
} {
  return { lastPingTime, lastPingSuccess, lastPingLatency };
}

export function setStatusPingCache(success: boolean, latency: number | null): void {
  lastPingTime = Date.now();
  lastPingSuccess = success;
  lastPingLatency = latency;
}

export function resetStatusPingCache(): void {
  lastPingTime = 0;
}
