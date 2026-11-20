import type { AdapterStatus, SensorAdapter, SensorReading } from "./types";

/**
 * PLANNED — Arduino Uno serial integration (not active in v1).
 *
 * A browser cannot read a USB serial port on its own. Two supported routes:
 *  1. Web Serial API (Chromium desktop browsers, HTTPS, explicit user permission
 *     via navigator.serial.requestPort()).
 *  2. A small local bridge (e.g. Node/Python) that reads the port and forwards
 *     lines over WebSocket to the dashboard.
 *
 * Proposed line protocol from the Arduino sketch (9600 baud, newline-terminated):
 *    IR01,1          -> beam interrupted (rising edge)
 *    IR01,0,1340     -> beam clear, interruption lasted 1340 ms
 */

export const SERIAL_BAUD_RATE = 9600;

export function isWebSerialAvailable(): boolean {
  return typeof navigator !== "undefined" && "serial" in navigator;
}

/** Parse one protocol line into a SensorReading. Returns null for malformed lines. */
export function parseSerialLine(line: string, receivedAt: number): SensorReading | null {
  const parts = line.trim().split(",");
  if (parts.length < 2) return null;
  const [rawId, rawState, rawDuration] = parts;
  if (!rawId || !/^IR\d{2}$/i.test(rawId)) return null;
  if (rawState !== "0" && rawState !== "1") return null;

  const reading: SensorReading = {
    timestamp: receivedAt,
    sensorId: `IR-${rawId.slice(2)}`,
    beamInterrupted: rawState === "1",
    source: "serial",
  };
  if (rawDuration !== undefined && rawDuration !== "") {
    const ms = Number(rawDuration);
    if (!Number.isFinite(ms) || ms < 0) return null;
    reading.eventDurationMs = Math.round(ms);
  }
  return reading;
}

/** Placeholder adapter so the UI can show the planned integration honestly. */
export class SerialSensorAdapter implements SensorAdapter {
  readonly source = "serial" as const;
  readonly label = "Arduino Uno · USB serial (planned)";
  private current: AdapterStatus = "idle";

  status(): AdapterStatus {
    return this.current;
  }

  async connect(): Promise<void> {
    this.current = isWebSerialAvailable() ? "idle" : "unsupported";
    throw new Error(
      "Serial integration is not enabled in this build. It will require Web Serial permission or a local bridge.",
    );
  }

  async disconnect(): Promise<void> {
    this.current = "disconnected";
  }

  onReading(): () => void {
    return () => {};
  }
}