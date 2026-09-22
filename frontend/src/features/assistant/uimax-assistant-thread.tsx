import type { FC } from "react";
import {
  ActionBarPrimitive,
  AuiIf,
  ComposerPrimitive,
  MessagePrimitive,
  type TextMessagePartComponent,
  unstable_useComposerInput,
  useAuiState,
} from "@assistant-ui/react";
import {
  CheckIcon,
  CopyIcon,
  FileTextIcon,
  MicrophoneIcon,
  NavigationArrowIcon,
  PlusIcon,
  SparkleIcon,
  SquareIcon,
} from "@phosphor-icons/react/ssr";

import { ComposerAttachments } from "@/components/attachment.aui";
import { MarkdownText } from "@/components/markdown-text";
import LoadingState from "@/components/loading-state";
import { GradientIconButton } from "@/components/ui/gradient-button";
import { SelectMenu } from "@/components/ui/select-menu";
import { TypingField } from "@/components/ui/typing-field";
import { cn } from "@/lib/utils";

import { InvestigationTool } from "./InvestigationTool";

const chipClass =
  "interactive flex h-8 shrink-0 items-center gap-1.5 rounded-pill border border-white/[0.07] bg-surface px-3 text-xs text-fg hover:border-white/[0.16] hover:bg-white/[0.04] hover:text-fg";

export const UimaxWelcome: FC = () => (
  <div className="uimax-welcome mx-auto mb-5 w-full max-w-xl px-2 text-fg">
    <p className="animate-in fade-in slide-in-from-bottom-1 text-2xl font-medium tracking-tight duration-200">
      What should we cross-examine?
    </p>
    <p className="mt-3 max-w-lg text-sm leading-6 text-fg-secondary">
      Paste a public Python GitHub PR, give me a repository with base and head refs, or run the offline hero demo.
    </p>
  </div>
);

export const UimaxComposer: FC<{ autoFocus: boolean }> = ({ autoFocus }) => {
  const { value, setText, send, canSend, isDisabled } = unstable_useComposerInput();
  const isRunning = useAuiState((state) => state.thread.isRunning);
  const messageCount = useAuiState((state) => state.thread.messages.length);

  return (
    <ComposerPrimitive.Root className="relative mx-auto w-full max-w-[400px]">
      <div aria-hidden className="animate-drift pointer-events-none absolute inset-0">
        <div className="absolute -top-4 left-0 h-14 w-[62%] rounded-full bg-[#ff8f76] opacity-[0.12] blur-xl" />
        <div className="absolute -bottom-4 left-[6%] h-12 w-[52%] rounded-full bg-[#ff7684] opacity-[0.08] blur-xl" />
        <div className="absolute -bottom-5 right-[4%] h-14 w-[48%] rounded-full bg-accent-violet opacity-30 blur-xl" />
        <div className="absolute -inset-[3px] rounded-[25px] bg-[linear-gradient(115deg,rgba(255,143,118,0.3),rgba(255,118,132,0.18)_28%,rgba(154,123,255,0.42)_55%,rgba(91,141,238,0.3)_78%,transparent_96%)] blur-[8px]" />
      </div>

      <ComposerPrimitive.AttachmentDropzone asChild>
        <div className="stroke-aurora-tr relative rounded-[22px] bg-[linear-gradient(180deg,var(--color-frame)_0%,var(--color-stage-2)_45%,var(--color-well)_100%)] px-3.5 pb-3 pt-4 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)]">
          <ComposerAttachments />
          <TypingField
            key={messageCount}
            defaultValue={value}
            replaceDefaultOnEdit={false}
            onValueChange={setText}
            placeholder="Ask Cross-Examine…"
            aria-label="Message input"
            autoFocus={autoFocus}
            disabled={isDisabled}
            className="px-1 text-sm leading-5 text-fg-muted"
            inputClassName="min-h-6"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && canSend) {
                event.preventDefault();
                send();
              }
            }}
          />

          <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
            <AuiIf condition={(state) => state.thread.capabilities.attachments}>
              <ComposerPrimitive.AddAttachment asChild>
                <button type="button" aria-label="Add attachment" className="hover-spin interactive flex size-8 shrink-0 items-center justify-center rounded-full border border-white/[0.07] bg-surface text-fg-secondary hover:border-white/[0.16] hover:text-fg">
                  <PlusIcon className="size-4" />
                </button>
              </ComposerPrimitive.AddAttachment>
            </AuiIf>

            <SelectMenu
              items={["Investigate", "Explain", "Inspect"]}
              className="shrink-0"
              triggerClassName={chipClass}
              panelClassName="text-xs"
              icon={<SparkleIcon className="size-3.5 shrink-0 text-fg-secondary" />}
            />
            <SelectMenu
              items={["Python PR", "Saved run", "Corpus"]}
              className="uimax-context-chip hidden shrink-0 sm:block"
              triggerClassName={chipClass}
              panelClassName="text-xs"
              icon={<FileTextIcon className="size-3.5 shrink-0 text-fg-secondary" />}
            />

            <div className="min-w-2 flex-1" />
            <AuiIf condition={(state) => state.thread.capabilities.dictation}>
              <AuiIf condition={(state) => state.composer.dictation == null}>
                <ComposerPrimitive.Dictate asChild>
                  <button type="button" className={chipClass} aria-label="Start voice input">
                    <MicrophoneIcon className="size-3.5 text-fg-secondary" /> Talk
                  </button>
                </ComposerPrimitive.Dictate>
              </AuiIf>
            </AuiIf>

            {isRunning ? (
              <ComposerPrimitive.Cancel asChild>
                <GradientIconButton aria-label="Stop generating" className="hover-nudge interactive size-8 text-black shadow-[0_0_24px_-6px_rgba(139,123,255,0.7)] hover:scale-105">
                  <SquareIcon className="size-3 fill-current" weight="fill" />
                </GradientIconButton>
              </ComposerPrimitive.Cancel>
            ) : (
              <GradientIconButton
                aria-label="Send message"
                disabled={!canSend}
                onClick={() => send()}
                className={cn(
                  "hover-nudge interactive size-8 text-black shadow-[0_0_24px_-6px_rgba(139,123,255,0.7)] hover:scale-105",
                  !canSend && "cursor-not-allowed opacity-40 hover:scale-100",
                )}
              >
                <NavigationArrowIcon className="size-3.5 rotate-[18deg] fill-current" weight="light" />
              </GradientIconButton>
            )}
          </div>
        </div>
      </ComposerPrimitive.AttachmentDropzone>
    </ComposerPrimitive.Root>
  );
};

