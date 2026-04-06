"use client";

import { useState, useMemo } from "react";
import { TRIVIA_QUESTIONS } from "@/lib/triviaQuestions";

interface TriviaGameProps {
  onComplete: () => void;
}

const TOTAL_QUESTIONS = 5;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function TriviaGame({ onComplete }: TriviaGameProps) {
  const questions = useMemo(() => shuffle(TRIVIA_QUESTIONS).slice(0, TOTAL_QUESTIONS), []);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[current];
  const isCorrect = selected === q.correct;

  function handleAnswer(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.correct) setScore((s) => s + 1);
  }

  function handleNext() {
    if (current + 1 >= TOTAL_QUESTIONS) {
      setDone(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  }

  if (done) {
    const perfect = score === TOTAL_QUESTIONS;
    return (
      <div className="text-center space-y-4 py-2">
        <div className="text-4xl">{perfect ? "🎉" : score >= 3 ? "👏" : "🧠"}</div>
        <div>
          <p className="font-bold text-gray-900 text-lg">{score}/{TOTAL_QUESTIONS} correct</p>
          <p className="text-sm text-gray-500 mt-1">
            {perfect ? "Perfect score! Your mind is sharp." : score >= 3 ? "Great job — craving distracted!" : "Good try — distraction complete!"}
          </p>
        </div>
        <button
          onClick={onComplete}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: "#7c3aed" }}
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div
              key={i}
              className="h-1.5 w-6 rounded-full transition-all duration-300"
              style={{ background: i < current ? "#7c3aed" : i === current ? "#a78bfa" : "#e5e7eb" }}
            />
          ))}
        </div>
        <span className="text-xs text-gray-400 font-medium">{current + 1} / {TOTAL_QUESTIONS}</span>
      </div>

      {/* Question */}
      <p className="font-semibold text-gray-800 text-sm leading-relaxed">{q.question}</p>

      {/* Answers */}
      <div className="grid grid-cols-2 gap-2">
        {q.answers.map((ans, idx) => {
          let bg = "#fff";
          let border = "#e5e7eb";
          let color = "#374151";

          if (selected !== null) {
            if (idx === q.correct) { bg = "#f0fdf4"; border = "#22c55e"; color = "#15803d"; }
            else if (idx === selected && !isCorrect) { bg = "#fef2f2"; border = "#ef4444"; color = "#b91c1c"; }
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleAnswer(idx)}
              disabled={selected !== null}
              className="px-3 py-2.5 rounded-xl text-xs font-medium border text-left transition-all duration-200"
              style={{ background: bg, borderColor: border, color }}
            >
              {ans}
            </button>
          );
        })}
      </div>

      {/* Feedback + Next */}
      {selected !== null && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-center" style={{ color: isCorrect ? "#15803d" : "#b91c1c" }}>
            {isCorrect ? "Correct! 🎯" : `The answer was: ${q.answers[q.correct]}`}
          </p>
          <button
            onClick={handleNext}
            className="w-full py-2 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: "#7c3aed" }}
          >
            {current + 1 >= TOTAL_QUESTIONS ? "See results" : "Next question →"}
          </button>
        </div>
      )}
    </div>
  );
}
