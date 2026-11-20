import type { EventRecord } from "./engine";

const HEADER = [
  "event_id",
  "timestamp_iso",
  "type",
  "sensor_state",
  "duration_ms",
  "source",
  "data_label",
  "operator_note",
];

function cell(v: string | number | null): string {
  if (v === null) return "";
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function eventsToCsv(events: EventRecord[]): string {
  const rows = [...events]
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((e) =>
      [
        e.id,
        new Date(e.timestamp).toISOString(),
        e.kind,
        e.state,
        e.durationMs,
        e.source,
        e.source === "demo" ? (e.seeded ? "DEMO - seeded sample" : "DEMO - simulated") : "LIVE - serial",
        e.note,
      ]
        .map(cell)
        .join(","),
    );
  return [HEADER.join(","), ...rows].join("\r\n");
}

export function downloadCsv(events: EventRecord[], filename: string): void {
  const blob = new Blob([eventsToCsv(events)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function csvFilename(now: number): string {
  const d = new Date(now);
  const p = (n: number) => String(n).padStart(2, "0");
  return `terrain-station01-events-DEMO-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}.csv`;
}