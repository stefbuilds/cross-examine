import type { ChatModelAdapter, ChatModelRunResult } from "@assistant-ui/react";

export interface ChatEvent {
  type: "snapshot" | "text-delta" | "error" | "done";
  content?: ChatModelRunResult["content"];
  index?: number;
  text?: string;
  message?: string;
}

/** NDJSON boundaries are independent of network chunks and UTF-8 characters. */
export async function* readChatEvents(body: ReadableStream<Uint8Array>): AsyncGenerator<ChatEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let pending = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      pending += decoder.decode(value, { stream: !done });
      const lines = pending.split("\n");
      pending = lines.pop() ?? "";
      for (const line of lines) if (line.trim()) yield JSON.parse(line) as ChatEvent;
      if (done) break;
    }
    if (pending.trim()) yield JSON.parse(pending) as ChatEvent;
  } finally {
    reader.releaseLock();
  }
}

export function createChatAdapter(threadId: string, onFinish: () => void): ChatModelAdapter {
  return {
    async *run({ messages, abortSignal }) {
      const message = messages.at(-1);
      if (!message || message.role !== "user") throw new Error("Send a new message to continue.");
      const text = message.content.flatMap((p) => p.type === "text" ? [p.text] : []).join("\n");
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/x-ndjson" },
          body: JSON.stringify({ thread_id: threadId, message_id: message.id, message: text }),
          signal: abortSignal,
        });
        if (!response.ok) {
          const error = await response.json().catch(() => ({})) as { detail?: string };
          throw new Error(error.detail ?? `Chat failed (${response.status})`);
        }
        if (!response.body) throw new Error("The server did not return a response stream.");
        let complete = false;
        let content: NonNullable<ChatModelRunResult["content"]> = [];
        for await (const event of readChatEvents(response.body)) {
          if (event.type === "error") throw new Error(event.message);
          if (event.type === "snapshot") {
            content = event.content ?? [];
            yield { content };
          }
          if (event.type === "text-delta") {
            content = content.map((part, index) => index === event.index && part.type === "text"
              ? { ...part, text: part.text + (event.text ?? "") } : part);
            yield { content };
          }
          if (event.type === "done") complete = true;
        }
        if (!complete && !abortSignal.aborted) throw new Error("Connection interrupted. Reload to recover saved messages.");
      } finally {
        onFinish();
      }
    },
  };
}
