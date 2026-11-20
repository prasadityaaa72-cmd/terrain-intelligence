const pad = (n: number, w = 2) => String(n).padStart(w, "0");

export function fmtClock(ts: number): string {
  const d = new Date(ts);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function fmtHM(ts: number): string {
  const d = new Date(ts);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fmtDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fmtDuration(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) return "—";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(2)} s`;
  const m = Math.floor(ms / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  if (m < 60) return `${m} min ${pad(s)} s`;
  const h = Math.floor(m / 60);
  return `${h} h ${pad(m % 60)} min`;
}

export function fmtAgo(ts: number, now: number): string {
  const diff = Math.max(0, now - ts);
  if (diff < 5_000) return "just now";
  if (diff < 60_000) return `${Math.floor(diff / 1000)} s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min ago`;
  return `${Math.floor(diff / 3_600_000)} h ${Math.floor((diff % 3_600_000) / 60_000)} min ago`;
}

export function tzLabel(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "local";
  }
}