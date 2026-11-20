import { useMemo, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { effectiveDuration } from "@/lib/demo/analytics";
import type { DemoState, EventRecord } from "@/lib/demo/engine";
import { fmtClock, fmtDuration } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ConfirmAction } from "./ConfirmAction";
import { Chip, Panel } from "./primitives";

type Filter = "all" | "detection" | "system";

export function EventRegister({
  state,
  now,
  onExport,
  onClear,
}: {
  state: DemoState;
  now: number | null;
  onExport: (events: EventRecord[]) => void;
  onClear: () => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const counts = useMemo(
    () => ({
      all: state.events.length,
      detection: state.events.filter((e) => e.kind === "detection").length,
      system: state.events.filter((e) => e.kind === "system").length,
    }),
    [state.events],
  );
  const rows = useMemo(
    () => [...state.events].filter((e) => filter === "all" || e.kind === filter).reverse(),
    [state.events, filter],
  );

  const filters: Array<{ id: Filter; label: string }> = [
    { id: "all", label: "All" },
    { id: "detection", label: "Detections" },
    { id: "system", label: "System" },
  ];

  return (
    <Panel
      index="03"
      title="Event register"
      bodyClassName="p-0"
      meta={
        <>
          <div role="radiogroup" aria-label="Filter events" className="flex rounded-sm border border-border">
            {filters.map((f) => (
              <button
                key={f.id}
                role="radio"
                aria-checked={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] transition-colors first:rounded-l-sm last:rounded-r-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  filter === f.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent",
                )}
              >
                {f.label} <span className="opacity-60">{counts[f.id]}</span>
              </button>
            ))}
          </div>
          <Button variant="quiet" size="sm" onClick={() => onExport(rows)} disabled={!rows.length}>
            <Download /> CSV ({rows.length})
          </Button>
          <ConfirmAction
            trigger={
              <Button variant="quiet" size="sm" disabled={!state.events.length}>
                <Trash2 /> Clear
              </Button>
            }
            title="Clear the event register?"
            description="All demo and sample events will be removed and counters return to zero. Export a CSV first if you want to keep them."
            confirmLabel="Clear events"
            onConfirm={onClear}
          />
        </>
      }
    >
      <div className="max-h-[420px] overflow-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-xs">
          <thead className="sticky top-0 z-10 bg-card">
            <tr className="border-b border-border">
              {["Event ID", "Time", "Type", "Sensor state", "Duration", "Source", "Operator note"].map((h) => (
                <th key={h} scope="col" className="label-nano px-4 py-2.5 font-medium text-muted-foreground first:pl-5">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono">
            {rows.map((e) => {
              const isActive = e.id === state.activeEventId;
              return (
                <tr
                  key={e.id}
                  className={cn(
                    "border-b border-border/70 transition-colors hover:bg-muted/60",
                    isActive && "bg-warning-soft",
                  )}
                >
                  <td className={cn("px-4 py-2 pl-5 font-medium", isActive && "border-l-[3px] border-l-warning pl-[17px]")}>{e.id}</td>
                  <td className="px-4 py-2 tabular-nums">{now ? fmtClock(e.timestamp) : "—"}</td>
                  <td className="px-4 py-2 uppercase text-muted-foreground">{e.kind}</td>
                  <td className="px-4 py-2 uppercase">
                    {e.kind === "detection" ? (isActive ? "Interrupted · active" : "Interrupted → clear") : e.state}
                  </td>
                  <td className="px-4 py-2 tabular-nums">
                    {e.kind === "detection" && now ? fmtDuration(effectiveDuration(e, now, state.activeEventId)) : "—"}
                  </td>
                  <td className="px-4 py-2">
                    <Chip tone={e.seeded ? "planned" : "outline"}>{e.seeded ? "Demo · sample" : "Demo"}</Chip>
                  </td>
                  <td className="px-4 py-2 font-sans text-muted-foreground">{e.note}</td>
                </tr>
              );
            })}
            {!rows.length && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center font-sans text-sm text-muted-foreground">
                  {state.initialized ? "No events match this filter." : "Initialising demo session…"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}