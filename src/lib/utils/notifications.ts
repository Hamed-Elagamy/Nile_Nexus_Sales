/**
 * Tammlo Sales - Real-Time Notification & Audio Helpers
 * Handles Web Audio chime synthesis, haptic vibration, App Badging, and native OS notification dispatch
 */

let sharedAudioContext: AudioContext | null = null;
let isAudioUnlocked = false;

/**
 * Get or create an active Web Audio context with autoplay unlock
 */
export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  try {
    if (!sharedAudioContext) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        sharedAudioContext = new AudioCtxClass();
      }
    }

    if (sharedAudioContext && sharedAudioContext.state === "suspended") {
      sharedAudioContext.resume().catch(() => {});
    }

    return sharedAudioContext;
  } catch (err) {
    console.debug("[NotificationAudio] Could not create AudioContext:", err);
    return null;
  }
}

/**
 * Unlock AudioContext on the very first user interaction (click / touch / keydown)
 * Prevents mobile browsers and Safari from silencing incoming notification chimes
 */
export function initAudioUnlock(): void {
  if (typeof window === "undefined" || isAudioUnlocked) return;

  const unlock = () => {
    try {
      const ctx = getAudioContext();
      if (ctx && ctx.state === "running") {
        isAudioUnlocked = true;
      }
    } catch {
      // Ignore
    }

    window.removeEventListener("click", unlock);
    window.removeEventListener("touchstart", unlock);
    window.removeEventListener("keydown", unlock);
  };

  window.addEventListener("click", unlock, { passive: true, once: true });
  window.addEventListener("touchstart", unlock, { passive: true, once: true });
  window.addEventListener("keydown", unlock, { passive: true, once: true });
}

/**
 * Play a luxury corporate 3-tone harmonic chime using Web Audio API
 * Synthesizes an F Major triad (F5 698Hz -> A5 880Hz -> C6 1046Hz) with smooth velvety decay
 */
export function playNotificationSound(): void {
  if (typeof window === "undefined") return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Frequencies of an uplifting executive triad
    const notes = [
      { freq: 698.46, start: now + 0.0, dur: 0.35, gain: 0.18 }, // F5
      { freq: 880.0, start: now + 0.08, dur: 0.4, gain: 0.22 }, // A5
      { freq: 1046.5, start: now + 0.16, dur: 0.6, gain: 0.26 }, // C6
    ];

    notes.forEach(({ freq, start, dur, gain }) => {
      // Fundamental tone
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);

      gainNode.gain.setValueAtTime(0.001, start);
      gainNode.gain.exponentialRampToValueAtTime(gain, start + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, start + dur);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + dur + 0.05);

      // Subtle warm overtone (soft harmonic sparkle)
      const harmonicOsc = ctx.createOscillator();
      const harmonicGain = ctx.createGain();

      harmonicOsc.type = "triangle";
      harmonicOsc.frequency.setValueAtTime(freq * 1.5, start);

      harmonicGain.gain.setValueAtTime(0.0005, start);
      harmonicGain.gain.exponentialRampToValueAtTime(gain * 0.18, start + 0.02);
      harmonicGain.gain.exponentialRampToValueAtTime(0.0001, start + dur * 0.7);

      harmonicOsc.connect(harmonicGain);
      harmonicGain.connect(ctx.destination);

      harmonicOsc.start(start);
      harmonicOsc.stop(start + dur * 0.7 + 0.05);
    });
  } catch (err) {
    console.debug("[NotificationAudio] Could not play audio chime:", err);
  }
}

/**
 * Trigger mobile device vibration pattern if supported
 */
export function vibrateDevice(pattern: number[] = [120, 60, 120]): void {
  if (typeof window === "undefined" || !("vibrate" in navigator)) return;
  try {
    navigator.vibrate(pattern);
  } catch (err) {
    console.debug("[Vibration] Haptic feedback failed:", err);
  }
}

/**
 * Update PWA app badge on home screen and dock icon
 */
export function updateAppBadge(count: number): void {
  if (typeof navigator === "undefined") return;

  try {
    const nav = navigator as unknown as {
      setAppBadge?: (cnt: number) => Promise<void>;
      clearAppBadge?: () => Promise<void>;
    };

    if (count > 0 && typeof nav.setAppBadge === "function") {
      nav.setAppBadge(count).catch(() => {});
    } else if (count === 0 && typeof nav.clearAppBadge === "function") {
      nav.clearAppBadge().catch(() => {});
    }
  } catch {
    // Ignore badge errors
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
  if (typeof window === "undefined") return false;

  if (!("Notification" in window) || Notification.permission !== "granted") {
    return false;
  }

  const notificationOptions: NotificationOptions & { vibrate?: number[] } = {
    body: options?.body || "",
    icon: options?.icon || "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    tag: options?.tag || `tammlo-${Date.now()}`,
    data: { url: options?.url || "/notifications" },
    dir: "auto",
    vibrate: [200, 100, 200],
  };

  // 1. Try Service Worker first (Mandatory for iOS PWA and Android Standalone)
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration && "showNotification" in registration) {
        await registration.showNotification(title, notificationOptions);
        return true;
      }
    } catch (swErr) {
      console.debug("[showDeviceNotification] ServiceWorker notification failed:", swErr);
    }
  }

  // 2. Fallback to standard window Notification constructor
  try {
    const notif = new Notification(title, notificationOptions);
    notif.onclick = () => {
      window.focus();
      if (options?.url) {
        window.location.href = options.url;
      }
      notif.close();
    };
    return true;
  } catch (windowErr) {
    console.debug("[showDeviceNotification] Window Notification constructor failed:", windowErr);
    return false;
  }
}
