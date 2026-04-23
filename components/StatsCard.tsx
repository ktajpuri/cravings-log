interface Stats {
  totalCravings: number;
  resistedCount: number;
  resistanceRate: string;
  averageIntensity: number;
  mostCommonTrigger: string | null;
  mostCommonLocation: string | null;
  todayCount: number;
  currentStreak: number;
}

interface StatsCardProps {
  stats: Stats | null;
}

const ICONS = {
  streak: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
    </svg>
  ),
  shield: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  calendar: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  chart: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
};

export default function StatsCard({ stats }: StatsCardProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 animate-pulse" style={{ boxShadow: "var(--md-shadow-1)" }}>
            <div className="w-9 h-9 bg-gray-100 rounded-xl mb-3" />
            <div className="h-7 bg-gray-100 rounded-lg mb-1.5 w-16" />
            <div className="h-3.5 bg-gray-50 rounded w-20" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      value: stats.currentStreak,
      label: "Day streak",
      icon: ICONS.streak,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      valueColor: "text-indigo-700",
    },
    {
      value: stats.resistanceRate,
      label: "Resistance rate",
      icon: ICONS.shield,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      valueColor: "text-emerald-700",
    },
    {
      value: stats.todayCount,
      label: "Cravings today",
      icon: ICONS.calendar,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      valueColor: "text-amber-700",
    },
    {
      value: stats.averageIntensity,
      label: "Avg intensity",
      icon: ICONS.chart,
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600",
      valueColor: "text-rose-700",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl p-4 transition-shadow hover:shadow-md"
            style={{ boxShadow: "var(--md-shadow-1)" }}
          >
            <div className={`w-9 h-9 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center mb-3`}>
              {card.icon}
            </div>
            <div className={`text-2xl font-bold tracking-tight ${card.valueColor}`}>{card.value}</div>
            <div className="text-xs text-gray-500 mt-0.5 font-medium">{card.label}</div>
          </div>
        ))}
      </div>

      {(stats.mostCommonTrigger || stats.mostCommonLocation) && (
        <div className="grid grid-cols-2 gap-3">
          {stats.mostCommonTrigger && (
            <div
              className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3"
              style={{ boxShadow: "var(--md-shadow-1)" }}
            >
              <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Top trigger</p>
                <p className="text-sm font-semibold text-gray-800 capitalize truncate">{stats.mostCommonTrigger}</p>
              </div>
            </div>
          )}
          {stats.mostCommonLocation && (
            <div
              className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3"
              style={{ boxShadow: "var(--md-shadow-1)" }}
            >
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Top location</p>
                <p className="text-sm font-semibold text-gray-800 capitalize truncate">{stats.mostCommonLocation}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
