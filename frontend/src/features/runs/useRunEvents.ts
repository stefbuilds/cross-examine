import { useEffect, useState } from "react";

import { getRun, type RunResponse } from "@/app/api";

export interface RunEvent {
  run_id: string;
  stage: string;
  message: string;
  elapsed_seconds: number;
}

export function useRunEvents(initialRun: RunResponse) {
  const [run, setRun] = useState(initialRun);
  const [events, setEvents] = useState<RunEvent[]>([]);

  useEffect(() => {
    let closed = false;
    let source: EventSource | undefined;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let pollTimer: ReturnType<typeof setInterval> | undefined;
    let reconnects = 0;
    setRun(initialRun);
    setEvents([]);

    async function refresh() {
      try {
        const next = await getRun(initialRun.id);
        if (!closed) setRun(next);
        return next;
      } catch {
        return null;
      }
    }

    function startPolling() {
      if (pollTimer) return;
      void refresh();
      pollTimer = setInterval(async () => {
        const next = await refresh();
        if (next?.report || next?.status === "failed") {
          if (pollTimer) clearInterval(pollTimer);
          pollTimer = undefined;
        }
      }, 2000);
    }

    function connect() {
      source = new EventSource(
        `/api/runs/${encodeURIComponent(initialRun.id)}/events`,
      );
      source.onmessage = (message) => {
        let event: RunEvent;
        try {
          event = JSON.parse(message.data) as RunEvent;
        } catch {
          source?.close();
          startPolling();
          return;
        }
        setEvents((current) => [...current, event]);
        setRun((current) => ({
          ...current,
          status: event.stage === "failed" ? "failed" : "running",
          stage: event.stage,
          message: event.message,
        }));
        if (event.stage === "complete" || event.stage === "failed") {
          source?.close();
          void refresh().then((next) => {
            if (!next && !closed) startPolling();
          });
        }
      };
      source.onerror = () => {
        source?.close();
        if (closed) return;
        if (reconnects < 1) {
          reconnects += 1;
          retryTimer = setTimeout(connect, 800);
        } else {
          startPolling();
        }
      };
    }

    if (initialRun.report === null && initialRun.status !== "failed") connect();
    return () => {
      closed = true;
      source?.close();
      if (retryTimer) clearTimeout(retryTimer);
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [initialRun]);

  return { run, events };
}