const UimaxMarkdown: TextMessagePartComponent = () => <MarkdownText />;

export const UimaxAssistantMessage: FC = () => {
  const isRunning = useAuiState((state) => state.message.status?.type === "running");
  return (
    <MessagePrimitive.Root className="animate-in fade-in slide-in-from-bottom-1 rounded-2xl bg-well px-5 py-4 text-[13px] leading-relaxed text-fg shadow-[0_24px_70px_-30px_rgba(0,0,0,0.9)] duration-200">
      {isRunning && <LoadingState label="Thinking" variant="Dots" />}
      <MessagePrimitive.Parts components={{ Text: UimaxMarkdown, tools: { Override: InvestigationTool } }} />
      {isRunning && <span aria-label="Assistant is responding" role="status" className="ml-1 inline-block h-3.5 w-[1.5px] translate-y-0.5 animate-blink bg-accent-peach" />}
      <ActionBarPrimitive.Root hideWhenRunning autohide="not-last" className="mt-4 flex items-center gap-3 text-fg-muted">
        <ActionBarPrimitive.Copy asChild>
          <button type="button" aria-label="Copy response" className="interactive hover:text-fg-secondary">
            <AuiIf condition={(state) => state.message.isCopied}><CheckIcon className="size-3" /></AuiIf>
            <AuiIf condition={(state) => !state.message.isCopied}><CopyIcon className="size-3" /></AuiIf>
          </button>
        </ActionBarPrimitive.Copy>
      </ActionBarPrimitive.Root>
    </MessagePrimitive.Root>
  );
};

export const UimaxUserMessage: FC = () => (
  <MessagePrimitive.Root className="animate-in fade-in slide-in-from-bottom-1 flex flex-col items-end px-1 duration-200">
    <span className="mb-1.5 pr-1 text-[11px] text-fg-muted">You</span>
    <div className="relative max-w-[82%]">
      <div aria-hidden className="pointer-events-none absolute -bottom-[3px] -left-[3px] -top-px right-2 rounded-[14px] bg-[radial-gradient(55%_65%_at_0%_50%,#4a3030,rgba(74,48,48,0)_72%),radial-gradient(45%_55%_at_5%_100%,#473b4f,rgba(71,59,79,0)_72%),radial-gradient(40%_45%_at_8%_0%,#403647,rgba(64,54,71,0)_70%)] blur-[3px]" />
      <div className="relative rounded-xl bg-surface px-4 py-3 text-sm text-fg">
        <MessagePrimitive.Parts />
      </div>
    </div>
  </MessagePrimitive.Root>
);
