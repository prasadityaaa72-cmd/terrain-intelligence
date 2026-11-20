import type { DemoState, EventRecord } from "./engine";

export const BIN_MS = 5 * 60_000;

export interface Bin {
  start: number;
  count: number;
  cumulative: number;
}

export interface SessionAnalytics {
  bins: Bin[];
  totalDetections: number;
  sessionMs: number;
  activeMs: number;
  clearMs: number;
  avgDurationMs: number | null;
  peakPerBin: number;
  peakBinStart: number | null;
  ratePerHour: number;
}

export function effectiveDuration(e: EventRecord, now: number, activeEventId: string | null): number {
  const elapsed = Math.max(0, now - e.timestamp);
  if (e.id === activeEventId) return Math.min(e.durationMs ?? elapsed, elapsed);
  return e.durationMs ?? 0;
}

export function computeAnalytics(state: DemoState, now: number): SessionAnalytics {
  const start = state.sessionStart;
  const sessionMs = Math.max(1, now - start);
  const detections = state.events.filter((e) => e.kind === "detection");
  const nBins = Math.max(1, Math.ceil(sessionMs / BIN_MS));

  const counts = new Array<number>(nBins).fill(0);
  for (const e of detections) {
    const idx = Math.min(nBins - 1, Math.max(0, Math.floor((e.timestamp - start) / BIN_MS)));
    counts[idx] = (counts[idx] ?? 0) + 1;
  }
  let running = 0;
  const bins: Bin[] = counts.map((count, i) => {
    running += count;
    return { start: start + i * BIN_MS, count, cumulative: running };
  });

  const durations = detections.map((e) => effectiveDuration(e, now, state.activeEventId));
  const activeMs = durations.reduce((a, b) => a + b, 0);
  const completed = detections.filter((e) => e.id !== state.activeEventId && e.durationMs !== null);
  const avgDurationMs = completed.length
    ? completed.reduce((a, e) => a + (e.durationMs ?? 0), 0) / completed.length
    : null;

  let peakPerBin = 0;
  let peakBinStart: number | null = null;
  for (const b of bins) {
    if (b.count > peakPerBin) {
      peakPerBin = b.count;
      peakBinStart = b.start;
    }
  }

  return {
    bins,
    totalDetections: detections.length,
    sessionMs,
    activeMs,
    clearMs: Math.max(0, sessionMs - activeMs),
    avgDurationMs,
    peakPerBin,
    peakBinStart,
    ratePerHour: detections.length / (sessionMs / 3_600_000),
  };
}

export type IndicatorLevel = "NONE" | "LOW" | "MODERATE" | "ELEVATED";

/**
 * Prototype indicator — a transparent heuristic, NOT a probability.
 * +1 interruption ≥ 300 ms (rejects flicker), +1 ≥ 800 ms,
 * +1 per other detection in the preceding 120 s (max +2).
 */
export function prototypeIndicator(
  state: DemoState,
  now: number,
): { score: number; max: number; level: IndicatorLevel } {
  const detections = state.events.filter((e) => e.kind === "detection");
  const last = detections[detections.length - 1];
  if (!last) return { score: 0, max: 4, level: "NONE" };
  const dur = effectiveDuration(last, now, state.activeEventId);
  let score = 0;
  if (dur >= 300) score += 1;
  if (dur >= 800) score += 1;
  const recent = detections.filter(
    (e) => e.id !== last.id && last.timestamp - e.timestamp <= 120_000 && last.timestamp >= e.timestamp,
  ).length;
  score += Math.min(2, recent);
  const level: IndicatorLevel = score >= 3 ? "ELEVATED" : score >= 2 ? "MODERATE" : "LOW";
  return { score, max: 4, level };
}