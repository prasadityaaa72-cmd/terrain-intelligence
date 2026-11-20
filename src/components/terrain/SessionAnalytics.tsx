import { BIN_MS, computeAnalytics } from "@/lib/demo/analytics";
import type { DemoState } from "@/lib/demo/engine";
import { fmtDuration, fmtHM } from "@/lib/format";
import { DemoTag, Metric, Panel } from "./primitives";

const W = 520;
const H = 196;
const PAD = { l: 30, r: 30, t: 14, b: 28 };
const MAX_BINS = 16;

export function SessionAnalytics({ state, now }: { state: DemoState; now: number | null }) {
  if (!now || !state.initialized) {
    return (
      <Panel index="04" title="Session analytics" meta={<DemoTag />}>
        <div className="h-[260px] animate-pulse bg-muted" />
      </Panel>
    );
  }
  const a = computeAnalytics(state, now);
  const bins = a.bins.slice(-MAX_BINS);
  const yMax = Math.max(3, ...bins.map((b) => b.count));
  const cMin = bins[0] ? bins[0].cumulative - bins[0].count : 0;
  const cMax = Math.max(cMin + 1, ...bins.map((b) => b.cumulative));
  const pw = W - PAD.l - PAD.r;
  const ph = H - PAD.t - PAD.b;
  const slot = pw / MAX_BINS;
  const bw = Math.max(6, slot * 0.56);
  const x = (i: number) => PAD.l + i * slot + slot / 2;
  const y = (v: number) => PAD.t + ph - (v / yMax) * ph;
  const yc = (v: number) => PAD.t + ph - ((v - cMin) / (cMax - cMin)) * ph;
  const line = bins.map((b, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${yc(b.cumulative).toFixed(1)}`).join(" ");
  const activePct = (a.activeMs / a.sessionMs) * 100;

  return (
    <Panel index="04" title="Session analytics" meta={<DemoTag>DEMO · LIVE IN BROWSER</DemoTag>}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="label-nano text-muted-foreground">Detections per {BIN_MS / 60_000}-min interval</span>
        <span className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2 bg-foreground" aria-hidden /> count
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-px w-4 bg-muted-foreground" aria-hidden /> cumulative
          </span>
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 block h-auto w-full" role="img" aria-label={`Bar chart of detections per interval. ${a.totalDetections} detections this session.`}>
        <defs>
          <pattern id="a-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="4" height="4" className="fill-card" />
            <line x1="0" y1="0" x2="0" y2="4" className="stroke-foreground" strokeWidth="1.6" />
          </pattern>
        </defs>
        {[0, 0.5, 1].map((f) => {
          const v = Math.round(yMax * f);
          return (
            <g key={f}>
              <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} className="stroke-border" strokeWidth="0.8" strokeDasharray={f ? "2 3" : undefined} />
              <text x={PAD.l - 6} y={y(v) + 3} textAnchor="end" className="fill-muted-foreground font-mono text-[9px]">{v}</text>
            </g>
          );
        })}
        <text x={W - PAD.r + 6} y={yc(cMax) + 3} className="fill-muted-foreground font-mono text-[9px]">{cMax}</text>
        <text x={W - PAD.r + 6} y={yc(cMin) + 3} className="fill-muted-foreground font-mono text-[9px]">{cMin}</text>
        {bins.map((b, i) => {
          const isCurrent = i === bins.length - 1;
          const h = Math.max(b.count ? 2 : 0, PAD.t + ph - y(b.count));
          return (
            <g key={b.start}>
              <rect
                x={x(i) - bw / 2}
                y={PAD.t + ph - h}
                width={bw}
                height={h}
                fill={isCurrent ? "url(#a-hatch)" : undefined}
                className={isCurrent ? "stroke-foreground" : "fill-foreground"}
                strokeWidth={isCurrent ? 0.8 : 0}
              >
                <title>{`${fmtHM(b.start)} · ${b.count} detection${b.count === 1 ? "" : "s"}`}</title>
              </rect>
              {(i % 3 === 0 || isCurrent) && (
                <text x={x(i)} y={H - 10} textAnchor="middle" className="fill-muted-foreground font-mono text-[9px]">
                  {isCurrent ? "now" : fmtHM(b.start)}
                </text>
              )}
            </g>
          );
        })}
        <path d={line} className="fill-none stroke-muted-foreground" strokeWidth="1" />
        {bins.map((b, i) => (
          <circle key={b.start} cx={x(i)} cy={yc(b.cumulative)} r="1.6" className="fill-card stroke-muted-foreground" strokeWidth="0.9" />
        ))}
      </svg>

      <div className="mt-4 border-t border-border pt-4">
        <div className="flex items-baseline justify-between">
          <span className="label-nano text-muted-foreground">Active vs clear time</span>
          <span className="font-mono text-xs tabular-nums text-foreground">
            {activePct < 0.1 && a.activeMs > 0 ? "<0.1" : activePct.toFixed(activePct < 10 ? 2 : 1)}% active
          </span>
        </div>
        <div className="mt-2 flex h-2 w-full overflow-hidden rounded-[1px] bg-muted">
          <div className="h-full bg-foreground" style={{ width: `${Math.max(a.activeMs ? 0.6 : 0, activePct)}%` }} />
        </div>
        <div className="mt-1.5 flex justify-between font-mono text-[11px] text-muted-foreground">
          <span>interrupted {fmtDuration(a.activeMs)}</span>
          <span>clear {fmtDuration(a.clearMs)}</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border pt-4">
        <Metric label="Avg interruption" value={a.avgDurationMs === null ? "—" : fmtDuration(a.avgDurationMs)} demo={false} />
        <Metric
          label="Peak rate"
          value={a.peakPerBin}
          unit={`/ ${BIN_MS / 60_000} min`}
          sub={a.peakBinStart ? `at ${fmtHM(a.peakBinStart)}` : "—"}
          demo={false}
        />
        <Metric label="Mean rate" value={a.ratePerHour.toFixed(1)} unit="/ h" sub={`over ${fmtDuration(a.sessionMs)}`} demo={false} />
      </div>
    </Panel>
  );
}