import { createFileRoute } from "@tanstack/react-router";
import { useDemoSession } from "@/hooks/use-demo-session";
import { csvFilename, downloadCsv } from "@/lib/demo/csv";
import type { EventRecord } from "@/lib/demo/engine";
import { DashboardHeader } from "@/components/terrain/Header";
import { SummaryStrip } from "@/components/terrain/SummaryStrip";
import { TerrainLegend, TerrainSchematic } from "@/components/terrain/TerrainSchematic";
import { SensorInterpretation } from "@/components/terrain/SensorInterpretation";
import { DemoControls } from "@/components/terrain/DemoControls";
import { EventRegister } from "@/components/terrain/EventRegister";
import { SessionAnalytics } from "@/components/terrain/SessionAnalytics";
import { SystemDiagnostics } from "@/components/terrain/SystemDiagnostics";
import { DataLayers } from "@/components/terrain/DataLayers";
import { Methodology } from "@/components/terrain/Methodology";
import { Chip, DemoTag, Panel } from "@/components/terrain/primitives";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Terrain Intelligence — Slope movement observation (demo)" },
      {
        name: "description",
        content: "Student prototype dashboard for IR-based detection of loose soil crossing a gate at a model slope toe. Demo data.",
      },
      { property: "og:title", content: "Terrain Intelligence — Slope movement observation" },
      { property: "og:description", content: "Prototype passage-detection dashboard for a model slope, running on clearly labelled demo data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { state, now, actions } = useDemoSession();
  const detections = state.events.filter((e) => e.kind === "detection").length;
  const exportEvents = (events: EventRecord[]) => downloadCsv(events, csvFilename(Date.now()));

  return (
    <div className="canvas-paper min-h-screen">
      <DashboardHeader now={now} onExport={() => exportEvents(state.events)} />
      <main className="mx-auto max-w-[1520px] space-y-5 px-6 py-6">
        <SummaryStrip state={state} now={now} />
        <div className="grid gap-5 lg:grid-cols-12">
          <Panel
            index="01"
            title="Slope observation"
            className="lg:col-span-8"
            meta={
              <>
                <Chip tone="outline">Model terrain schematic — not geospatial imagery</Chip>
                <DemoTag />
              </>
            }
          >
            <TerrainSchematic beamInterrupted={state.beamInterrupted} alarmLatched={state.alarmLatched} detections={detections} />
            <div className="mt-4 border-t border-border pt-3">
              <TerrainLegend />
            </div>
          </Panel>
          <div className="space-y-5 lg:col-span-4">
            <SensorInterpretation state={state} now={now} />
            <DemoControls state={state} now={now} actions={actions} />
          </div>
          <div className="lg:col-span-7">
            <EventRegister state={state} now={now} onExport={exportEvents} onClear={actions.clearEvents} />
          </div>
          <div className="lg:col-span-5">
            <SessionAnalytics state={state} now={now} />
          </div>
          <div className="lg:col-span-8">
            <SystemDiagnostics state={state} />
          </div>
          <div className="lg:col-span-4">
            <DataLayers />
          </div>
        </div>
      </main>
      <Methodology />
    </div>
  );
}