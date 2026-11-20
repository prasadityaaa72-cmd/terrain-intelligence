import { cn } from "@/lib/utils";

const GROUND =
  "M0,120 L90,118 C120,119 135,124 150,132 L620,360 C650,378 680,388 720,392 L770,393 L785,420 L895,420 L910,394 L1000,394 L1000,540 L0,540 Z";
const SURFACE =
  "M0,120 L90,118 C120,119 135,124 150,132 L620,360 C650,378 680,388 720,392 L770,393 L785,420 L895,420 L910,394 L1000,394";
const DEBRIS_PATH = "M300,199 L612,350 C648,370 680,381 720,385 L775,388 Q800,400 830,410";
const PARTICLE_PATH = "M520,300 L612,350 C648,370 680,381 720,385 L775,388 Q800,400 832,412";
const BASIN = "770,393 785,420 895,420 910,394";

/** Deterministic wobbly closed contour (rounded so SSR and client agree). */
function contour(cx: number, cy: number, r: number, seed: number): string {
  const pts: string[] = [];
  const N = 72;
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2;
    const rr =
      r * (1 + 0.07 * Math.sin(3 * t + seed) + 0.04 * Math.sin(5 * t + seed * 1.7) + 0.03 * Math.cos(2 * t + seed * 0.6));
    const x = cx + rr * Math.cos(t) * 1.3;
    const y = cy + rr * Math.sin(t) * 0.78;
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return `M${pts.join(" L")} Z`;
}

const CONTOURS = Array.from({ length: 9 }, (_, i) => ({
  d: contour(728 + i * 6, 112 + i * 4.2, 10 + i * 12, 0.9 + i * 0.35),
  index: i % 4 === 3,
}));

const ARROWS: Array<[number, number, number, number]> = [
  [261.3, 157.1, 306.3, 178.9],
  [351.3, 200.8, 396.3, 222.6],
  [441.3, 244.4, 486.3, 266.2],
];

const PARTICLES = [
  "M0,-3 L3,-1 L2,3 L-2,2 L-3,-1 Z",
  "M0,-2 L2,0 L1,2 L-2,1 Z",
  "M0,-4 L3,-2 L3,2 L-1,3 L-3,0 Z",
  "M0,-2 L2,-1 L1,2 L-2,1 Z",
  "M0,-3 L2,-2 L3,1 L0,3 L-3,1 Z",
];

const halo = "[paint-order:stroke] stroke-sky stroke-[3px] [stroke-linejoin:round]";

