/*
 * Cross-Examine adapter for the untouched UImaxxing Command Dock source.
 * The canonical registry component remains at components/uimaxxing/command-dock.tsx.
 * Product routing and the persistent expanding assistant live in this adapter.
 */
import React, { lazy, Suspense, useRef, useState } from "react";
import {
  ArrowsOutSimpleIcon,
  XIcon,
  PlusIcon,
} from "@phosphor-icons/react/ssr";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import { CommandDock as UpstreamCommandDock } from "@/components/uimaxxing/command-dock";
import { cn } from "@/lib/utils";
import { CirclesFourIcon, LogsIcon, PleromaIcon, TerminalIcon } from "./DockIcons";
import { JoinedPillSurface } from "./JoinedPillSurface";

const AssistantPanel = lazy(() => import("@/features/assistant/AssistantPage").then((module) => ({ default: module.AssistantPage })));

export { UpstreamCommandDock };

const PILL_GRADIENT =
  "radial-gradient(65% 90% at 52% 45%, rgba(139,161,255,0.55) 0%, rgba(139,161,255,0) 72%), linear-gradient(100deg, #ab9c8c 0%, #8395da 38%, #7b91e0 58%, #4c4d78 100%)";

type DockItemData = {
  end?: boolean;
  icon: React.ReactNode;
  label: string;
  to: string;
};

const itemsBeforeAction: DockItemData[] = [
  { end: true, icon: <PleromaIcon />, label: "Evidence", to: "/evidence" },
];

const itemsAfterAction: DockItemData[] = [
  { icon: <LogsIcon />, label: "Runs", to: "/runs" },
  { icon: <CirclesFourIcon />, label: "Trials", to: "/trials" },
];

function DockItem({ end, icon, label, to }: DockItemData) {
  const location = useLocation();
  const groupedActive = to === "/trials" && location.pathname.startsWith("/corpus");
  const isActive = groupedActive || location.pathname === to || (!end && location.pathname.startsWith(`${to}/`));
  return (
    <Link
      aria-label={label}
      aria-current={isActive ? "page" : undefined}
      className={
        cn(
          "interactive flex flex-col items-center gap-1.5",
          isActive || groupedActive ? "text-fg" : "text-fg-muted hover:text-fg-secondary",
        )
      }
      to={to}
    >
        <>
          {icon}
          <span className={cn("text-[10px] leading-none", isActive || groupedActive ? "font-semibold" : "font-medium")}>
            {label}
          </span>
          <span className={cn("size-[3px] rounded-full", isActive || groupedActive ? "bg-fg" : "bg-transparent")} />
        </>
    </Link>
  );
}

