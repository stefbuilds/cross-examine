import { afterEach, describe, expect, it, vi } from "vitest";
import type { ChatModelAdapter } from "@assistant-ui/react";
import { createChatAdapter, readChatEvents } from "./chat-adapter";

afterEach(() => vi.unstubAllGlobals());

describe("chat stream", () => {
  it("preserves split UTF-8 and multiple JSON records per network chunk", async () => {
    const bytes = new TextEncoder().encode('{"type":"error","message":"Δ test"}\n{"type":"done"}\n');
    const body = new ReadableStream<Uint8Array>({ start(controller) {
      for (const byte of bytes) controller.enqueue(new Uint8Array([byte]));
      controller.close();
    } });
    const events = [];
    for await (const event of readChatEvents(body)) events.push(event);
    expect(events).toEqual([{ type: "error", message: "Δ test" }, { type: "done" }]);
  });

  it("renders token deltas cumulatively without dropping existing tool receipts", async () => {
    const receipt = { type: "tool-call", toolCallId: "t1", toolName: "get_report", args: {}, argsText: "{}", result: { run_id: "saved" } };
    const events = [
      { type: "snapshot", content: [receipt, { type: "text", text: "" }] },
      { type: "text-delta", index: 1, text: "Hello " },
      { type: "text-delta", index: 1, text: "world" },
      { type: "done" },
    ];
    const encoder = new TextEncoder();
    vi.stubGlobal("fetch", vi.fn(async () => new Response(new ReadableStream({ start(controller) {
      for (const event of events) controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      controller.close();
    } }))));
    const finish = vi.fn();
    const adapter = createChatAdapter("thread-1", finish);
    const options = {
      messages: [{ id: "user-1", role: "user", content: [{ type: "text", text: "Explain" }] }],
      abortSignal: new AbortController().signal,
    } as unknown as Parameters<ChatModelAdapter["run"]>[0];
    const stream = adapter.run(options);
    if (!(Symbol.asyncIterator in stream)) throw new Error("Expected streaming adapter");
    const updates = [];
    for await (const update of stream) updates.push(update.content);
    expect(updates).toEqual([
      [receipt, { type: "text", text: "" }],
      [receipt, { type: "text", text: "Hello " }],
      [receipt, { type: "text", text: "Hello world" }],
    ]);
    expect(finish).toHaveBeenCalledOnce();
  });
});
