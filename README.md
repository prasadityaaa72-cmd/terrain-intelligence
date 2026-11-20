# Terrain Intelligence

**Slope Movement Observation System** — a student-built prototype dashboard for observing loose-soil passage across an infrared detection gate on a miniature slope model.

> **Prototype limitation:** This is a model-scale passage-detection demonstrator, not a field-deployed landslide prediction or early-warning system. The IR sensor detects material crossing its beam; it does not predict slope failure or measure real-world ground displacement.

## Includes
- Topographic-style cross-section schematic of the model slope, sensor gate, and collection zone.
- Session status, detection event register, analytics, and CSV export.
- Demo controls, sensor interpretation, diagnostics, methodology, and future data-layer roadmap.
- Typed sensor event model and a serial-adapter foundation.

## Hardware concept
- IR sensor VCC → Arduino 5V
- IR sensor GND → Arduino GND
- IR sensor OUT → Arduino D2
- Optional buzzer positive → D8; negative → GND

Many IR obstacle modules are **active LOW**. Verify the actual module's output logic. Dust, ambient light, soil colour, alignment, and beam geometry affect reliability.

## Run locally
Requirements: Node.js LTS and npm.

```bash
npm install
npm run dev
```

Useful checks: `npm run build`, `npm run lint`, and `npm test`.

## Data integrity
The default interface is demo-driven. Never present simulated events as live sensor readings. A live connection should only be labelled connected after a real device handshake and data stream have been implemented and verified.

## Project structure
- `src/components/terrain/` — dashboard sections and terrain schematic
- `src/lib/demo/` — demo event engine, analytics, and CSV export
- `src/lib/sensor/` — sensor event types and serial adapter
- `src/hooks/` — dashboard session state
- `src/routes/` — application routes
- `src/styles.css` — visual design system

Competition prototype / active development. Validate the build and physical sensor setup before claiming live hardware integration.
