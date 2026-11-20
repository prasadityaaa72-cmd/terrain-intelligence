import type { DemoState } from "@/lib/demo/engine";
import { fmtAgo, fmtClock } from "@/lib/format";
import { cn } from "@/lib/utils";
import { DemoTag } from "./primitives";

export function SummaryStrip({ state, now }: { state: DemoState; now: number | null }) {
  const detections = state.events.filter((e) => e.kind === "detection");
  const seeded = detections.filter((e) => e.seeded).length;
  const last = state.events[state.events.length - 1];
  const alarm = state.alarmLatched;

  const cells = [
    {
      label: "Current condition",
      body: (
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className={cn("size-2.5 rounded-full", alarm ? "bg-warning animate-buzzer" : "bg-foreground")}
          />
          <span className={cn("font-display text-[26px] leading-none tracking-tight", alarm && "text-warning-foreground")}>
            {state.initialized ? (alarm ? "Movement detected" : "Stable") : "—"}
          </span>
        </div>
      ),
      sub: alarm ? "Latched until operator clears" : "No material crossing the gate",
      tone: alarm,
    },
    {
      label: "Last event",
      body: (
        <span className="font-mono text-xl font-medium tabular-nums">
          {last && now ? fmtClock(last.timestamp) : "—"}
        </span>
      ),
      sub: last && now ? `${last.id} · ${last.state.toLowerCase()} · ${fmtAgo(last.timestamp, now)}` : "No events",
    },
    {
      label: "Detections this session",
      body: <span className="font-mono text-xl font-medium tabular-nums">{state.initialized ? detections.length : "—"}</span>,
      sub: seeded ? `Includes ${seeded} seeded sample events` : "Simulated in this browser",
    },
    {
      label: "Sensor state",
      body: (
        <span className="font-mono text-xl font-medium uppercase tracking-wide">
          {state.initialized ? (state.beamInterrupted ? "Interrupted" : "Beam clear") : "—"}
        </span>
      ),
      sub: `Buzzer ${alarm ? "active (visual)" : "silent"} · source: demo`,
    },
  ];

  return (
    <section aria-label="Summary" className="panel">
      <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x" aria-live="polite">
        {cells.map((c, i) => (
          <div
            key={c.label}
            className={cn(
              "relative px-5 py-4",
              i === 0 && c.tone && "bg-warning-soft",
              i >= 2 && "sm:border-t lg:border-t-0",
              i % 2 === 1 && "sm:border-l lg:border-l-0",
            )}
          >
            {i === 0 && c.tone && <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-warning" />}
            <div className="mb-2 flex items-center gap-2">
              <span className="label-nano text-muted-foreground">{c.label}</span>
              <DemoTag />
            </div>
            <div className="text-foreground">{c.body}</div>
            <p className="mt-1.5 truncate text-xs text-muted-foreground">{c.sub}</p>
          </div>
        ))}
      </div>
      <p className="border-t border-border px-5 py-2 text-[11px] text-muted-foreground">
        Values are illustrative demo data generated in this browser. No field hardware is connected.
      </p>
    </section>
  );
}