import { prototypeIndicator, effectiveDuration } from "@/lib/demo/analytics";
import type { DemoState } from "@/lib/demo/engine";
import { fmtAgo, fmtClock, fmtDuration } from "@/lib/format";
import { cn } from "@/lib/utils";
import { DemoTag, Metric, Panel } from "./primitives";

function BeamDetail({ interrupted }: { interrupted: boolean }) {
  return (
    <svg viewBox="0 0 320 112" className="block h-auto w-full" role="img" aria-label={`Sensor beam schematic, beam ${interrupted ? "interrupted" : "clear"}`}>
      <defs>
        <marker id="b-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,1 L9,5 L0,9 Z" className={interrupted ? "fill-warning" : "fill-muted-foreground"} />
        </marker>
      </defs>
      <rect x="0.5" y="0.5" width="319" height="111" className="fill-sky stroke-border" />
      {/* module board */}
      <rect x="18" y="28" width="56" height="52" rx="2" className="fill-card stroke-foreground" strokeWidth="1" />
      <rect x="74" y="38" width="8" height="12" className={interrupted ? "fill-warning stroke-foreground" : "fill-foreground"} strokeWidth="0.6" />
      <rect x="74" y="58" width="8" height="12" className="fill-card stroke-foreground" strokeWidth="0.8" />
      <text x="24" y="44" className="fill-foreground font-mono text-[8px] font-semibold tracking-[0.1em]">IR-01</text>
      <text x="24" y="56" className="fill-muted-foreground font-mono text-[7px]">TX · emitter</text>
      <text x="24" y="66" className="fill-muted-foreground font-mono text-[7px]">RX · receiver</text>
      <text x="24" y="98" className="fill-muted-foreground font-mono text-[7px] tracking-[0.08em]">D0 → UNO D2 (planned)</text>

      {interrupted ? (
        <>
          <line x1="84" y1="44" x2="196" y2="44" className="stroke-warning animate-beam" strokeWidth="1.6" strokeDasharray="5 3" markerEnd="url(#b-arrow)" />
          <line x1="196" y1="62" x2="86" y2="64" className="stroke-warning animate-beam" strokeWidth="1.2" strokeDasharray="5 3" markerEnd="url(#b-arrow)" />
          <path d="M200,32 L222,26 L236,40 L232,66 L214,76 L198,68 Z" className="fill-terrain-deep stroke-foreground" strokeWidth="1" />
          <text x="244" y="48" className="fill-foreground font-mono text-[8px] tracking-[0.08em]">MATERIAL IN PATH</text>
          <text x="244" y="60" className="fill-muted-foreground font-mono text-[7px]">IR reflected → RX</text>
        </>
      ) : (
        <>
          <line x1="84" y1="44" x2="300" y2="44" className="stroke-muted-foreground" strokeWidth="1" strokeDasharray="2 4" />
          <text x="196" y="36" className="fill-muted-foreground font-mono text-[7px] tracking-[0.08em]">NO RETURN · PATH CLEAR</text>
        </>
      )}
      <line x1="180" y1="86" x2="180" y2="94" className="stroke-muted-foreground" strokeWidth="0.6" />
      <line x1="84" y1="90" x2="180" y2="90" className="stroke-muted-foreground" strokeWidth="0.6" />
      <text x="132" y="102" textAnchor="middle" className="fill-muted-foreground font-mono text-[7px]">
        detection range · set by module trimmer
      </text>
    </svg>
  );
}

export function SensorInterpretation({ state, now }: { state: DemoState; now: number | null }) {
  const detections = state.events.filter((e) => e.kind === "detection");
  const active = state.activeEventId ? state.events.find((e) => e.id === state.activeEventId) : undefined;
  const ind = now ? prototypeIndicator(state, now) : { score: 0, max: 4, level: "NONE" as const };

  return (
    <Panel index="02" title="Sensor interpretation" meta={<DemoTag>DEMO SOURCE</DemoTag>}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="label-nano text-muted-foreground">IR beam state</div>
          <div
            className={cn(
              "mt-1 font-display text-4xl leading-none tracking-tight",
              state.beamInterrupted ? "text-warning-foreground" : "text-foreground",
            )}
            aria-live="polite"
          >
            {state.beamInterrupted ? "Interrupted" : "Clear"}
          </div>
        </div>
        <div className="text-right font-mono text-xs text-muted-foreground">
          {active && now ? <>elapsed {fmtDuration(effectiveDuration(active, now, state.activeEventId))}</> : "digital out · HIGH = clear"}
        </div>
      </div>

      <div className="mt-4">
        <BeamDetail interrupted={state.beamInterrupted} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-border pt-4">
        <Metric label="Detection count" value={state.initialized ? detections.length : "—"} sub="this session" />
        <Metric
          label="Last transition"
          value={state.lastTransitionAt && now ? fmtClock(state.lastTransitionAt) : "—"}
          sub={
            state.lastTransitionAt && now
              ? `${state.lastTransitionKind === "interrupted" ? "→ interrupted" : "→ clear"} · ${fmtAgo(state.lastTransitionAt, now)}`
              : "none recorded"
          }
        />
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <div className="flex items-center justify-between gap-2">
          <span className="label-nano text-muted-foreground">Event confidence · prototype indicator</span>
          <span className="font-mono text-xs font-medium text-foreground">{ind.level === "NONE" ? "—" : ind.level}</span>
        </div>
        <div className="mt-2 grid grid-cols-4 gap-1" aria-label={`Prototype indicator ${ind.score} of ${ind.max}`}>
          {Array.from({ length: ind.max }, (_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-[1px]",
                i < ind.score ? (ind.level === "ELEVATED" ? "bg-warning" : "bg-foreground") : "bg-muted",
              )}
            />
          ))}
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          Heuristic from interruption length and repetition within 120 s. Not a scientific probability.
        </p>
      </div>

      <p className="mt-4 border-l-2 border-foreground bg-muted px-3 py-2.5 text-xs leading-relaxed text-foreground">
        The IR obstacle module detects material crossing its optical path. It does not predict landslides or
        measure slope displacement.
      </p>
    </Panel>
  );
}