export function TerrainSchematic({
  beamInterrupted,
  alarmLatched,
  detections,
}: {
  beamInterrupted: boolean;
  alarmLatched: boolean;
  detections: number;
}) {
  const fill = 3 + Math.min(detections, 24) * 0.9;
  const gateAlert = beamInterrupted || alarmLatched;

  return (
    <figure className="m-0">
      <svg
        viewBox="0 0 1000 540"
        className="block h-auto w-full"
        role="img"
        aria-labelledby="terrain-title terrain-desc"
      >
        <title id="terrain-title">Model terrain schematic — not geospatial imagery</title>
        <desc id="terrain-desc">
          Cross-section of a model slope showing crest, loose soil on the slope face, the monitored debris path,
          an infrared detection gate at the slope toe, station 01 sensor post and the collection zone. Beam is currently{" "}
          {beamInterrupted ? "interrupted" : "clear"}.
        </desc>
        <defs>
          <pattern id="t-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="7" className="stroke-contour" strokeWidth="0.6" />
          </pattern>
          <pattern id="t-grain" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="0.9" className="fill-foreground/55" />
            <circle cx="4.5" cy="4.2" r="0.6" className="fill-foreground/40" />
          </pattern>
          <pattern id="t-collected" width="5" height="5" patternUnits="userSpaceOnUse">
            <rect width="5" height="5" className="fill-terrain-deep" />
            <circle cx="1.4" cy="1.4" r="0.9" className="fill-foreground/60" />
            <circle cx="3.8" cy="3.6" r="0.7" className="fill-foreground/45" />
          </pattern>
          <clipPath id="t-ground-clip">
            <path d={GROUND} />
          </clipPath>
          <clipPath id="t-basin-clip">
            <polygon points={BASIN} />
          </clipPath>
          <clipPath id="t-inset-clip">
            <rect x="649" y="41" width="334" height="180" />
          </clipPath>
          <marker id="t-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,1 L9,5 L0,9 Z" className="fill-foreground" />
          </marker>
          <marker id="t-arrow-muted" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,1 L9,5 L0,9 Z" className="fill-muted-foreground" />
          </marker>
        </defs>

        {/* drafting grid */}
        <rect width="1000" height="540" className="fill-sky" />
        <g className="stroke-grid" strokeWidth="0.6">
          {Array.from({ length: 21 }, (_, i) => (
            <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="540" />
          ))}
          {Array.from({ length: 11 }, (_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 50} x2="1000" y2={i * 50} />
          ))}
        </g>
        <g className="fill-muted-foreground font-mono text-[9px] tracking-[0.12em]">
          <text x="16" y="26">SECTION A–A′ · CROSS-SECTION VIEW</text>
          <text x="16" y="40" className="fill-contour-strong">RELATIVE GEOMETRY · NO DATUM</text>
        </g>

        {/* ground body + strata */}
        <path d={GROUND} className="fill-terrain" />
        <path d={GROUND} fill="url(#t-hatch)" />
        <g clipPath="url(#t-ground-clip)" className="fill-none stroke-contour-strong/60" strokeWidth="0.8">
          {[34, 78, 132, 196].map((dy, i) => (
            <path key={dy} d={SURFACE} transform={`translate(0 ${dy})`} strokeDasharray={i % 2 ? "6 4" : undefined} />
          ))}
        </g>

        {/* collection zone fill (illustrative, grows with detections) */}
        <g clipPath="url(#t-basin-clip)">
          <rect x="770" y="393" width="140" height="27" className="fill-sky" />
          <rect x="770" y={420 - fill} width="140" height={fill} fill="url(#t-collected)" />
        </g>

        {/* surface */}
        <path d={SURFACE} className="fill-none stroke-foreground" strokeWidth="1.6" strokeLinejoin="round" />

        {/* slope angle */}
        <line x1="150" y1="132" x2="246" y2="132" className="stroke-muted-foreground" strokeWidth="0.8" strokeDasharray="3 3" />
        <path d="M210,132 A60,60 0 0 1 204,158.2" className="fill-none stroke-muted-foreground" strokeWidth="0.9" />
        <text x="214" y="149" className="fill-foreground font-display text-[14px] italic">θ</text>

        {/* loose soil */}
        <path d="M220,166 L540,321 Q391,220 220,166 Z" fill="url(#t-grain)" className="stroke-foreground/70" strokeWidth="0.8" />

        {/* movement direction */}
        {ARROWS.map(([x1, y1, x2, y2]) => (
          <line key={x1} x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-foreground" strokeWidth="1.2" markerEnd="url(#t-arrow)" />
        ))}
        <text
          x="258"
          y="146"
          transform="rotate(25.9 258 146)"
          className="fill-foreground font-mono text-[9px] tracking-[0.14em]"
        >
          LOOSE-SOIL MOVEMENT ↘
        </text>

        {/* monitored debris path */}
        <path
          d={DEBRIS_PATH}
          className={cn("fill-none", beamInterrupted ? "stroke-foreground" : "stroke-muted-foreground")}
          strokeWidth="1"
          strokeDasharray="2 4"
          markerEnd="url(#t-arrow-muted)"
        />
        <line x1="566" y1="287" x2="552" y2="318" className="stroke-muted-foreground" strokeWidth="0.7" />
        <text x="566" y="282" className="fill-foreground font-mono text-[9px] tracking-[0.14em]">
          MONITORED DEBRIS PATH
        </text>

        {/* labels on profile */}
        <text x="36" y="108" className="fill-foreground font-mono text-[9px] tracking-[0.16em]">CREST</text>
        <text
          x="292"
          y="232"
          transform="rotate(25.9 292 232)"
          className={cn("fill-muted-foreground font-mono text-[9px] tracking-[0.16em]", halo, "stroke-terrain")}
        >
          SLOPE FACE · LOOSE MATERIAL OVER FIRM BASE
        </text>
        <text x="616" y="402" className={cn("fill-foreground font-mono text-[9px] tracking-[0.16em]", halo, "stroke-terrain")}>
          TOE
        </text>

        {/* detection gate */}
        <polygon
          points="726,369 676,354 676,386"
          className={cn(
            beamInterrupted ? "fill-warning/35 stroke-warning" : "fill-foreground/[0.04] stroke-contour-strong",
          )}
          strokeWidth="0.9"
          strokeDasharray={beamInterrupted ? undefined : "3 2"}
        />
        <line
          x1="690"
          y1="332"
          x2="690"
          y2="389"
          className={cn(gateAlert ? "stroke-warning" : "stroke-foreground", beamInterrupted && "animate-beam")}
          strokeWidth={gateAlert ? 2 : 1.2}
          strokeDasharray="4 4"
        />
        <text x="690" y="324" textAnchor="middle" className="fill-foreground font-mono text-[9px] font-medium tracking-[0.14em]">
          IR DETECTION GATE
        </text>

        {/* sensor post + module */}
        <rect x="740" y="330" width="4" height="62" className="fill-foreground" />
        <rect x="726" y="362" width="14" height="14" rx="1" className={beamInterrupted ? "fill-warning stroke-foreground" : "fill-card stroke-foreground"} strokeWidth="1" />
        <circle cx="729.5" cy="366" r="1.6" className="fill-foreground" />
        <circle cx="729.5" cy="372" r="1.6" className="fill-none stroke-foreground" strokeWidth="0.8" />
        <polygon points="735,316 749,316 742,326" className={alarmLatched ? "fill-warning stroke-foreground" : "fill-foreground"} strokeWidth="0.8" />
        <g>
          <rect x="754" y="296" width="94" height="26" className="fill-card stroke-foreground" strokeWidth="0.8" />
          <text x="761" y="307" className="fill-foreground font-mono text-[9px] font-semibold tracking-[0.12em]">STN 01</text>
          <text x="761" y="317" className="fill-muted-foreground font-mono text-[8px] tracking-[0.1em]">IR-01 · BUZZER</text>
          <line x1="754" y1="314" x2="746" y2="320" className="stroke-foreground" strokeWidth="0.7" />
        </g>

        {/* collection zone label */}
        <text x="840" y="380" textAnchor="middle" className="fill-foreground font-mono text-[9px] tracking-[0.14em]">
          COLLECTION ZONE
        </text>
        <line x1="840" y1="384" x2="840" y2="404" className="stroke-muted-foreground" strokeWidth="0.7" />

        {/* moving debris while beam is interrupted */}
        {beamInterrupted && (
          <g className="fill-foreground motion-reduce:hidden">
            {PARTICLES.map((d, i) => (
              <path key={d} d={d}>
                <animateMotion dur="1.5s" begin={`${i * 0.22}s`} repeatCount="indefinite" path={PARTICLE_PATH} />
              </path>
            ))}
          </g>
        )}

        {/* plan view inset */}
        <g>
          <rect x="648.5" y="16.5" width="335" height="205" className="fill-card stroke-foreground/70" strokeWidth="1" />
          <line x1="648.5" y1="40.5" x2="983.5" y2="40.5" className="stroke-border" />
          <text x="660" y="32" className="fill-foreground font-mono text-[9px] font-medium tracking-[0.14em]">
            PLAN VIEW · SCHEMATIC
          </text>
          <text x="972" y="32" textAnchor="end" className="fill-muted-foreground font-mono text-[8px] tracking-[0.12em]">
            N ↑ NOMINAL
          </text>
          <g clipPath="url(#t-inset-clip)">
            {CONTOURS.map((c, i) => (
              <path
                key={i}
                d={c.d}
                className={cn("fill-none", c.index ? "stroke-contour-strong" : "stroke-contour")}
                strokeWidth={c.index ? 1 : 0.7}
              />
            ))}
            <path d="M742,120 C790,138 840,166 905,190" className="fill-none stroke-foreground" strokeWidth="1.1" strokeDasharray="3 3" markerEnd="url(#t-arrow)" />
            <line x1="873" y1="195" x2="888" y2="164" className={gateAlert ? "stroke-warning" : "stroke-foreground"} strokeWidth="2.2" />
            <polygon points="890,152 900,152 895,160" className={alarmLatched ? "fill-warning stroke-foreground" : "fill-foreground"} strokeWidth="0.6" />
            <rect x="912" y="182" width="56" height="28" className="fill-none stroke-foreground" strokeWidth="0.8" strokeDasharray="2 2" />
            <text x="940" y="199" textAnchor="middle" className="fill-foreground font-mono text-[8px] tracking-[0.1em]">COLL.</text>
            <text x="736" y="113" className="fill-foreground font-mono text-[9px] font-semibold">A</text>
            <text x="904" y="180" className="fill-foreground font-mono text-[9px] font-semibold">A′</text>
            <text x="902" y="152" className="fill-foreground font-mono text-[8px] tracking-[0.1em]">STN 01</text>
          </g>
          <text x="660" y="214" className="fill-muted-foreground font-mono text-[8px] tracking-[0.1em]">
            CONTOURS SCHEMATIC · NO COORDINATES
          </text>
        </g>

        {/* title block */}
        <g>
          <rect x="16.5" y="486.5" width="452" height="38" className="fill-card stroke-foreground" strokeWidth="1" />
          <line x1="16.5" y1="486.5" x2="16.5" y2="524.5" className="stroke-foreground" strokeWidth="3" />
          <text x="28" y="502" className="fill-foreground font-mono text-[10.5px] font-semibold tracking-[0.12em]">
            MODEL TERRAIN SCHEMATIC — NOT GEOSPATIAL IMAGERY
          </text>
          <text x="28" y="516" className="fill-muted-foreground font-mono text-[8.5px] tracking-[0.1em]">
            ILLUSTRATIVE GEOMETRY · NOT TO SCALE · θ = MODEL SLOPE ANGLE
          </text>
        </g>
      </svg>
    </figure>
  );
}

