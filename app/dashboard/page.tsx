"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import CravingForm from "@/components/CravingForm";
import CravingList from "@/components/CravingList";
import StatsCard from "@/components/StatsCard";

interface Craving {
  id: string;
  intensity: number;
  trigger: string | null;
  notes: string | null;
  resisted: boolean;
  location: string | null;
  createdAt: string;
}

interface Stats {
  totalCravings: number;
  resistedCount: number;
  resistanceRate: string;
  averageIntensity: number;
  mostCommonTrigger: string | null;
  todayCount: number;
  currentStreak: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cravings, setCravings] = useState<Craving[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const fetchData = useCallback(async () => {
    try {
      const [cravingsRes, statsRes] = await Promise.all([
        fetch("/api/cravings?limit=50"),
        fetch("/api/stats"),
      ]);
      const [cravingsData, statsData] = await Promise.all([
        cravingsRes.json(),
        statsRes.json(),
      ]);
      setCravings(cravingsData);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchData();
  }, [status, fetchData]);

  function handleDelete(id: string) {
    setCravings((prev) => prev.filter((c) => c.id !== id));
    // Refresh stats after delete
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats);
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg animate-pulse">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-sm text-gray-400 font-medium">Loading your dashboard…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        userName={session?.user?.name}
        userImage={session?.user?.image}
      />

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-indigo-600 rounded-full" />
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Your progress
            </h2>
          </div>
          <StatsCard stats={stats} />
        </section>

        {/* Log form */}
        <section>
          <CravingForm onSuccess={fetchData} />
        </section>

        {/* History */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-violet-500 rounded-full" />
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Recent cravings
              </h2>
            </div>
            <span className="text-xs font-medium text-gray-400 bg-white px-2.5 py-1 rounded-full" style={{ boxShadow: "var(--md-shadow-1)" }}>
              {cravings.length} logged
            </span>
          </div>
          <CravingList cravings={cravings} onDelete={handleDelete} />
        </section>
      </main>
    </div>
  );
}
