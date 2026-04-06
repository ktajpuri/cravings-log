"use client";

import { useState, useEffect } from "react";

interface TriviaQuestion {
  id: string;
  question: string;
  answers: string[];
  correct: number;
  category: string;
  type: string;
  difficulty: number;
}

interface TriviaGameProps {
  onComplete: () => void;
}

const TOTAL_QUESTIONS = 5;

const CATEGORY_LABELS: Record<string, string> = {
  geography: "🌍 Geography",
  science: "🔬 Science",
  math: "🔢 Math",
  history: "📜 History",
  riddle: "🤔 Riddle",
  wordplay: "🔤 Wordplay",
  culture: "🎭 Culture",
  language: "📚 Language",
  puzzle: "🧩 Puzzle",
};

export default function TriviaGame({ onComplete }: TriviaGameProps) {
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setDone(false);

    fetch(`/api/trivia?count=${TOTAL_QUESTIONS}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => { setQuestions(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [retryKey]);

  function handleAnswer(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === questions[current].correct) setScore((s) => s + 1);
  }

  function handleNext() {
    if (current + 1 >= questions.length) {
      setDone(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="grid grid-cols-2 gap-2">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-10 bg-gray-100 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="text-center space-y-3 py-2">
        <p className="text-sm text-gray-500">Couldn't load questions.</p>
        <button
          onClick={() => setRetryKey((k) => k + 1)}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: "#7c3aed" }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (done) {
    const perfect = score === questions.length;
    return (
      <div className="text-center space-y-4 py-2">
        <div className="text-4xl">{perfect ? "🎉" : score >= 3 ? "👏" : "🧠"}</div>
        <div>
          <p className="font-bold text-gray-900 text-lg">{score}/{questions.length} correct</p>
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

  const q = questions[current];
  const isCorrect = selected === q.correct;

  return (
    <div className="space-y-4">
      {/* Progress + category */}
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
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#f5f3ff", color: "#7c3aed" }}>
            {CATEGORY_LABELS[q.category] ?? q.category}
          </span>
          <span className="text-xs text-gray-400">{current + 1}/{questions.length}</span>
        </div>
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
            {current + 1 >= questions.length ? "See results" : "Next question →"}
          </button>
        </div>
      )}
    </div>
  );
}
