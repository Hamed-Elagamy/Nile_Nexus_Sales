/**
 * Nile Nexus Sales - Real-Time Notification & Audio Helpers
 * Handles Web Audio chime synthesis, haptic vibration, and OS notification dispatch
 */

/**
 * Play a clean, professional dual-tone notification chime using Web Audio API
 * Synthesized completely client-side without external asset dependencies
 */
export function playNotificationSound(): void {
  if (typeof window === "undefined") return;

  try {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtxClass) return;

    const ctx = new AudioCtxClass();

    // First chime note: 587.33 Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime);

    gain1.gain.setValueAtTime(0.001, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.28);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.3);

    // Second chime note: 880 Hz (A5) for bright finish
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.12);

    gain2.gain.setValueAtTime(0.001, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.16);
    gain2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.46);

    // Auto-close context after sound finishes
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 600);
  } catch (err) {
    console.debug("[NotificationAudio] Could not play audio chime:", err);
  }
}

/**
 * Trigger mobile device vibration pattern if supported
 */
export function vibrateDevice(pattern: number[] = [150, 70, 150]): void {
  if (typeof window === "undefined" || !("vibrate" in navigator)) return;
  try {
    navigator.vibrate(pattern);
  } catch (err) {
    console.debug("[Vibration] Haptic feedback failed:", err);
  }
}

/**
 * Request OS / Browser notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return Notification.permission;
  }
}

/**
 * Display native operating system notification across mobile (Android/iOS PWA) and desktop
 */
export async function showDeviceNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    tag?: string;
    url?: string;
  }
): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  if (Notification.permission !== "granted") {
    return false;
  }

  const notificationOptions: NotificationOptions = {
    body: options?.body || "",
    icon: options?.icon || "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    tag: options?.tag || `notif-${Date.now()}`,
    data: { url: options?.url || "/notifications" },
  };

  try {
    // If Service Worker is active, display via Service Worker
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, notificationOptions);
      return true;
    }

    // Fallback to standard window Notification constructor
    new Notification(title, notificationOptions);
    return true;
  } catch (err) {
    console.debug("[showDeviceNotification] Fallback error:", err);
    try {
      new Notification(title, notificationOptions);
      return true;
    } catch {
      return false;
    }
  }
}
