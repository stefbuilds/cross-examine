// Imported from ibelick/code-block on 21st.dev; copy action follows its header demo.
import { Check, Copy } from "lucide-react";
import { useState, type HTMLProps, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CodeBlock({ className, ...props }: HTMLProps<HTMLDivElement>) { return <div className={cn("not-prose flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-[#111111] text-white", className)} {...props} />; }
export function CodeBlockGroup({ className, ...props }: HTMLProps<HTMLDivElement>) { return <div className={cn("flex items-center justify-between", className)} {...props} />; }

export function CodeBlockCode({ code, className }: { code: string; className?: string }) {
  return <div className={cn("w-full overflow-x-auto text-[13px] leading-6", className)}><pre className="px-4 py-4"><code>{code}</code></pre></div>;
}

export function EvidenceCodeBlock({ code, label }: { code: string; label: ReactNode }) {
  const [copied, setCopied] = useState(false);
  async function copy() { await navigator.clipboard.writeText(code); setCopied(true); window.setTimeout(() => setCopied(false), 2000); }
  return (
    <CodeBlock data-language="bash">
      <CodeBlockGroup className="border-b border-white/10 py-2 pl-4 pr-2">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">{label}</span>
        <Button aria-label={`Copy ${String(label)}`} className="text-white hover:bg-white/10 hover:text-white" onClick={copy} size="icon-sm" variant="ghost">{copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}</Button>
      </CodeBlockGroup>
      <CodeBlockCode code={code} />
    </CodeBlock>
  );
}
