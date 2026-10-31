/**
 * Client-side Real-Time Cross-Tab / Cross-Window Synchronization Utility.
 * Ensures appointments booked from the public website (Quick Booking, Calendar Experience, WhatsApp)
 * or modified in Admin Panel (Appointments, CA Smile, Doctor View) are fetched INSTANTLY (0-50ms)
 * across all tabs and open windows without waiting for slow polling intervals.
 */

const SYNC_CHANNEL_NAME = "clinic_appointments_sync_channel";
const CUSTOM_EVENT_NAME = "appointment-status-updated";
const STORAGE_KEY = "last_appointment_update";

export interface SyncEventDetail {
  id?: string;
  action?: string;
  source?: string;
  timestamp?: number;
  [key: string]: any;
}

/**
 * Broadcast an appointment change to all listeners in current tab, other tabs, and admin views.
 */
export function notifyAppointmentUpdate(detail?: SyncEventDetail): void {
  if (typeof window === "undefined") return;

  const eventPayload = {
    ...detail,
    timestamp: Date.now(),
  };

  // 1. Same-window / same-tab dispatch
  try {
    window.dispatchEvent(
      new CustomEvent(CUSTOM_EVENT_NAME, { detail: eventPayload })
    );
  } catch (err) {
    console.warn("CustomEvent dispatch error:", err);
  }

  // 2. Cross-tab fallback via localStorage
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {}

  // 3. Ultra-fast zero-delay cross-tab BroadcastChannel
  try {
    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      channel.postMessage({
        type: "APPOINTMENT_CHANGED",
        payload: eventPayload,
      });
      channel.close();
    }
  } catch (err) {
    console.warn("BroadcastChannel postMessage error:", err);
  }
}

/**
 * Subscribe to appointment updates. Fires callback immediately when:
 * - An appointment is created on the public website or booking modal
 * - An appointment status is changed in CA Smile or Appointments
 * - The browser window/tab gains focus or becomes visible
 * - Cross-tab BroadcastChannel or storage event fires
 * Includes a smart 150ms debounce to prevent redundant rapid fetches.
 */
export function subscribeToAppointmentUpdates(
  callback: (detail?: SyncEventDetail) => void
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  let debounceTimer: any = null;
  const debouncedHandler = (detail?: SyncEventDetail) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      try {
        callback(detail);
      } catch (err) {
        console.error("Error executing appointment sync callback:", err);
      }
    }, 150);
  };

  // 1. Custom event listener (same tab)
  const handleCustomEvent = (e: Event) => {
    const custom = e as CustomEvent<SyncEventDetail>;
    debouncedHandler(custom.detail);
  };
  window.addEventListener(CUSTOM_EVENT_NAME, handleCustomEvent);

  // 2. Storage event listener (other tabs fallback)
  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      debouncedHandler({ source: "storage" });
    }
  };
  window.addEventListener("storage", handleStorageEvent);

  // 3. BroadcastChannel listener (modern cross-tab zero-latency)
  let channel: BroadcastChannel | null = null;
  try {
    if (typeof BroadcastChannel !== "undefined") {
      channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      channel.onmessage = (event) => {
        if (event.data?.type === "APPOINTMENT_CHANGED") {
          debouncedHandler(event.data.payload);
        }
      };
    }
  } catch {}

  // 4. Focus & visibility change (when receptionist switches back to admin tab)
  const handleFocus = () => debouncedHandler({ source: "focus" });
  window.addEventListener("focus", handleFocus);

  const handleVisibilityChange = () => {
    if (typeof document !== "undefined" && document.visibilityState === "visible") {
      debouncedHandler({ source: "visibilitychange" });
    }
  };
  document.addEventListener("visibilitychange", handleVisibilityChange);

  // Cleanup function
  return () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    window.removeEventListener(CUSTOM_EVENT_NAME, handleCustomEvent);
    window.removeEventListener("storage", handleStorageEvent);
    window.removeEventListener("focus", handleFocus);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    if (channel) {
      channel.close();
    }
  };
}
