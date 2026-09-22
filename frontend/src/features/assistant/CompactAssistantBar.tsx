/*! UImaxxing — © 2026 Yogi Suria. Free to use, modify and ship in products.
 * Adapted from https://uimaxx.ing/r/compact-ask-bar.json.
 * Visual structure, sheen, sizing, TypingField and GradientIconButton retained.
 * Product handlers connect the bar to the existing assistant runtime.
 */
import { PlusIcon, WaveformIcon } from "@phosphor-icons/react/ssr";
import { unstable_useComposerInput } from "@assistant-ui/react";
import { GradientIconButton } from "@/components/ui/gradient-button";
import { TypingField } from "@/components/ui/typing-field";

export function CompactAssistantBar({ onExpand }: { onExpand: () => void }) {
  const { value, setText, send, canSend, isDisabled } = unstable_useComposerInput();
  const submit = () => {
    if (canSend) send();
    onExpand();
  };
  return (
    <div className="relative flex h-12 w-full max-w-sm items-center rounded-full stroke-lit bg-surface shadow-[0_18px_40px_-16px_rgba(0,0,0,0.9)]">
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.06]" />
      <button type="button" aria-label="Open assistant tools" onClick={onExpand} className="hover-spin interactive ml-2.5 flex size-8 shrink-0 items-center justify-center rounded-full text-fg-secondary hover:bg-white/[0.06] hover:text-fg">
        <PlusIcon className="size-5" />
      </button>
      <TypingField defaultValue={value} replaceDefaultOnEdit={false} onValueChange={setText} disabled={isDisabled} placeholder="Ask anything..." aria-label="Ask anything" className="ml-3 min-w-0 flex-1 text-[15px] text-fg" onKeyDown={(event) => {
        if (event.key === "Enter" && canSend) { event.preventDefault(); submit(); }
      }} />
      <GradientIconButton aria-label={canSend ? "Send message" : "Open assistant"} onClick={submit} className="interactive mr-1.5 size-9 shrink-0 hover:scale-105">
        <WaveformIcon className="size-4 text-on-brand" weight="bold" />
      </GradientIconButton>
    </div>
  );
}
