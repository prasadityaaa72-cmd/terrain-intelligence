import { STATION, type SensorReading, type SensorSource } from "@/lib/sensor/types";

/** Ignore new passages that start within this window of the previous one. */
export const COOLDOWN_MS = 2500;
/** Spacing between passages in the "repeated debris" sequence (> cooldown). */
export const BURST_SPACING_MS = 2200;
export const BURST_DURATIONS_MS = [640, 1180, 820, 1460] as const;
/** Durations cycled through for single simulated passages. */
export const PASSAGE_DURATIONS_MS = [920, 1340, 760, 1580, 1110, 680, 1820] as const;
/** Length of the seeded sample history shown when a demo session opens. */
export const SEED_SPAN_MS = 60 * 60_000;
const NOTICE_TTL_MS = 4000;

export type EventKind = "detection" | "system";

export interface EventRecord {
  id: string;
  timestamp: number;
  kind: EventKind;
  /** Sensor / system state label, e.g. "INTERRUPTED", "SELF-CHECK". */
  state: string;
  /** Interruption length for detections; null while unknown. */
  durationMs: number | null;
  note: string;
  source: SensorSource;
  /** true for the deterministic sample history loaded with the session. */
  seeded: boolean;
}

export interface ScheduledPassage {
  at: number;
  durationMs: number;
  note: string;
}

export interface Notice {
  text: string;
  at: number;
  tone: "info" | "warn";
}

export interface DemoState {
  initialized: boolean;
  sessionStart: number;
  beamInterrupted: boolean;
  /** When the current simulated interruption ends (null = unknown, e.g. serial). */
  beamReleaseAt: number | null;
  /** Condition stays MOVEMENT DETECTED (buzzer on) until the operator clears it. */
  alarmLatched: boolean;
  activeEventId: string | null;
  lastTransitionAt: number | null;
  lastTransitionKind: "interrupted" | "cleared" | null;
  lastDetectionStartAt: number | null;
  queue: ScheduledPassage[];
  events: EventRecord[];
  seq: { detection: number; system: number };
  notice: Notice | null;
}

export type DemoAction =
  | { type: "init"; now: number }
  | { type: "tick"; now: number }
  | { type: "simulatePassage"; now: number }
  | { type: "simulateBurst"; now: number }
  | { type: "acknowledge"; now: number }
  | { type: "clearEvents"; now: number }
  | { type: "reset"; now: number }
  | { type: "ingest"; reading: SensorReading };

export const EMPTY_STATE: DemoState = {
  initialized: false,
  sessionStart: 0,
  beamInterrupted: false,
  beamReleaseAt: null,
  alarmLatched: false,
  activeEventId: null,
  lastTransitionAt: null,
  lastTransitionKind: null,
  lastDetectionStartAt: null,
  queue: [],
  events: [],
  seq: { detection: 0, system: 0 },
  notice: null,
};

const pad3 = (n: number) => String(n).padStart(3, "0");

// Offsets in minutes from session start. Deterministic so every demo looks the same.
const SEED_DETECTIONS: ReadonlyArray<readonly [number, number, string]> = [
  [6.4, 820, "Sample · single passage, fine soil"],
  [13.1, 1340, "Sample · single passage, mixed grain"],
  [13.6, 610, "Sample · trailing fragment"],
  [22.8, 2150, "Sample · sustained passage, damp soil"],
  [31.2, 940, "Sample · single passage"],
  [38.5, 480, "Sample · debris cluster 1/3"],
  [38.9, 1120, "Sample · debris cluster 2/3"],
  [39.4, 760, "Sample · debris cluster 3/3"],
  [47.0, 1580, "Sample · single passage, coarse grain"],
  [55.3, 690, "Sample · short passage"],
];

const SEED_SYSTEM: ReadonlyArray<readonly [number, string, string]> = [
  [0, "SESSION OPEN", "Demo session opened · sample history loaded"],
  [0.3, "SELF-CHECK", "Sensor module self-check (simulated)"],
  [0.6, "BUZZER TEST", "Buzzer output test · visual indicator only"],
  [40.2, "ACKNOWLEDGED", "Operator review after repeated passage"],
];

