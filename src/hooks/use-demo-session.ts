import { useEffect, useMemo, useReducer, useState } from "react";
import { demoReducer, EMPTY_STATE } from "@/lib/demo/engine";

const TICK_MS = 250;

/** Browser-only demo session. Initialises after mount so SSR never renders a clock. */
export function useDemoSession() {
  const [state, dispatch] = useReducer(demoReducer, EMPTY_STATE);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const t = Date.now();
    dispatch({ type: "init", now: t });
    setNow(t);
    const id = window.setInterval(() => {
      const n = Date.now();
      setNow(n);
      dispatch({ type: "tick", now: n });
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  const actions = useMemo(
    () => ({
      simulatePassage: () => dispatch({ type: "simulatePassage", now: Date.now() }),
      simulateBurst: () => dispatch({ type: "simulateBurst", now: Date.now() }),
      acknowledge: () => dispatch({ type: "acknowledge", now: Date.now() }),
      clearEvents: () => dispatch({ type: "clearEvents", now: Date.now() }),
      reset: () => dispatch({ type: "reset", now: Date.now() }),
    }),
    [],
  );

  return { state, now, actions };
}

export type DemoActions = ReturnType<typeof useDemoSession>["actions"];