export function CrossExamineCommandDock() {
  const location = useLocation();
  const navigate = useNavigate();
  const [terminalActive, setTerminalActive] = useState(false);
  const fullPage = location.pathname === "/assistant";
  const [assistantOpen, setAssistantOpen] = useState(() => sessionStorage.getItem("cross-examine-assistant-open") === "true" || fullPage);
  const [assistantMounted, setAssistantMounted] = useState(assistantOpen);
  const assistantTrigger = useRef<HTMLButtonElement>(null);
  const assistantPanel = useRef<HTMLDivElement>(null);
  const returnPath = useRef("/evidence");
  const expandAssistant = () => {
    if (!fullPage) returnPath.current = location.pathname + location.search + location.hash;
    document.documentElement.dataset.assistantTransition = "expand";
    navigate("/assistant", { viewTransition: true });
  };
  const minimizeAssistant = () => {
    document.documentElement.dataset.assistantTransition = "minimize";
    setAssistantOpen(true);
    sessionStorage.setItem("cross-examine-assistant-open", "true");
    navigate(returnPath.current, { viewTransition: true });
  };
  const closeAssistant = () => {
    setAssistantOpen(false);
    sessionStorage.removeItem("cross-examine-assistant-open");
    assistantTrigger.current?.focus();
  };
  const openAssistant = () => {
    setAssistantMounted(true);
    setAssistantOpen(true);
    sessionStorage.setItem("cross-examine-assistant-open", "true");
    if (fullPage) minimizeAssistant();
    requestAnimationFrame(() => assistantPanel.current?.querySelector<HTMLInputElement>('[aria-label="Ask anything"]')?.focus({ preventScroll: true }));
  };

  return (
    <nav
      aria-label="Primary"
      className={fullPage ? "command-dock-dark assistant-page-host fixed inset-0 z-50" : "command-dock-dark assistant-island assistant-island-compact fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] -translate-x-1/2"}
      data-expanded={assistantOpen}
      onKeyDown={(event) => {
        if (event.key === "Escape" && assistantOpen && !event.defaultPrevented) {
          event.preventDefault();
          if (fullPage) minimizeAssistant(); else closeAssistant();
        }
      }}
    >
      <div className="assistant-island-shell w-full">
        {!fullPage && <JoinedPillSurface expanded={assistantOpen} />}
        <div className={fullPage ? "assistant-page-panel" : "assistant-island-panel"} aria-hidden={!assistantOpen && !fullPage} inert={!assistantOpen && !fullPage}>
          <div ref={assistantPanel} id="dock-assistant" role={fullPage ? undefined : "dialog"} aria-label="Assistant" aria-modal={fullPage ? undefined : "false"} className={fullPage ? "assistant-page-content" : "assistant-island-content"}>
            {assistantMounted && <Suspense fallback={<div role="status" className="p-6 text-sm text-fg-muted">Opening assistant…</div>}>
              <AssistantPanel embedded={!fullPage} compact={!fullPage} onClose={closeAssistant} onExpand={expandAssistant} onCollapse={fullPage ? minimizeAssistant : undefined} />
            </Suspense>}
            {!fullPage && <div className="compact-pill-actions">
              <button type="button" aria-label="Expand assistant" title="Open full assistant" onClick={expandAssistant}><ArrowsOutSimpleIcon className="size-4" /></button>
              <button type="button" aria-label="Close assistant" title="Close assistant" onClick={closeAssistant}><XIcon className="size-4" /></button>
            </div>}
          </div>
        </div>
        <div className="assistant-island-base p-3">
        <div className="assistant-island-actions mx-auto flex w-full max-w-sm items-center justify-between px-2 py-2 sm:px-5">
          {itemsBeforeAction.map((item) => <DockItem key={item.label} {...item} />)}
          <button
            ref={assistantTrigger}
            type="button"
            aria-label="Assistant"
            aria-expanded={assistantOpen}
            aria-controls="dock-assistant"
            aria-haspopup="dialog"
            onClick={openAssistant}
            onMouseEnter={() => setTerminalActive(true)}
            onMouseLeave={() => setTerminalActive(false)}
            onFocus={() => setTerminalActive(true)}
            onBlur={() => setTerminalActive(false)}
            className={cn("interactive flex flex-col items-center gap-1.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9a7bff]", assistantOpen ? "text-fg" : "text-fg-muted hover:text-fg-secondary")}
          >
            <TerminalIcon active={terminalActive} />
            <span className="text-[10px] font-medium leading-none">Assistant</span>
            <span className={cn("size-[3px] rounded-full transition-colors", assistantOpen ? "bg-[#9a7bff]" : "bg-transparent")} />
          </button>
          <NavLink
            aria-label="Verify"
            className="relative flex h-[52px] w-[82px] items-center justify-center sm:w-[104px]"
            to="/run"
          >
            <span
              aria-hidden
              className="absolute inset-0 rounded-full opacity-50 blur-lg"
              style={{ background: PILL_GRADIENT }}
            />
            <span
              className="relative flex size-full items-center justify-center rounded-full"
              style={{ background: PILL_GRADIENT }}
            >
              <PlusIcon className="size-5 text-black/85" weight="bold" />
            </span>
          </NavLink>
          {itemsAfterAction.map((item) => <DockItem key={item.label} {...item} />)}
        </div>
        </div>
      </div>
    </nav>
  );
}
