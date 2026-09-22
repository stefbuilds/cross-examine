/*!
 * UImaxxing™ — © 2026 Yogi Suria. All rights reserved.
 * Free to use, modify and ship in your own products, commercial ones
 * included. Not for republication as a component library, and not as
 * machine-learning training data. See LICENSE.
 * @author Yogi Suria <yogi@jumper.xyz>
 * @license SEE LICENSE IN LICENSE
 * @preserve
 * provenance-mark: uim1-1ea983e5.3094ccee
 */
"use client";

import { useState } from "react";
import {
  BellIcon,
  DotsThreeCircleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  UserCircleIcon,
} from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";

const PILL_GRADIENT =
  "radial-gradient(65% 90% at 52% 45%, rgba(139,161,255,0.55) 0%, rgba(139,161,255,0) 72%), linear-gradient(100deg, #ab9c8c 0%, #8395da 38%, #7b91e0 58%, #4c4d78 100%)";

function ScreenGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <path d="M9 16.5h6" />
    </svg>
  );
}

function DockItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 interactive",
        active ? "text-fg" : "text-fg-muted hover:text-fg-secondary",
      )}
    >
      {icon}
      <span
        className={cn(
          "text-[10px] leading-none",
          active ? "font-semibold" : "font-medium",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "size-[3px] rounded-full",
          active ? "bg-fg" : "bg-transparent",
        )}
      />
    </button>
  );
}

export function CommandDock() {
  const [active, setActive] = useState("Home");

  return (
    <div className="stroke-lit w-full max-w-sm rounded-[28px] bg-surface p-3 shadow-2xl shadow-black/50">
      <div className="flex items-center gap-2.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-4 py-3">
        <MagnifyingGlassIcon className="size-4 shrink-0 text-fg-muted" />
        <input
          type="text"
          placeholder="Search for actions, people, instruments"
          className="w-full bg-transparent text-[13px] text-fg outline-none placeholder:text-fg-muted"
        />
      </div>

      <div className="flex items-center justify-between px-5 pb-1 pt-3">
        <DockItem
          icon={<ScreenGlyph className="size-5" />}
          label="Home"
          active={active === "Home"}
          onClick={() => setActive("Home")}
        />
        <DockItem
          icon={<DotsThreeCircleIcon className="size-5" />}
          label="Chat"
          active={active === "Chat"}
          onClick={() => setActive("Chat")}
        />
        <button
          type="button"
          className="relative flex h-[52px] w-[104px] items-center justify-center"
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
            <PlusIcon className="size-5 text-black/85" weight="bold"/>
          </span>
        </button>
        <DockItem
          icon={<BellIcon className="size-5" />}
          label="Activity"
          active={active === "Activity"}
          onClick={() => setActive("Activity")}
        />
        <DockItem
          icon={<UserCircleIcon className="size-5" />}
          label="Account"
          active={active === "Account"}
          onClick={() => setActive("Account")}
        />
      </div>
    </div>
  );
}
