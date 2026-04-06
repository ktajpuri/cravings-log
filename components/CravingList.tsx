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
  loading?: boolean;
}

function intensityStyles(n: number): { bg: string; text: string; bar: string } {
  if (n <= 3) return { bg: "bg-emerald-100", text: "text-emerald-700", bar: "#22c55e" };
  if (n <= 6) return { bg: "bg-amber-100", text: "text-amber-700", bar: "#eab308" };
  return { bg: "bg-red-100", text: "text-red-700", bar: "#ef4444" };
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

export default function CravingList({ cravings, onDelete, loading }: CravingListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="space-y-2.5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse" style={{ boxShadow: "var(--md-shadow-1)" }}>
            <div className="h-0.5 bg-gray-100 w-1/2" />
            <div className="p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex gap-1.5">
                  <div className="h-5 w-16 bg-gray-100 rounded-full" />
                  <div className="h-5 w-20 bg-gray-100 rounded-full" />
                </div>
                <div className="h-3.5 w-24 bg-gray-50 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

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
      <div
        className="bg-white rounded-2xl p-10 text-center"
        style={{ boxShadow: "var(--md-shadow-1)" }}
      >
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-500">No cravings logged yet</p>
        <p className="text-xs text-gray-400 mt-1">Start tracking above to see your history here</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {cravings.map((c) => {
        const styles = intensityStyles(c.intensity);
        const pct = (c.intensity / 10) * 100;

        return (
          <div
            key={c.id}
            className="bg-white rounded-2xl overflow-hidden transition-shadow hover:shadow-md"
            style={{ boxShadow: "var(--md-shadow-1)" }}
          >
            {/* Intensity bar accent */}
            <div
              className="h-0.5 transition-all duration-300"
              style={{ width: `${pct}%`, background: styles.bar }}
            />

            <div className="p-4 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* Intensity badge */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-xl ${styles.bg} ${styles.text} flex flex-col items-center justify-center`}
                >
                  <span className="text-sm font-bold leading-none">{c.intensity}</span>
                  <span className="text-[9px] opacity-60 leading-none mt-0.5">/ 10</span>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Tags row */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                    {c.resisted ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Resisted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-500 border border-red-100">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Gave in
                      </span>
                    )}
                    {c.trigger && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-600 border border-violet-100 capitalize">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {c.trigger}
                      </span>
                    )}
                    {c.location && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-500 border border-gray-100 capitalize">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {c.location}
                      </span>
                    )}
                  </div>

                  {c.notes && (
                    <p className="text-sm text-gray-600 truncate mb-1">{c.notes}</p>
                  )}
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDate(c.createdAt)}
                  </p>
                </div>
              </div>

              {/* Delete button */}
              <button
                onClick={() => handleDelete(c.id)}
                disabled={deletingId === c.id}
                className="flex-shrink-0 w-8 h-8 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all flex items-center justify-center"
                title="Delete"
              >
                {deletingId === c.id ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
