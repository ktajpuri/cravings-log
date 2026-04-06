"use client";

import { useState, useRef, useCallback } from "react";

const TRIGGERS = ["stress", "after coffee", "boredom", "after eating", "social", "alcohol", "anxiety", "habit", "other"];
const LOCATIONS = ["home", "office", "outside", "car", "bar/restaurant", "other"];

interface CravingFormProps {
  onSuccess: () => void;
}

function getIntensityColor(n: number): string {
  if (n <= 2) return "#22c55e";
  if (n <= 4) return "#84cc16";
  if (n <= 6) return "#eab308";
  if (n <= 8) return "#f97316";
  return "#ef4444";
}

function getIntensityLabel(n: number): string {
  if (n <= 2) return "Very mild";
  if (n <= 4) return "Mild";
  if (n <= 6) return "Moderate";
  if (n <= 8) return "Strong";
  return "Intense";
}

interface IntensitySliderProps {
  value: number;
  onChange: (v: number) => void;
}

function IntensitySlider({ value, onChange }: IntensitySliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pct = ((value - 1) / 9) * 100;
  const color = getIntensityColor(value);
  const label = getIntensityLabel(value);

  const handleTrackClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    const newVal = Math.round(ratio * 9) + 1;
    onChange(newVal);
  }, [onChange]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-700">Intensity</label>
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full transition-all duration-300"
            style={{ background: color + "20", color }}
          >
            {label}
          </span>
          <span
            className="text-lg font-bold tabular-nums transition-colors duration-300 min-w-[2.5rem] text-right"
            style={{ color }}
          >
            {value}<span className="text-sm font-normal text-gray-400">/10</span>
          </span>
        </div>
      </div>

      {/* Custom slider track */}
      <div className="relative pt-10 pb-2">
        {/* Value bubble */}
        <div
          className="absolute -top-0 transition-all duration-150 pointer-events-none"
          style={{ left: `calc(${pct}% - 14px)` }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg transition-all duration-300"
            style={{ background: color, boxShadow: `0 2px 8px ${color}60` }}
          >
            {value}
          </div>
          <div
            className="w-0 h-0 mx-auto"
            style={{
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderTop: `5px solid ${color}`,
            }}
          />
        </div>

        {/* Track area */}
        <div ref={trackRef} className="relative h-6 flex items-center cursor-pointer" onClick={handleTrackClick}>
          {/* Gradient track */}
          <div
            className="absolute w-full h-2 rounded-full"
            style={{
              background: "linear-gradient(to right, #22c55e 0%, #84cc16 25%, #eab308 50%, #f97316 75%, #ef4444 100%)",
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.15)",
            }}
          />
          {/* Range input (invisible, for accessibility & keyboard control) */}
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="intensity-slider absolute inset-0 w-full opacity-0 h-full cursor-pointer z-10"
            style={{ color }}
            aria-label="Intensity"
          />
          {/* Custom visible thumb */}
          <div
            className="absolute pointer-events-none transition-all duration-150"
            style={{ left: `calc(${pct}% - 14px)` }}
          >
            <div
              className="w-7 h-7 rounded-full bg-white shadow-md transition-all duration-150"
              style={{
                border: `3px solid ${color}`,
                boxShadow: `0 2px 8px rgba(0,0,0,0.18), 0 0 0 3px ${color}25`,
              }}
            />
          </div>
        </div>

        {/* Tick marks */}
        <div className="flex justify-between px-3.5 mt-1">
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className="w-0.5 h-1.5 rounded-full transition-colors duration-300"
              style={{ background: i + 1 <= value ? color : "#d1d5db" }}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-between text-xs font-medium text-gray-400 px-0.5">
        <span>Mild</span>
        <span>Moderate</span>
        <span>Intense</span>
      </div>
    </div>
  );
}

interface ChipGroupProps {
  label: string;
  options: string[];
  selected: string;
  onSelect: (val: string) => void;
  accentColor?: string;
}

function ChipGroup({ label, options, selected, onSelect, accentColor = "indigo" }: ChipGroupProps) {
  const active = `bg-${accentColor}-600 text-white border-${accentColor}-600 shadow-sm`;
  const inactive = `bg-white text-gray-600 border-gray-200 hover:border-${accentColor}-300 hover:text-${accentColor}-600`;

  return (
    <div>
      <label className="text-sm font-semibold text-gray-700 block mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            type="button"
            key={opt}
            onClick={() => onSelect(selected === opt ? "" : opt)}
            className={`md-chip px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 capitalize ${
              selected === opt ? active : inactive
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CravingForm({ onSuccess }: CravingFormProps) {
  const [intensity, setIntensity] = useState(5);
  const [trigger, setTrigger] = useState("");
  const [notes, setNotes] = useState("");
  const [resisted, setResisted] = useState(false);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/cravings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intensity, trigger, notes, resisted, location }),
      });

      if (!res.ok) throw new Error("Failed to save craving");

      setIntensity(5);
      setTrigger("");
      setNotes("");
      setResisted(false);
      setLocation("");
      onSuccess();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl p-6 space-y-6"
      style={{ boxShadow: "var(--md-shadow-2)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div>
          <h2 className="font-bold text-gray-900 text-base">Log a craving</h2>
          <p className="text-xs text-gray-400">Track this moment to build your streak</p>
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Intensity slider */}
      <IntensitySlider value={intensity} onChange={setIntensity} />

      {/* Trigger chips */}
      <ChipGroup
        label="Trigger"
        options={TRIGGERS}
        selected={trigger}
        onSelect={setTrigger}
        accentColor="indigo"
      />

      {/* Location chips */}
      <ChipGroup
        label="Location"
        options={LOCATIONS}
        selected={location}
        onSelect={setLocation}
        accentColor="violet"
      />

      {/* Notes */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-2">Notes <span className="text-gray-400 font-normal">(optional)</span></label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How are you feeling? What's going on?"
          className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all text-gray-700 placeholder-gray-300 bg-gray-50 focus:bg-white"
          rows={2}
        />
      </div>

      {/* Resisted toggle */}
      <div
        className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
          resisted ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-200"
        }`}
        onClick={() => setResisted(!resisted)}
      >
        <div>
          <p className={`text-sm font-semibold transition-colors ${resisted ? "text-emerald-700" : "text-gray-700"}`}>
            {resisted ? "I resisted this craving" : "I gave in to this craving"}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {resisted ? "Great job — every win counts!" : "Tap to mark as resisted"}
          </p>
        </div>
        <div
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 flex-shrink-0 ${
            resisted ? "bg-emerald-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
              resisted ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-3 rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Saving...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Log Craving
          </>
        )}
      </button>
    </form>
  );
}
