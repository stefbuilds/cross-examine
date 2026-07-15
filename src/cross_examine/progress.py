"""Thread-safe in-memory progress fan-out with replayable history."""

from __future__ import annotations

from collections.abc import Iterator
from queue import Queue
from threading import Lock

from cross_examine.schema import RunProgress

TERMINAL_STAGES = {"complete", "failed"}


class ProgressBroker:
    def __init__(self) -> None:
        self._lock = Lock()
        self._history: dict[str, list[RunProgress]] = {}
        self._subscribers: dict[str, list[Queue[RunProgress]]] = {}

    def publish(self, event: RunProgress) -> None:
        with self._lock:
            self._history.setdefault(event.run_id, []).append(event)
            subscribers = list(self._subscribers.get(event.run_id, []))
        for subscriber in subscribers:
            subscriber.put(event)

    def history(self, run_id: str) -> list[RunProgress]:
        with self._lock:
            return list(self._history.get(run_id, []))

    def subscribe(self, run_id: str) -> Iterator[RunProgress]:
        queue: Queue[RunProgress] = Queue()
        with self._lock:
            history = list(self._history.get(run_id, []))
            self._subscribers.setdefault(run_id, []).append(queue)
        try:
            for event in history:
                yield event
                if event.stage in TERMINAL_STAGES:
                    return
            while True:
                event = queue.get()
                yield event
                if event.stage in TERMINAL_STAGES:
                    return
        finally:
            with self._lock:
                subscribers = self._subscribers.get(run_id, [])
                if queue in subscribers:
                    subscribers.remove(queue)
