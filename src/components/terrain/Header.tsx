import { Download, Usb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmtClock, fmtDate, tzLabel } from "@/lib/format";
import { STATION } from "@/lib/sensor/types";
import { BrandMark, Chip } from "./primitives";

export function DashboardHeader({ now, onExport }: { now: number | null; onExport: () => void }) {
  return (
    <header className="border-b border-foreground/80 bg-card">
      <div className="mx-auto flex max-w-[1520px] flex-wrap items-center gap-x-8 gap-y-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <BrandMark />
          <div className="leading-tight">
            <div className="label-nano text-muted-foreground">Terrain / Field Intelligence</div>
            <h1 className="font-display text-[22px] font-medium tracking-tight text-foreground">
              Terrain Intelligence
            </h1>
            <p className="text-xs text-muted-foreground">Slope movement observation system</p>
          </div>
        </div>

        <div className="hidden h-10 w-px bg-border md:block" aria-hidden />

        <dl className="grid grid-cols-2 gap-x-6 gap-y-1">
          <dt className="label-nano text-muted-foreground">Station</dt>
          <dt className="label-nano text-muted-foreground">Sensor</dt>
          <dd className="font-mono text-sm font-medium text-foreground">
            {STATION.site} / {STATION.station}
          </dd>
          <dd className="font-mono text-sm text-foreground">{STATION.sensorId}</dd>
        </dl>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Chip tone="solid">Demo data</Chip>
          <Chip tone="outline" dot="idle">
            Connection · Simulated
          </Chip>
          <div className="px-2 text-right font-mono leading-tight" aria-live="off">
            <div className="text-sm font-medium tabular-nums text-foreground" suppressHydrationWarning>
              {now ? fmtClock(now) : "--:--:--"}
            </div>
            <div className="label-nano text-muted-foreground" suppressHydrationWarning>
              {now ? `${fmtDate(now)} · ${tzLabel()}` : "local time"}
            </div>
          </div>
          <Button variant="quiet" size="sm" onClick={onExport} disabled={!now}>
            <Download /> Export CSV
          </Button>
          <Button variant="quiet" size="sm" disabled title="Planned: Web Serial or local bridge">
            <Usb /> Connect Arduino · coming next
          </Button>
        </div>
      </div>
    </header>
  );
}