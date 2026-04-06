"use client";

import { useState } from "react";

interface Craving {
  id: string;
  intensity: number;
  trigger: string | null;
  notes: string | null;
  resisted: boolean;
  location: string | null;
  createdAt: string;
}

interface CravingListProps {
  cravings: Craving[];
  onDelete: (id: string) => void;
}

function intensityBadge(n: number) {
  if (n <= 3) return "bg-green-100 text-green-700";
  if (n <= 6) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CravingList({ cravings, onDelete }: CravingListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await fetch(`/api/cravings/${id}`, { method: "DELETE" });
      onDelete(id);
    } finally {
      setDeletingId(null);
    }
  }

  if (cravings.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="text-4xl mb-3">📋</div>
        <p>No cravings logged yet. Start tracking above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {cravings.map((c) => (
        <div
          key={c.id}
          className="bg-white rounded-xl border border-gray-100 p-4 flex items-start justify-between gap-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${intensityBadge(c.intensity)}`}
              >
                {c.intensity}/10
              </span>
              {c.resisted ? (
                <span className="px-2 py-0.5 rounded-full text-xs bg-green-50 text-green-700 font-medium">
                  ✅ Resisted
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-xs bg-red-50 text-red-500 font-medium">
                  Gave in
                </span>
              )}
              {c.trigger && (
                <span className="text-xs text-gray-500 capitalize">📌 {c.trigger}</span>
              )}
              {c.location && (
                <span className="text-xs text-gray-400">📍 {c.location}</span>
              )}
            </div>
            {c.notes && (
              <p className="text-sm text-gray-600 mt-2 truncate">{c.notes}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">{formatDate(c.createdAt)}</p>
          </div>
          <button
            onClick={() => handleDelete(c.id)}
            disabled={deletingId === c.id}
            className="text-gray-300 hover:text-red-400 transition-colors text-sm flex-shrink-0 mt-1"
            title="Delete"
          >
            {deletingId === c.id ? "..." : "✕"}
          </button>
        </div>
      ))}
    </div>
  );
}
