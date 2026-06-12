"use client";

import { useEffect, useRef, useMemo } from "react";

type OutcomeType = "victory" | "gave-in";

interface Props {
  type: OutcomeType;
  onDone: () => void;
}

const CONFETTI_COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#f97316", "#ec4899",
  "#84cc16", "#a78bfa",
];

function playSound(type: OutcomeType) {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();

    if (type === "victory") {
      // Ascending arpeggio: C5 → E5 → G5 → C6, then a final sparkle
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = freq;
        const t = ctx.currentTime + i * 0.13;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(i === 4 ? 0.18 : 0.26, t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + (i === 4 ? 0.9 : 0.5));
        osc.start(t);
        osc.stop(t + (i === 4 ? 0.9 : 0.5));
      });
    } else {
      // Soft descending lullaby: C5 → A4 → G4, sustained and gentle
      [523.25, 440.0, 392.0].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = freq;
        const t = ctx.currentTime + i * 0.32;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.11, t + 0.14);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.1);
        osc.start(t);
        osc.stop(t + 1.1);
      });
    }
  } catch {
    // Web Audio API unavailable — no sound, animation still plays
  }
}

export default function CravingOutcomeAnimation({ type, onDone }: Props) {
  const doneCalledRef = useRef(false);
  const DURATION = type === "victory" ? 3000 : 2600;

  const confetti = useMemo(() => {
    if (type !== "victory") return [];
    return Array.from({ length: 70 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: 7 + Math.random() * 10,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      delay: Math.random() * 1.0,
      duration: 1.5 + Math.random() * 1.3,
      finalRot: `${Math.random() > 0.5 ? "" : "-"}${180 + Math.floor(Math.random() * 450)}deg`,
      drift: `${(Math.random() - 0.5) * 160}px`,
      isCircle: Math.random() > 0.45,
      height: 0.45 + Math.random() * 0.65,
    }));
  }, [type]);

  useEffect(() => {
    playSound(type);
    const t = setTimeout(() => {
      if (!doneCalledRef.current) {
        doneCalledRef.current = true;
        onDone();
      }
    }, DURATION);
    return () => clearTimeout(t);
  }, [type, onDone, DURATION]);

  function handleClick() {
    if (!doneCalledRef.current) {
      doneCalledRef.current = true;
      onDone();
    }
  }

  return (
    <>
      <style>{`
        @keyframes cao-fall {
          from { transform: translateY(-24px) rotate(0deg) translateX(0px); opacity: 1; }
          to   { transform: translateY(110vh) rotate(var(--rot)) translateX(var(--drift)); opacity: 0.15; }
        }
        @keyframes cao-overlay {
          0%   { opacity: 0; }
          7%   { opacity: 1; }
          70%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes cao-card-in {
          0%   { transform: scale(0.35) translateY(28px); opacity: 0; }
          62%  { transform: scale(1.07) translateY(-5px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes cao-ripple {
          0%   { transform: scale(0); opacity: 0.65; }
          100% { transform: scale(5.5); opacity: 0; }
        }
        @keyframes cao-trophy-bounce {
          0%   { transform: scale(1) rotate(0deg); }
          20%  { transform: scale(1.25) rotate(-10deg); }
          45%  { transform: scale(1.18) rotate(8deg); }
          70%  { transform: scale(1.08) rotate(-4deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes cao-heart-pulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.14); }
        }
      `}</style>

      {/* Full-screen overlay */}
      <div
        className="fixed inset-0 flex items-center justify-center cursor-pointer"
        style={{
          zIndex: 9999,
          background:
            type === "victory"
              ? "rgba(0, 0, 0, 0.80)"
              : "rgba(12, 4, 32, 0.87)",
          animation: `cao-overlay ${DURATION}ms ease-in-out forwards`,
        }}
        onClick={handleClick}
        aria-label={type === "victory" ? "Craving defeated!" : "Be kind to yourself"}
        role="status"
      >
        {/* Confetti rain (victory) */}
        {confetti.map((p) => (
          <div
            key={p.id}
            className="absolute top-0 pointer-events-none"
            style={{
              left: `${p.x}%`,
              width: p.size,
              height: p.isCircle ? p.size : p.size * p.height,
              background: p.color,
              borderRadius: p.isCircle ? "50%" : "2px",
              "--rot": p.finalRot,
              "--drift": p.drift,
              animation: `cao-fall ${p.duration}s cubic-bezier(0.3, 0.5, 0.45, 0.95) forwards`,
              animationDelay: `${p.delay}s`,
            } as React.CSSProperties}
          />
        ))}

        {/* Ripple rings (gave-in) */}
        {type === "gave-in" &&
          [0, 0.38, 0.76].map((delay, i) => (
            <div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 200,
                height: 200,
                border: `${1.8 - i * 0.3}px solid rgba(167, 139, 250, 0.55)`,
                animation: `cao-ripple 2.1s ease-out forwards`,
                animationDelay: `${delay}s`,
              }}
            />
          ))}

        {/* Card */}
        <div
          className="relative flex flex-col items-center gap-4 px-10 py-8 rounded-3xl pointer-events-none"
          style={{
            background:
              type === "victory"
                ? "rgba(255, 255, 255, 0.10)"
                : "rgba(109, 40, 217, 0.22)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border:
              type === "victory"
                ? "1px solid rgba(255, 255, 255, 0.20)"
                : "1px solid rgba(167, 139, 250, 0.38)",
            boxShadow:
              type === "victory"
                ? "0 0 90px rgba(16, 185, 129, 0.40), 0 24px 64px rgba(0,0,0,0.35)"
                : "0 0 90px rgba(139, 92, 246, 0.45), 0 24px 64px rgba(0,0,0,0.35)",
            animation: "cao-card-in 0.58s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
          }}
        >
          {/* Icon */}
          <span
            style={{
              fontSize: 68,
              lineHeight: 1,
              display: "block",
              animation:
                type === "victory"
                  ? "cao-trophy-bounce 0.8s ease-in-out 0.45s 1"
                  : "cao-heart-pulse 1.3s ease-in-out infinite",
              filter:
                type === "victory"
                  ? "drop-shadow(0 0 28px rgba(16,185,129,0.95))"
                  : "drop-shadow(0 0 28px rgba(167,139,250,0.90))",
            }}
          >
            {type === "victory" ? "🏆" : "💜"}
          </span>

          {/* Message */}
          <div className="text-center space-y-1.5">
            <p className="text-white font-bold text-2xl tracking-tight">
              {type === "victory" ? "Craving Defeated!" : "Be Kind to Yourself"}
            </p>
            <p
              className="text-sm font-medium leading-relaxed"
              style={{ color: "rgba(255,255,255,0.68)" }}
            >
              {type === "victory"
                ? "You are stronger than your urges 💪"
                : "Every moment is a fresh start ❤️"}
            </p>
          </div>

          {/* Tap to dismiss hint */}
          <p
            className="text-xs"
            style={{ color: "rgba(255,255,255,0.35)", marginTop: 4 }}
          >
            tap to dismiss
          </p>
        </div>
      </div>
    </>
  );
}
