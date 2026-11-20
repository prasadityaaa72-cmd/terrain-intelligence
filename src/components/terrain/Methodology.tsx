export function Methodology() {
  const cols = [
    {
      h: "Method",
      p: "An IR obstacle module is mounted at the toe of a model slope, facing the debris path. When loose material crosses its optical path, the digital output changes state; the event is logged with time and interruption length.",
    },
    {
      h: "Limitations",
      p: "This prototype detects loose material crossing a defined IR beam near the slope base. It is a demonstration of passage detection, not an operational landslide early-warning system. It does not measure displacement, pore pressure or rainfall, and makes no prediction.",
    },
    {
      h: "Data provenance",
      p: "All values shown are DEMO data: a deterministic 60-minute sample history plus events you trigger with the demo controls. Nothing is sent to a server. The terrain figure is an original schematic, not geospatial imagery.",
    },
  ];
  return (
    <footer className="border-t border-foreground/80 bg-card">
      <div className="mx-auto max-w-[1520px] px-6 py-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="label-micro text-foreground">Methodology &amp; limitations · for judges</h2>
          <span className="label-nano text-muted-foreground">Student prototype · v1 · demo build</span>
        </div>
        <div className="mt-5 grid gap-6 md:grid-cols-3">
          {cols.map((c) => (
            <div key={c.h} className="border-t border-border pt-3">
              <h3 className="font-display text-lg font-medium text-foreground">{c.h}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{c.p}</p>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}