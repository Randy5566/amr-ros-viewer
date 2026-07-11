/** Canvas 視覺化共用色盤，對應 Tailwind 主題。 */
export const C = {
  bg: "#0b1220",
  panel: "#0f1a2e",
  grid: "#1e293b",
  gridFaint: "rgba(148,163,184,0.08)",
  text: "#e2e8f0",
  muted: "#94a3b8",
  primary: "#0ea5e9", // sky-500
  primarySoft: "rgba(14,165,233,0.15)",
  accent: "#22d3ee", // cyan-400
  robot: "#38bdf8",
  laser: "#f43f5e", // rose-500
  laserSoft: "rgba(244,63,94,0.12)",
  obstacle: "#64748b",
  free: "#0e7490",
  path: "#a3e635", // lime-400
  pathGlobal: "#facc15", // yellow-400
  particle: "#c084fc", // purple-400
  human: "#fb923c", // orange-400
  warn: "#f59e0b",
  danger: "#ef4444",
  ok: "#10b981",
} as const;

export type ColorKey = keyof typeof C;
