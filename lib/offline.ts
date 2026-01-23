// Simple offline caching and queue system for trip edits

const CACHE_PREFIX = "trip_cache_";
const QUEUE_PREFIX = "trip_queue_";

export function cacheTripData(tripId: string, data: any) {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${tripId}`, JSON.stringify(data));
    localStorage.setItem(`${CACHE_PREFIX}${tripId}_timestamp`, Date.now().toString());
  } catch (err) {
    console.error("Failed to cache trip data:", err);
  }
}

export function getCachedTripData(tripId: string): any | null {
  try {
    const cached = localStorage.getItem(`${CACHE_PREFIX}${tripId}`);
    if (!cached) return null;
    return JSON.parse(cached);
  } catch (err) {
    console.error("Failed to get cached trip data:", err);
    return null;
  }
}

export function getCacheTimestamp(tripId: string): number | null {
  try {
    const timestamp = localStorage.getItem(`${CACHE_PREFIX}${tripId}_timestamp`);
    return timestamp ? parseInt(timestamp, 10) : null;
  } catch {
    return null;
  }
}

export function clearCache(tripId: string) {
  try {
    localStorage.removeItem(`${CACHE_PREFIX}${tripId}`);
    localStorage.removeItem(`${CACHE_PREFIX}${tripId}_timestamp`);
  } catch (err) {
    console.error("Failed to clear cache:", err);
  }
}

export interface QueuedEdit {
  id: string;
  tripId: string;
  type: "create_item" | "update_item" | "delete_item" | "create_cost" | "create_logistics" | "update_settings";
  endpoint: string;
  method: string;
  body: any;
  timestamp: number;
}

export function queueEdit(edit: Omit<QueuedEdit, "id" | "timestamp">) {
  try {
    const queued: QueuedEdit = {
      ...edit,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    };
    const queue = getQueue(edit.tripId);
    queue.push(queued);
    localStorage.setItem(`${QUEUE_PREFIX}${edit.tripId}`, JSON.stringify(queue));
  } catch (err) {
    console.error("Failed to queue edit:", err);
  }
}

export function getQueue(tripId: string): QueuedEdit[] {
  try {
    const queue = localStorage.getItem(`${QUEUE_PREFIX}${tripId}`);
    return queue ? JSON.parse(queue) : [];
  } catch {
    return [];
  }
}

export function clearQueue(tripId: string) {
  try {
    localStorage.removeItem(`${QUEUE_PREFIX}${tripId}`);
  } catch (err) {
    console.error("Failed to clear queue:", err);
  }
}

export async function syncQueue(tripId: string): Promise<number> {
  const queue = getQueue(tripId);
  if (queue.length === 0) return 0;

  let synced = 0;
  const remaining: QueuedEdit[] = [];

  for (const edit of queue) {
    try {
      const response = await fetch(edit.endpoint, {
        method: edit.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(edit.body),
      });

      if (response.ok) {
        synced++;
      } else {
        remaining.push(edit);
      }
    } catch (err) {
      // Network error, keep in queue
      remaining.push(edit);
    }
  }

  if (remaining.length === 0) {
    clearQueue(tripId);
  } else {
    localStorage.setItem(`${QUEUE_PREFIX}${tripId}`, JSON.stringify(remaining));
  }

  return synced;
}

export function isOnline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine;
}
