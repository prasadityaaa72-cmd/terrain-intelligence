import { Switch } from "@/components/ui/switch";
import { Chip, Panel } from "./primitives";

const LAYERS = [
  { name: "Satellite basemap", note: "Requires licensed imagery source" },
  { name: "Rainfall feed", note: "Requires weather data provider" },
  { name: "GPS station coordinates", note: "Requires surveyed station position" },
  { name: "Additional displacement sensor", note: "e.g. tilt or extensometer module" },
];

export function DataLayers() {
  return (
    <Panel title="Data layers" meta={<Chip tone="planned">Planned · inactive</Chip>}>
      <ul className="divide-y divide-border">
        {LAYERS.map((l) => {
          const id = `layer-${l.name.toLowerCase().replace(/\s+/g, "-")}`;
          return (
            <li key={l.name} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <div>
                <label htmlFor={id} className="text-sm font-medium text-foreground">
                  {l.name}
                </label>
                <p className="text-xs text-muted-foreground">{l.note}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="label-nano text-muted-foreground">Planned</span>
                <Switch id={id} disabled checked={false} aria-describedby={`${id}-state`} />
                <span id={`${id}-state`} className="sr-only">
                  Not available in this prototype
                </span>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
        None of these layers are active. No satellite, radar, GPS or weather data is used in this prototype.
      </p>
    </Panel>
  );
}