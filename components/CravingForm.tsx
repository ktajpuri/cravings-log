"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import FourDsModal from "@/components/FourDsModal";
import { getIntensityColor, getIntensityLabel } from "@/lib/intensity";

interface CravingFormProps {
  onSuccess: () => void;
}

interface IntensitySliderProps {
  value: number;
  onChange: (v: number) => void;
}

function haptic(ms = 10) {
  navigator.vibrate?.(ms);
}

function IntensitySlider({ value, onChange }: IntensitySliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pct = ((value - 1) / 9) * 100;
  const color = getIntensityColor(value);
  const label = getIntensityLabel(value);

  const handleChange = useCallback((newVal: number) => {
    if (newVal !== value) haptic();
    onChange(newVal);
  }, [value, onChange]);

  const handleTrackClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    const newVal = Math.round(ratio * 9) + 1;
    handleChange(newVal);
  }, [handleChange]);

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
            onChange={(e) => handleChange(Number(e.target.value))}
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
  onAddCustom: (val: string) => void;
  accentColor?: string;
}

const ACCENT_COLORS: Record<string, string> = {
  indigo: "#4f46e5",
  violet: "#7c3aed",
};

function ChipGroup({ label, options, selected, onSelect, onAddCustom, accentColor = "indigo" }: ChipGroupProps) {
  const color = ACCENT_COLORS[accentColor] ?? ACCENT_COLORS.indigo;
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOtherClick = () => {
    if (selected === "other") {
      onSelect("");
      return;
    }
    setShowCustomInput(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const commitCustom = () => {
    const val = customValue.trim();
    if (val) {
      onAddCustom(val);
      onSelect(val);
    }
    setShowCustomInput(false);
    setCustomValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); commitCustom(); }
    if (e.key === "Escape") { setShowCustomInput(false); setCustomValue(""); }
  };

  const optionsWithoutOther = options.filter((o) => o !== "other");

  return (
    <div>
      <label className="text-sm font-semibold text-gray-700 block mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {optionsWithoutOther.map((opt) => {
          const isSelected = selected === opt;
          return (
            <button
              type="button"
              key={opt}
              onClick={() => onSelect(isSelected ? "" : opt)}
              className="md-chip px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 capitalize"
              style={
                isSelected
                  ? { background: color, color: "#fff", borderColor: color, boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }
                  : { background: "#fff", color: "#4b5563", borderColor: "#e5e7eb" }
              }
            >
              {opt}
            </button>
          );
        })}

        {/* Other chip */}
        {!showCustomInput && (
          <button
            type="button"
            onClick={handleOtherClick}
            className="md-chip px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150"
            style={
              selected === "other"
                ? { background: color, color: "#fff", borderColor: color, boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }
                : { background: "#fff", color: "#4b5563", borderColor: "#e5e7eb" }
            }
          >
            other
          </button>
        )}

        {/* Inline custom input */}
        {showCustomInput && (
          <div className="flex items-center gap-1">
            <input
              ref={inputRef}
              type="text"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              onBlur={commitCustom}
              onKeyDown={handleKeyDown}
              placeholder="Type & press Enter"
              className="px-3 py-1.5 rounded-full text-xs font-medium border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent w-36"
              style={{ focusRingColor: color } as React.CSSProperties}
            />
          </div>
        )}
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
  const [triggers, setTriggers] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [showFourDs, setShowFourDs] = useState(false);
  const [savedCravingId, setSavedCravingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/options?type=trigger").then((r) => r.json()).then((d) => setTriggers(d.options ?? []));
    fetch("/api/options?type=location").then((r) => r.json()).then((d) => setLocations(d.options ?? []));
  }, []);

  async function addCustomOption(type: "trigger" | "location", value: string) {
    await fetch("/api/options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, value }),
    });
    if (type === "trigger") {
      setTriggers((prev) => {
        const without = prev.filter((o) => o !== "other");
        return [...without, value, "other"];
      });
    } else {
      setLocations((prev) => {
        const without = prev.filter((o) => o !== "other");
        return [...without, value, "other"];
      });
    }
  }

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

      const saved = await res.json();
      setIntensity(5);
      setTrigger("");
      setNotes("");
      setResisted(false);
      setLocation("");
      setSavedCravingId(saved.id ?? null);
      setShowFourDs(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
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
        options={triggers}
        selected={trigger}
        onSelect={setTrigger}
        onAddCustom={(val) => { addCustomOption("trigger", val); }}
        accentColor="indigo"
      />

      {/* Location chips */}
      <ChipGroup
        label="Location"
        options={locations}
        selected={location}
        onSelect={setLocation}
        onAddCustom={(val) => { addCustomOption("location", val); }}
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

    <FourDsModal
      open={showFourDs}
      onClose={() => { setShowFourDs(false); onSuccess(); }}
      cravingId={savedCravingId}
      onMarkResisted={onSuccess}
    />
    </>
  );
}
