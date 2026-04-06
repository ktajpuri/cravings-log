"use client";

import { useState } from "react";

const TRIGGERS = ["stress", "after coffee", "boredom", "after eating", "social", "alcohol", "anxiety", "habit", "other"];
const LOCATIONS = ["home", "office", "outside", "car", "bar/restaurant", "other"];

interface CravingFormProps {
  onSuccess: () => void;
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

      // Reset form
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

  const intensityColor =
    intensity <= 3 ? "text-green-600" : intensity <= 6 ? "text-yellow-600" : "text-red-600";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5 shadow-sm">
      <h2 className="font-semibold text-gray-900 text-lg">Log a craving</h2>

      {/* Intensity slider */}
      <div>
        <div className="flex justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Intensity</label>
          <span className={`text-sm font-bold ${intensityColor}`}>{intensity} / 10</span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          value={intensity}
          onChange={(e) => setIntensity(Number(e.target.value))}
          className="w-full accent-purple-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Mild</span>
          <span>Moderate</span>
          <span>Intense</span>
        </div>
      </div>

      {/* Trigger */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">Trigger</label>
        <div className="flex flex-wrap gap-2">
          {TRIGGERS.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setTrigger(trigger === t ? "" : t)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                trigger === t
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">Location</label>
        <div className="flex flex-wrap gap-2">
          {LOCATIONS.map((l) => (
            <button
              type="button"
              key={l}
              onClick={() => setLocation(location === l ? "" : l)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                location === l
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How are you feeling? What's going on?"
          className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-300"
          rows={2}
        />
      </div>

      {/* Resisted toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setResisted(!resisted)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            resisted ? "bg-green-500" : "bg-gray-200"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              resisted ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className="text-sm text-gray-700">
          {resisted ? "✅ I resisted this craving!" : "I gave in to this craving"}
        </span>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
      >
        {loading ? "Saving..." : "Log Craving"}
      </button>
    </form>
  );
}
