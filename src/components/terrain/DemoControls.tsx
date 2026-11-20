import { BellOff, BellRing, Layers3, RotateCcw, ShieldCheck, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COOLDOWN_MS, cooldownRemaining, type DemoState } from "@/lib/demo/engine";
import type { DemoActions } from "@/hooks/use-demo-session";
import { cn } from "@/lib/utils";
import { ConfirmAction } from "./ConfirmAction";
import { Chip } from "./primitives";

export function DemoControls({ state, now, actions }: { state: DemoState; now: number | null; actions: DemoActions }) {
  const remaining = now ? cooldownRemaining(state, now) : 0;
  const cooldownPct = remaining > 0 ? (remaining / COOLDOWN_MS) * 100 : 0;
  const buzzer = state.alarmLatched;
  const running = state.queue.length > 0;
  const disabled = !state.initialized;

  return (
    <section aria-labelledby="demo-controls" className="panel-graphite">
      <header className="flex items-center justify-between gap-3 border-b border-graphite-border px-5 py-3">
        <h2 id="demo-controls" className="label-micro">Demo controls</h2>
        <Chip tone="dark">Simulation only</Chip>
      </header>

      <div className="space-y-4 p-5">
        <div
          className={cn(
            "flex items-center justify-between gap-3 rounded-sm border px-3 py-2.5",
            buzzer ? "border-warning bg-warning text-warning-foreground" : "border-graphite-border bg-graphite-muted",
          )}
          aria-live="polite"
        >
          <div className="flex items-center gap-2.5">
            {buzzer ? <BellRing className="size-4 animate-buzzer" aria-hidden /> : <BellOff className="size-4 opacity-70" aria-hidden />}
            <div>
              <div className="label-nano opacity-80">Buzzer indicator</div>
              <div className="font-mono text-sm font-medium uppercase tracking-wide">
                {buzzer ? "Sounding · visual only" : "Silent"}
              </div>
            </div>
          </div>
          <span className="label-nano opacity-80">{running ? `${state.queue.length} queued` : "no audio"}</span>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <Button variant="instrument" onClick={actions.simulatePassage} disabled={disabled} className="h-auto justify-start py-2.5 text-left">
            <Waves /> Simulate soil passage
          </Button>
          <Button variant="instrument-outline" onClick={actions.simulateBurst} disabled={disabled} className="h-auto justify-start py-2.5 text-left">
            <Layers3 /> Repeated debris ×4
          </Button>
          <Button variant="instrument-outline" onClick={actions.acknowledge} disabled={disabled} className="h-auto justify-start py-2.5 text-left">
            <ShieldCheck /> Clear beam · normal
          </Button>
          <ConfirmAction
            trigger={
              <Button variant="instrument-outline" disabled={disabled} className="h-auto justify-start py-2.5 text-left">
                <RotateCcw /> Reset demo
              </Button>
            }
            title="Reset the demo session?"
            description="This discards every event in the register and reloads the seeded 60-minute sample history. Nothing is stored outside this browser tab."
            confirmLabel="Reset demo"
            onConfirm={actions.reset}
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <span className="label-nano text-graphite-subtle">Debounce cooldown · {(COOLDOWN_MS / 1000).toFixed(1)} s</span>
            <span className="font-mono text-[11px] tabular-nums text-graphite-subtle">
              {remaining > 0 ? `${(remaining / 1000).toFixed(1)} s` : "ready"}
            </span>
          </div>
          <div className="mt-1.5 h-[3px] w-full bg-graphite-muted">
            <div className="h-full bg-graphite-foreground transition-[width] duration-200" style={{ width: `${cooldownPct}%` }} />
          </div>
        </div>

        <p className="min-h-[1.25rem] font-mono text-[11px] text-graphite-subtle" role="status">
          {state.notice ? `› ${state.notice.text}` : "› Awaiting operator input"}
        </p>
        <p className="border-t border-graphite-border pt-3 text-[11px] leading-relaxed text-graphite-subtle">
          Every event generated here is labelled DEMO. Inputs inside the cooldown window are ignored to mimic sensor
          debounce in the planned Arduino sketch.
        </p>
      </div>
    </section>
  );
}