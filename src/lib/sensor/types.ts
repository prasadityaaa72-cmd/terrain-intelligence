/**
 * Sensor adapter layer.
 *
 * Every data source (browser demo simulator today, Arduino serial tomorrow)
 * must emit `SensorReading` objects. The dashboard only consumes readings,
 * so switching from demo to hardware never touches the UI.
 */

export type SensorSource = "demo" | "serial";

export interface SensorReading {
  /** Epoch milliseconds when the reading was taken (or received, for serial). */
  timestamp: number;
  /** Identifier of the physical/virtual module, e.g. "IR-01". */
  sensorId: string;
  /** true while the IR obstacle module reports an object in its optical path. */
  beamInterrupted: boolean;
  /** Length of the interruption, reported on the CLEAR edge when known. */
  eventDurationMs?: number;
  source: SensorSource;
  /** Optional 0–1 link/signal quality. The IR module itself does not report this. */
  signalQuality?: number;
}

export type AdapterStatus =
  | "idle"
  | "unsupported"
  | "requesting-permission"
  | "connected"
  | "disconnected"
  | "error";

export interface SensorAdapter {
  readonly source: SensorSource;
  readonly label: string;
  status(): AdapterStatus;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  /** Subscribe to readings; returns an unsubscribe function. */
  onReading(listener: (reading: SensorReading) => void): () => void;
}

export const STATION = {
  site: "MODEL SITE",
  station: "STATION 01",
  sensorId: "IR-01",
  module: "IR obstacle module (digital out)",
} as const;