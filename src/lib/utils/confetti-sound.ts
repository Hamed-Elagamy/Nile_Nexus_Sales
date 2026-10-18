/**
 * Zero-dependency Canvas Confetti & Web Audio Sound FX Utility
 * Nile Nexus Sales - Luxury Visual & Auditory Feedback
 */

/**
 * Trigger celebratory confetti explosion using pure HTML5 Canvas
 */
export function triggerCelebrationConfetti(durationMs = 2500) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "999999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    document.body.removeChild(canvas);
    return;
  }

  const width = (canvas.width = window.innerWidth);
  const height = (canvas.height = window.innerHeight);

  const colors = [
    "#2563eb", // Nile Blue
    "#10b981", // Emerald
    "#8b5cf6", // Royal Purple
    "#f59e0b", // Amber Gold
    "#ec4899", // Neon Pink
    "#06b6d4", // Cyan
  ];

  const pieceCount = Math.min(120, Math.floor(width / 10));
  const pieces: Array<{
    x: number;
    y: number;
    w: number;
    h: number;
    color: string;
    vx: number;
    vy: number;
    rotation: number;
    vRotation: number;
    opacity: number;
  }> = [];

  for (let i = 0; i < pieceCount; i++) {
    pieces.push({
      x: width / 2 + (Math.random() - 0.5) * (width * 0.4),
      y: height * 0.4 + (Math.random() - 0.5) * 100,
      w: Math.random() * 10 + 6,
      h: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 16,
      vy: Math.random() * -12 - 4,
      rotation: Math.random() * 360,
      vRotation: (Math.random() - 0.5) * 12,
      opacity: 1,
    });
  }

  const startTime = Date.now();

  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = elapsed / durationMs;

    if (progress >= 1 || !ctx) {
      if (canvas.parentNode) {
        document.body.removeChild(canvas);
      }
      return;
    }

    ctx.clearRect(0, 0, width, height);

    pieces.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.vx *= 0.98; // air resistance
      p.rotation += p.vRotation;
      p.opacity = Math.max(0, 1 - progress);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

/**
 * Web Audio synthesized tactile sound effects (No external audio files required)
 */
class SoundEngine {
  private audioCtx: AudioContext | null = null;
  private soundEnabled = true;

  constructor() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("nile_sound_enabled");
      this.soundEnabled = stored === null ? true : stored === "true";
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (typeof window !== "undefined") {
      localStorage.setItem("nile_sound_enabled", String(enabled));
    }
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  /**
   * Crisp celebratory chime for won deals & accepted proposals
   */
  public playWonChime() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (major chord arpeggio)

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0, now + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.1 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.65);
    });
  }

  /**
   * Soft tactile click for button presses & tab switches
   */
  public playTactileClick() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * Positive success blip for actions completed (e.g. follow-up logged)
   */
  public playSuccessBlip() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(440, now); // A4
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.1); // A5

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Aliases for quick invocation
  public click() {
    this.playTactileClick();
  }

  public copy() {
    this.playTactileClick();
  }

  public success() {
    this.playSuccessBlip();
  }

  public won() {
    this.playWonChime();
  }
}

export const sounds = new SoundEngine();