export function TerrainLegend() {
  const items: Array<{ label: string; sym: React.ReactNode }> = [
    {
      label: "Loose soil layer",
      sym: (
        <svg viewBox="0 0 24 12" className="h-3 w-6" aria-hidden>
          <rect x="1" y="2" width="22" height="8" fill="url(#t-grain)" className="stroke-foreground/70" strokeWidth="0.8" />
        </svg>
      ),
    },
    {
      label: "Movement direction",
      sym: (
        <svg viewBox="0 0 24 12" className="h-3 w-6" aria-hidden>
          <line x1="2" y1="6" x2="18" y2="6" className="stroke-foreground" strokeWidth="1.2" />
          <path d="M17,2.5 L23,6 L17,9.5 Z" className="fill-foreground" />
        </svg>
      ),
    },
    {
      label: "Monitored debris path",
      sym: (
        <svg viewBox="0 0 24 12" className="h-3 w-6" aria-hidden>
          <line x1="1" y1="6" x2="23" y2="6" className="stroke-muted-foreground" strokeWidth="1" strokeDasharray="2 3" />
        </svg>
      ),
    },
    {
      label: "IR detection gate",
      sym: (
        <svg viewBox="0 0 24 12" className="h-3 w-6" aria-hidden>
          <line x1="12" y1="0" x2="12" y2="12" className="stroke-foreground" strokeWidth="1.4" strokeDasharray="3 2" />
        </svg>
      ),
    },
    {
      label: "Sensor station",
      sym: (
        <svg viewBox="0 0 24 12" className="h-3 w-6" aria-hidden>
          <polygon points="7,1 17,1 12,10" className="fill-foreground" />
        </svg>
      ),
    },
    {
      label: "Alert state (amber)",
      sym: (
        <svg viewBox="0 0 24 12" className="h-3 w-6" aria-hidden>
          <rect x="4" y="2" width="16" height="8" className="fill-warning" />
        </svg>
      ),
    },
  ];
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-2 text-xs text-muted-foreground">
          {it.sym}
          {it.label}
        </li>
      ))}
    </ul>
  );
}