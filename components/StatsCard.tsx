interface Stats {
  totalCravings: number;
  resistedCount: number;
  resistanceRate: string;
  averageIntensity: number;
  mostCommonTrigger: string | null;
  todayCount: number;
  currentStreak: number;
}

interface StatsCardProps {
  stats: Stats | null;
}

export default function StatsCard({ stats }: StatsCardProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 animate-pulse">
            <div className="h-8 bg-gray-100 rounded mb-2" />
            <div className="h-4 bg-gray-50 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      value: stats.currentStreak,
      label: "Day streak",
      suffix: stats.currentStreak === 1 ? "day" : "days",
      color: "text-purple-600",
      bg: "bg-purple-50",
      emoji: "⚡",
    },
    {
      value: stats.resistanceRate,
      label: "Resistance rate",
      color: "text-cyan-600",
      bg: "bg-cyan-50",
      emoji: "🛡️",
    },
    {
      value: stats.todayCount,
      label: "Cravings today",
      color: "text-orange-600",
      bg: "bg-orange-50",
      emoji: "📅",
    },
    {
      value: stats.averageIntensity,
      label: "Avg intensity",
      color: "text-blue-600",
      bg: "bg-blue-50",
      emoji: "📊",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.bg} rounded-xl p-4 border border-white`}
        >
          <div className="flex items-center gap-1 mb-1">
            <span className="text-lg">{card.emoji}</span>
          </div>
          <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
          <div className="text-xs text-gray-500 mt-1">{card.label}</div>
        </div>
      ))}
      {stats.mostCommonTrigger && (
        <div className="col-span-2 sm:col-span-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
          <span className="text-sm text-gray-500">Most common trigger: </span>
          <span className="font-semibold text-gray-900 capitalize">
            {stats.mostCommonTrigger}
          </span>
        </div>
      )}
    </div>
  );
}
