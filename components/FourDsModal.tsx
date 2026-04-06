"use client";

import { useState, useEffect, useRef } from "react";
import TriviaGame from "@/components/fourds/TriviaGame";

interface FourDsModalProps {
  open: boolean;
  onClose: () => void;
  cravingId: string | null;
  onMarkResisted: () => void;
}

const STEPS = [
  {
    id: "drink",
    label: "Drink Water",
    letter: "D1",
    color: "#0ea5e9",
    bg: "#f0f9ff",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M12 2C6 8 4 12.5 4 15a8 8 0 0016 0c0-2.5-2-7-8-13z" />
      </svg>
    ),
    title: "Drink a full glass of water",
    body: "Sipping water keeps your hands busy, satisfies oral cravings, and helps your body flush out toxins. Take your time — drink the whole glass slowly.",
    cta: "I drank water ✓",
  },
  {
    id: "delay",
    label: "Delay",
    letter: "D2",
    color: "#f59e0b",
    bg: "#fffbeb",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Delay for 5 minutes",
    body: "Cravings peak and pass like waves — most fade within 5 minutes. Follow the breathing guide below to stay calm.",
    cta: "I waited it out ✓",
  },
  {
    id: "distract",
    label: "Distract",
    letter: "D3",
    color: "#7c3aed",
    bg: "#f5f3ff",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: "Distract your mind",
    body: "Redirect your focus with a quick trivia challenge. Engaging your brain breaks the craving thought loop.",
    cta: null, // controlled by trivia completion
  },
  {
    id: "discuss",
    label: "Discuss",
    letter: "D4",
    color: "#10b981",
    bg: "#f0fdf4",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-1" />
        <path d="M15 3H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l4-4h4a2 2 0 002-2V5a2 2 0 00-2-2z" />
      </svg>
    ),
    title: "Talk it out",
    body: "Reach out to a friend, family member, or support group. Saying \"I'm having a craving\" out loud to someone you trust takes away its power. Even a quick text counts.",
    cta: "I reached out ✓",
  },
];

// Breathing cycle: inhale 4s, hold 4s, exhale 4s, hold 4s = 16s total
const BREATH_CYCLE = 16;
const BREATH_PHASES = [
  { label: "Inhale", duration: 4, scale: 1.35 },
  { label: "Hold",   duration: 4, scale: 1.35 },
  { label: "Exhale", duration: 4, scale: 1.0  },
  { label: "Hold",   duration: 4, scale: 1.0  },
];

const AFFIRMATIONS = [
  "This craving is temporary. It will pass.",
  "You are stronger than this urge.",
  "Every breath brings you closer to calm.",
  "You've resisted before. You can do it again.",
  "The discomfort is temporary. Your health is permanent.",
  "Breathe through it — you're doing great.",
  "Each second is a small victory.",
  "Your future self is proud of you right now.",
  "The wave is peaking. It will fade.",
  "You are in control.",
  "One breath at a time.",
  "You chose your health. Keep going.",
];

function getBreathPhase(elapsed: number) {
  const pos = elapsed % BREATH_CYCLE;
  let acc = 0;
  for (let i = 0; i < BREATH_PHASES.length; i++) {
    acc += BREATH_PHASES[i].duration;
    if (pos < acc) return { ...BREATH_PHASES[i], index: i };
  }
  return { ...BREATH_PHASES[0], index: 0 };
}