export function createSession(now: number): DemoState {
  const start = now - SEED_SPAN_MS;
  type Raw = { t: number; kind: EventKind; state: string; dur: number | null; note: string };
  const raw: Raw[] = [
    ...SEED_DETECTIONS.map(([m, dur, note]) => ({
      t: start + Math.round(m * 60_000),
      kind: "detection" as const,
      state: "INTERRUPTED",
      dur,
      note,
    })),
    ...SEED_SYSTEM.map(([m, state, note]) => ({
      t: start + Math.round(m * 60_000),
      kind: "system" as const,
      state,
      dur: null,
      note,
    })),
  ].sort((a, b) => a.t - b.t);

  let d = 0;
  let s = 0;
  const events: EventRecord[] = raw.map((r) => ({
    id: r.kind === "detection" ? `D-${pad3(++d)}` : `S-${pad3(++s)}`,
    timestamp: r.t,
    kind: r.kind,
    state: r.state,
    durationMs: r.dur,
    note: r.note,
    source: "demo",
    seeded: true,
  }));
  const lastDetection = [...events].reverse().find((e) => e.kind === "detection");

  return {
    ...EMPTY_STATE,
    initialized: true,
    sessionStart: start,
    events,
    seq: { detection: d, system: s },
    lastDetectionStartAt: lastDetection?.timestamp ?? null,
    lastTransitionAt: lastDetection ? lastDetection.timestamp + (lastDetection.durationMs ?? 0) : null,
    lastTransitionKind: lastDetection ? "cleared" : null,
  };
}

function systemEvent(state: DemoState, now: number, label: string, note: string): DemoState {
  const n = state.seq.system + 1;
  return {
    ...state,
    seq: { ...state.seq, system: n },
    events: [
      ...state.events,
      {
        id: `S-${pad3(n)}`,
        timestamp: now,
        kind: "system",
        state: label,
        durationMs: null,
        note,
        source: "demo",
        seeded: false,
      },
    ],
  };
}

function startPassage(
  state: DemoState,
  now: number,
  durationMs: number | null,
  note: string,
  source: SensorSource,
): DemoState {
  const n = state.seq.detection + 1;
  const id = `D-${pad3(n)}`;
  return {
    ...state,
    seq: { ...state.seq, detection: n },
    events: [
      ...state.events,
      { id, timestamp: now, kind: "detection", state: "INTERRUPTED", durationMs, note, source, seeded: false },
    ],
    beamInterrupted: true,
    beamReleaseAt: durationMs === null ? null : now + durationMs,
    alarmLatched: true,
    activeEventId: id,
    lastTransitionAt: now,
    lastTransitionKind: "interrupted",
    lastDetectionStartAt: now,
  };
}

function releaseBeam(state: DemoState, at: number, durationMs?: number): DemoState {
  const events = state.activeEventId
    ? state.events.map((e) => {
        if (e.id !== state.activeEventId) return e;
        const measured = durationMs ?? Math.max(0, at - e.timestamp);
        const dur = e.durationMs === null ? measured : Math.min(e.durationMs, measured);
        return { ...e, durationMs: dur };
      })
    : state.events;
  return {
    ...state,
    events,
    beamInterrupted: false,
    beamReleaseAt: null,
    activeEventId: null,
    lastTransitionAt: at,
    lastTransitionKind: "cleared",
  };
}

const warn = (state: DemoState, now: number, text: string): DemoState => ({
  ...state,
  notice: { text, at: now, tone: "warn" },
});

const info = (state: DemoState, now: number, text: string): DemoState => ({
  ...state,
  notice: { text, at: now, tone: "info" },
});

