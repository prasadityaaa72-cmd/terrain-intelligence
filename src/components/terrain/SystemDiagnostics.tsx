import { useEffect, useState } from "react";
import type { DemoState } from "@/lib/demo/engine";
import { isWebSerialAvailable, SERIAL_BAUD_RATE } from "@/lib/sensor/serial-adapter";
import { cn } from "@/lib/utils";
import { Chip, Panel } from "./primitives";

export function SystemDiagnostics({ state }: { state: DemoState }) {
  const [webSerial, setWebSerial] = useState<boolean | null>(null);
  useEffect(() => setWebSerial(isWebSerialAvailable()), []);

  const rows: Array<{ name: string; spec: string; status: React.ReactNode; detail: string }> = [
    {
      name: "Sensor module",
      spec: "IR obstacle module · digital out",
      status: <Chip tone="outline" dot="live">Simulated</Chip>,
      detail: state.beamInterrupted ? "Demo adapter reports beam interrupted" : "Demo adapter reports beam clear",
    },
    {
      name: "Arduino interface",
      spec: "Arduino Uno · USB serial (future integration)",
      status: <Chip tone="planned" dot="idle">Not connected — demo mode</Chip>,
      detail: `Planned ${SERIAL_BAUD_RATE} baud line protocol`,
    },
    {
      name: "Buzzer output",
      spec: "Piezo buzzer · digital pin (planned)",
      status: state.alarmLatched ? <Chip tone="warning" dot="warn">Active · visual</Chip> : <Chip tone="outline">Idle</Chip>,
      detail: "On-screen indicator only — no audio in this build",
    },
    {
      name: "Power state",
      spec: "USB 5 V supply (planned)",
      status: <Chip tone="planned">Not monitored</Chip>,
      detail: "No voltage reading available in demo mode",
    },
    {
      name: "Web Serial API",
      spec: "Browser capability check",
      status:
        webSerial === null ? (
          <Chip tone="outline">Checking…</Chip>
        ) : (
          <Chip tone="outline">{webSerial ? "Available in this browser" : "Not available"}</Chip>
        ),
      detail: webSerial === false ? "Use desktop Chromium, or a local bridge" : "Permission prompt needed on connect",
    },
  ];

  return (
    <Panel index="05" title="System diagnostics" meta={<Chip tone="solid">Demo mode</Chip>} bodyClassName="p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-xs">
          <thead>
            <tr className="border-b border-border">
              {["Component", "Status", "Detail"].map((h) => (
                <th key={h} scope="col" className="label-nano px-4 py-2.5 font-medium text-muted-foreground first:pl-5">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.name} className={cn(i < rows.length - 1 && "border-b border-border/70")}>
                <td className="px-4 py-2.5 pl-5">
                  <div className="font-medium text-foreground">{r.name}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">{r.spec}</div>
                </td>
                <td className="px-4 py-2.5">{r.status}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{r.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-5 border-t border-border p-5 md:grid-cols-[1.3fr_1fr]">
        <div>
          <h3 className="label-nano text-foreground">Integration note · next stage</h3>
          <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs leading-relaxed text-muted-foreground">
            <li>Arduino sketch reads the IR module on D2, drives the buzzer, and prints one line per beam edge.</li>
            <li>
              A browser cannot open a USB port on its own. The dashboard will use the Web Serial API (desktop
              Chromium, user grants port permission) or a small local bridge that forwards lines over WebSocket.
            </li>
            <li>Each line is parsed into a typed sensor reading with source “serial”; the UI stays unchanged.</li>
            <li>Demo labels switch off only when real readings arrive from a connected port.</li>
          </ol>
        </div>
        <div>
          <h3 className="label-nano text-foreground">Planned serial line format</h3>
          <pre className="mt-2 overflow-x-auto rounded-sm border border-border bg-muted px-3 py-2.5 font-mono text-[11px] leading-relaxed text-foreground">
{`IR01,1        # beam interrupted
IR01,0,1340   # clear, lasted 1340 ms

reading = {
  timestamp, sensorId,
  beamInterrupted, eventDurationMs,
  source: "serial", signalQuality?
}`}
          </pre>
        </div>
      </div>
    </Panel>
  );
}