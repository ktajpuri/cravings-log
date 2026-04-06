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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        userName={session?.user?.name}
        userImage={session?.user?.image}
      />

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Stats */}
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Your progress
          </h2>
          <StatsCard stats={stats} />
        </section>

        {/* Log form */}
        <section>
          <CravingForm onSuccess={fetchData} />
        </section>

        {/* History */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Recent cravings
            </h2>
            <span className="text-xs text-gray-400">
              {cravings.length} logged
            </span>
          </div>
          <CravingList cravings={cravings} onDelete={handleDelete} />
        </section>
      </main>
    </div>
  );
}