function DelayTimer({ onDone }: { onDone: () => void }) {
  const [seconds, setSeconds] = useState(5 * 60);
  const [finished, setFinished] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const affirmationIndex = Math.floor(elapsed / 20) % AFFIRMATIONS.length;

  useEffect(() => {
    if (seconds <= 0) { setFinished(true); onDone(); return; }
    const t = setTimeout(() => { setSeconds((s) => s - 1); setElapsed((e) => e + 1); }, 1000);
    return () => clearTimeout(t);
  }, [seconds, onDone]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const pct = ((5 * 60 - seconds) / (5 * 60)) * 100;
  const phase = getBreathPhase(elapsed);

  return (
    <div className="space-y-4">
      {/* Breathing circle */}
      <div className="flex flex-col items-center gap-3 py-2">
        <div className="relative flex items-center justify-center">
          {/* Outer pulse ring */}
          <div
            className="absolute rounded-full opacity-20 transition-all"
            style={{
              width: 110,
              height: 110,
              background: finished ? "#10b981" : "#f59e0b",
              transform: `scale(${finished ? 1 : phase.scale})`,
              transitionDuration: `${phase.duration * 1000}ms`,
              transitionTimingFunction: phase.label === "Inhale" ? "ease-in" : phase.label === "Exhale" ? "ease-out" : "linear",
            }}
          />
          {/* Inner circle */}
          <div
            className="relative rounded-full flex items-center justify-center transition-all"
            style={{
              width: 80,
              height: 80,
              background: finished ? "#10b981" : "#f59e0b",
              transform: `scale(${finished ? 1 : phase.scale})`,
              transitionDuration: `${phase.duration * 1000}ms`,
              transitionTimingFunction: phase.label === "Inhale" ? "ease-in" : phase.label === "Exhale" ? "ease-out" : "linear",
            }}
          >
            <span className="text-white text-xl font-bold tabular-nums">
              {finished ? "✓" : `${mins}:${secs.toString().padStart(2, "0")}`}
            </span>
          </div>
        </div>

        {/* Breath phase label */}
        {!finished && (
          <p className="text-sm font-semibold tracking-wide" style={{ color: "#f59e0b" }}>
            {phase.label}
          </p>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: finished ? "#10b981" : "#f59e0b" }}
        />
      </div>

      {/* Affirmation */}
      {!finished && (
        <p
          key={affirmationIndex}
          className="text-xs text-center text-gray-500 italic leading-relaxed animate-pulse"
        >
          "{AFFIRMATIONS[affirmationIndex]}"
        </p>
      )}
    </div>
  );
}

export default function FourDsModal({ open, onClose, cravingId, onMarkResisted }: FourDsModalProps) {
  const [step, setStep] = useState(0); // 0–3 = steps, 4 = done screen
  const [triviaComplete, setTriviaComplete] = useState(false);
  const [delayDone, setDelayDone] = useState(false);
  const [marking, setMarking] = useState(false);
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setStep(0);
      setTriviaComplete(false);
      setDelayDone(false);
    }
  }, [open]);

  // Focus trap
  useEffect(() => {
    if (open) setTimeout(() => firstFocusRef.current?.focus(), 300);
  }, [open]);

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  async function handleMarkResisted() {
    if (!cravingId) { onMarkResisted(); onClose(); return; }
    setMarking(true);
    try {
      await fetch(`/api/cravings/${cravingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resisted: true }),
      });
      onMarkResisted();
    } finally {
      setMarking(false);
      onClose();
    }
  }

  function advance() {
    if (step < 4) setStep((s) => s + 1);
  }

  const currentStep = STEPS[step];
  const isDistract = currentStep?.id === "distract";
  const isDelay = currentStep?.id === "delay";
  const canAdvanceDistract = isDistract && triviaComplete;
  const canAdvanceDelay = isDelay && delayDone;

  const showCta =
    step < 4 &&
    !isDistract &&
    !(isDelay && !delayDone);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-300"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="4Ds craving relief"
        className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-2xl bg-white transition-transform duration-300 ease-out"
        style={{
          transform: open ? "translateY(0)" : "translateY(100%)",
          boxShadow: "var(--md-shadow-4)",
        }}
      >
        <div className="px-5 pb-8 pt-4 max-w-lg mx-auto">
          {/* Handle bar */}
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

          {step < 4 ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Beat the craving</p>
                  <h2 className="text-base font-bold text-gray-900">The 4Ds</h2>
                </div>
                <button
                  ref={firstFocusRef}
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Step progress dots */}
              <div className="flex gap-2 mb-6">
                {STEPS.map((s, i) => (
                  <div key={s.id} className="flex-1 space-y-1">
                    <div
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{
                        background: i < step ? s.color : i === step ? s.color + "80" : "#e5e7eb",
                      }}
                    />
                    <p className="text-center text-xs font-medium" style={{ color: i === step ? s.color : "#9ca3af" }}>
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Step card */}
              <div
                className="rounded-2xl p-5 mb-5 space-y-4"
                style={{ background: currentStep.bg, border: `1px solid ${currentStep.color}20` }}
              >
                {/* Icon + title */}
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: currentStep.color + "20", color: currentStep.color }}
                  >
                    {currentStep.icon}
                  </div>
                  <div>
                    <span
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: currentStep.color }}
                    >
                      {currentStep.letter}
                    </span>
                    <h3 className="font-bold text-gray-900 text-sm">{currentStep.title}</h3>
                  </div>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed">{currentStep.body}</p>

                {/* Delay timer */}
                {isDelay && <DelayTimer onDone={() => setDelayDone(true)} />}

                {/* Trivia game */}
                {isDistract && !triviaComplete && (
                  <TriviaGame onComplete={() => setTriviaComplete(true)} />
                )}
                {isDistract && triviaComplete && (
                  <p className="text-sm font-medium text-center" style={{ color: "#7c3aed" }}>
                    Trivia complete! Mind successfully distracted 🧠
                  </p>
                )}
              </div>

              {/* CTA buttons */}
              <div className="space-y-2">
                {showCta && (
                  <button
                    onClick={advance}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all"
                    style={{ background: currentStep.color }}
                  >
                    {currentStep.cta}
                  </button>
                )}

                {isDelay && delayDone && (
                  <button
                    onClick={advance}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all"
                    style={{ background: currentStep.color }}
                  >
                    I waited it out ✓
                  </button>
                )}

                {isDelay && !delayDone && (
                  <button
                    onClick={advance}
                    className="w-full py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Skip this step
                  </button>
                )}

                {isDistract && canAdvanceDistract && (
                  <button
                    onClick={advance}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all"
                    style={{ background: currentStep.color }}
                  >
                    Next step →
                  </button>
                )}

                {isDistract && !triviaComplete && (
                  <button
                    onClick={advance}
                    className="w-full py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Skip this step
                  </button>
                )}

                {!isDelay && !isDistract && (
                  <button
                    onClick={advance}
                    className="w-full py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Skip this step
                  </button>
                )}
              </div>
            </>
          ) : (
            /* Completion screen */
            <div className="text-center space-y-5 py-4">
              <div className="text-5xl">🏆</div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">You made it through!</h2>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  You just beat a craving using the 4Ds. Every time you resist, you weaken the habit loop.
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleMarkResisted}
                  disabled={marking}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
                  style={{ background: "#10b981" }}
                >
                  {marking ? "Saving…" : "Mark craving as resisted ✓"}
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Close without marking
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
