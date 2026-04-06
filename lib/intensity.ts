export function getIntensityColor(n: number): string {
  if (n <= 2) return "#22c55e";
  if (n <= 4) return "#84cc16";
  if (n <= 6) return "#eab308";
  if (n <= 8) return "#f97316";
  return "#ef4444";
}

export function getIntensityLabel(n: number): string {
  if (n <= 2) return "Very mild";
  if (n <= 4) return "Mild";
  if (n <= 6) return "Moderate";
  if (n <= 8) return "Strong";
  return "Intense";
}