export function cooldownRemaining(state: DemoState, now: number): number {
  if (state.lastDetectionStartAt === null) return 0;
  return Math.max(0, COOLDOWN_MS - (now - state.lastDetectionStartAt));
}

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "init":
      return state.initialized ? state : createSession(action.now);

    case "reset":
      return info(createSession(action.now), action.now, "Demo reset · sample history reloaded");

    case "tick": {
      const { now } = action;
      let next = state;
      if (next.beamInterrupted && next.beamReleaseAt !== null && now >= next.beamReleaseAt) {
        next = releaseBeam(next, next.beamReleaseAt);
      }
      while (next.queue.length > 0 && !next.beamInterrupted) {
        const head = next.queue[0];
        if (!head || head.at > now) break;
        next = startPassage({ ...next, queue: next.queue.slice(1) }, head.at, head.durationMs, head.note, "demo");
        if (next.beamReleaseAt !== null && now >= next.beamReleaseAt) {
          next = releaseBeam(next, next.beamReleaseAt);
        }
      }
      if (next.notice && now - next.notice.at > NOTICE_TTL_MS) {
        next = { ...next, notice: null };
      }
      return next;
    }

    case "simulatePassage": {
      const { now } = action;
      if (!state.initialized) return state;
      if (state.queue.length > 0) return warn(state, now, "Repeated-debris sequence running · input ignored");
      if (state.beamInterrupted) return warn(state, now, "Beam already interrupted · input ignored");
      const remaining = cooldownRemaining(state, now);
      if (remaining > 0) {
        return warn(state, now, `Debounce cooldown · ${(remaining / 1000).toFixed(1)} s remaining`);
      }
      const duration = PASSAGE_DURATIONS_MS[state.seq.detection % PASSAGE_DURATIONS_MS.length] ?? 900;
      return info(
        startPassage(state, now, duration, "DEMO · simulated soil passage", "demo"),
        now,
        "Simulated passage registered",
      );
    }

    case "simulateBurst": {
      const { now } = action;
      if (!state.initialized) return state;
      if (state.queue.length > 0) return warn(state, now, "Sequence already running · input ignored");
      if (state.beamInterrupted) return warn(state, now, "Beam interrupted · wait for clear");
      const remaining = cooldownRemaining(state, now);
      const first = now + remaining;
      const total = BURST_DURATIONS_MS.length;
      const queue: ScheduledPassage[] = BURST_DURATIONS_MS.map((durationMs, i) => ({
        at: first + i * BURST_SPACING_MS,
        durationMs,
        note: `DEMO · repeated debris passage ${i + 1}/${total}`,
      }));
      const next = demoReducer({ ...state, queue }, { type: "tick", now });
      return info(next, now, `Repeated debris sequence · ${total} passages at ${(BURST_SPACING_MS / 1000).toFixed(1)} s spacing`);
    }

    case "acknowledge": {
      const { now } = action;
      if (!state.alarmLatched && !state.beamInterrupted && state.queue.length === 0) {
        return info(state, now, "Already stable · nothing to clear");
      }
      let next: DemoState = state.beamInterrupted ? releaseBeam(state, now) : state;
      next = { ...next, queue: [], alarmLatched: false };
      next = systemEvent(next, now, "ACKNOWLEDGED", "DEMO · operator cleared beam, returned to normal");
      return info(next, now, "Returned to normal · buzzer silenced");
    }

    case "clearEvents": {
      const { now } = action;
      const base: DemoState = {
        ...state,
        events: [],
        queue: [],
        beamInterrupted: false,
        beamReleaseAt: null,
        alarmLatched: false,
        activeEventId: null,
        lastDetectionStartAt: null,
        lastTransitionAt: null,
        lastTransitionKind: null,
        seq: { detection: 0, system: 0 },
      };
      return info(
        systemEvent(base, now, "REGISTER CLEARED", "DEMO · event register cleared by operator"),
        now,
        "Event register cleared",
      );
    }

    case "ingest": {
      const r = action.reading;
      if (!state.initialized) return state;
      if (r.beamInterrupted && !state.beamInterrupted) {
        const remaining = cooldownRemaining(state, r.timestamp);
        if (remaining > 0) return state; // debounce: ignore chatter
        const label = r.source === "serial" ? `${r.sensorId} · serial edge` : "DEMO · adapter reading";
        return startPassage(state, r.timestamp, null, label, r.source);
      }
      if (!r.beamInterrupted && state.beamInterrupted) {
        return releaseBeam(state, r.timestamp, r.eventDurationMs);
      }
      return state;
    }
  }
}

/** Map a register entry back to the adapter reading shape (used by exports/tests). */
export function toSensorReading(e: EventRecord): SensorReading {
  const reading: SensorReading = {
    timestamp: e.timestamp,
    sensorId: STATION.sensorId,
    beamInterrupted: e.kind === "detection",
    source: e.source,
  };
  if (e.durationMs !== null) reading.eventDurationMs = e.durationMs;
  return reading;
}