import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowsInSimpleIcon, PlusIcon, XIcon } from "@phosphor-icons/react/ssr";
import { CompactAssistantBar } from "./CompactAssistantBar";
import { AssistantRuntimeProvider, useLocalRuntime, type ThreadMessageLike } from "@assistant-ui/react";
import { Thread } from "@/components/thread.aui";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { createChatAdapter } from "./chat-adapter";
import { InvestigationTool } from "./InvestigationTool";
import {
  UimaxAssistantMessage,
  UimaxComposer,
  UimaxUserMessage,
  UimaxWelcome,
} from "./uimax-assistant-thread";

type Conversation = { id: string; title: string };
type Config = { configured: boolean; hosted_mode: boolean; model: string };
const storageKey = "cross-examine-conversation";

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Unable to load assistant (${response.status})`);
  return response.json() as Promise<T>;
}

function ConversationThread({ id, messages, onFinish, compact, onExpand }: {
  id: string; messages: ThreadMessageLike[]; onFinish: () => void; compact?: boolean; onExpand?: () => void;
}) {
  const adapter = useMemo(() => createChatAdapter(id, onFinish), [id, onFinish]);
  const runtime = useLocalRuntime(adapter, { initialMessages: messages, maxSteps: 1 });
  return <AssistantRuntimeProvider runtime={runtime}>
    {compact ? <CompactAssistantBar onExpand={onExpand!} /> : <Thread components={{
      AssistantMessage: UimaxAssistantMessage,
      UserMessage: UimaxUserMessage,
      Composer: UimaxComposer,
      Welcome: UimaxWelcome,
      ToolFallback: InvestigationTool,
    }} />}
  </AssistantRuntimeProvider>;
}

export function AssistantPage({ embedded = false, compact = false, onClose, onExpand, onCollapse }: { embedded?: boolean; compact?: boolean; onClose?: () => void; onExpand?: () => void; onCollapse?: () => void }) {
  const [id, setId] = useState(() => localStorage.getItem(storageKey) ?? crypto.randomUUID());
  const [messages, setMessages] = useState<ThreadMessageLike[] | null>(null);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [threads, setThreads] = useState<Conversation[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [error, setError] = useState("");
  const refresh = useCallback(() => {
    void getJson<Conversation[]>("/api/chat/threads").then(setThreads).catch((e: Error) => setError(e.message));
  }, []);

  useEffect(() => {
    let active = true;
    setMessages(null);
    setError("");
    localStorage.setItem(storageKey, id);
    void Promise.all([
      getJson<{ messages: ThreadMessageLike[] }>(`/api/chat/threads/${encodeURIComponent(id)}`),
      getJson<Config>("/api/chat/config"),
    ]).then(([history, settings]) => {
      if (active) { setMessages(history.messages); setLoadedId(id); setConfig(settings); }
    }).catch((e: Error) => { if (active) setError(e.message); });
    refresh();
    return () => { active = false; };
  }, [id, refresh]);

  // Keep the host element stable so changing presentation retains the runtime.
  const Container = "section";
  const Heading = embedded ? "h2" : "h1";
  return (
    <Container role={embedded ? undefined : "main"} className={embedded ? "flex h-full min-h-0 min-w-0 flex-col text-fg" : "uimax-assistant flex h-dvh min-w-0 flex-col bg-bg text-fg"} aria-label="Cross-Examine assistant">
      {!compact && <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border px-4 py-3 md:px-6">
        {!embedded && <Button asChild variant="ghost" size="sm" className="md:hidden"><Link to="/">Home</Link></Button>}
        <div className="min-w-0 flex-1">
          <Heading className="font-heading text-lg font-semibold">Assistant</Heading>
          <p className={embedded ? "hidden text-xs text-muted-foreground sm:block" : "text-xs text-muted-foreground"}>{embedded ? "Here while you explore." : "Run an investigation. Follow the evidence."}</p>
        </div>
        <label className="sr-only" htmlFor="conversation">Saved conversations</label>
        <select id="conversation" className="max-w-28 rounded-xl border border-border bg-background p-2 text-xs" value={id} onChange={(e) => setId(e.target.value)}>
          {!threads.some((t) => t.id === id) && <option value={id}>New conversation</option>}
          {threads.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
        <Button aria-label="New chat" variant="outline" size="sm" className={embedded ? "size-8 p-0 sm:h-8 sm:w-auto sm:px-3" : undefined} onClick={() => setId(crypto.randomUUID())}>
          {embedded && <PlusIcon aria-hidden className="size-4 sm:hidden" />}
          <span className={embedded ? "sr-only sm:not-sr-only" : undefined}>New chat</span>
        </Button>
        {embedded && <button type="button" onClick={onClose} aria-label="Close assistant" className="assistant-island-close flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-fg-secondary transition-colors hover:bg-white/10 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9a7bff]"><XIcon className="size-4" /></button>}
        {onCollapse && <Button variant="ghost" size="icon" aria-label="Minimize assistant" title="Return to pill" onClick={onCollapse}><ArrowsInSimpleIcon className="size-4" /></Button>}
      </header>}
      {config && !embedded && <p className="border-b border-border px-4 py-2 text-xs text-muted-foreground md:px-6">
        {config.hosted_mode ? "Hosted evidence fixture · repository execution requires the local runner. " : "Local runner · use repositories you trust. "}
        {config.configured ? `AI configured · ${config.model}` : "Offline commands available · add OPENAI_API_KEY to .env.local and restart for AI chat."}
      </p>}
      {error && <ErrorMessage className="m-4" message={error} />}
      <div className={compact ? "flex h-full min-w-0 items-center justify-center" : "min-h-0 flex-1"}>
        {messages && loadedId === id ? <ConversationThread key={id} id={id} messages={messages} onFinish={refresh} compact={compact} onExpand={onExpand} /> : !error && <p role="status" className="p-6 text-sm">Loading conversation…</p>}
      </div>
      {!compact && <p className="px-4 pb-2 text-center text-[11px] text-muted-foreground">
        {embedded ? "Responses link to your saved evidence." : "AI text explains; evidence cards show saved execution results. Stopping a reply leaves submitted runs in Runs."}
      </p>}
    </Container>
  );
}
