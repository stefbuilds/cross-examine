"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CaretDownIcon, CheckIcon } from "@phosphor-icons/react/ssr";

import { cn } from "@/lib/utils";

/**
 * Dropdown that scales and un-blurs out of its trigger. The panel stays
 * mounted and toggles classes, so it animates on the way out as well as in —
 * unmounting would make closing a hard cut.
 */
export function SelectMenu({
  items,
  defaultIndex = 0,
  align = "start",
  icon,
  className,
  triggerClassName,
  panelClassName,
  onChange,
}: {
  items: string[];
  defaultIndex?: number;
  align?: "start" | "end";
  /** Rendered before the label inside the trigger. */
  icon?: React.ReactNode;
  className?: string;
  triggerClassName?: string;
  panelClassName?: string;
  onChange?: (index: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(defaultIndex);
  const root = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "interactive flex items-center gap-1 rounded-lg px-1.5 py-1 text-fg-secondary hover:bg-white/[0.06] hover:text-fg",
          triggerClassName,
        )}
      >
        {icon}
        <span>{items[index]}</span>
        <CaretDownIcon
          className={cn(
            "size-3.5 shrink-0 transition-transform ease-snap",
            open && "rotate-180",
          )}
          style={{ transitionDuration: "220ms" }}
        />
      </button>

      <div
        id={id}
        role="listbox"
        className={cn(
          "absolute z-30 mt-1.5 min-w-[8.5rem] rounded-xl border border-white/[0.07] fill-panel p-1 shadow-2xl shadow-black/60 transition duration-200 ease-snap",
          align === "end" ? "right-0 origin-top-right" : "left-0 origin-top-left",
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100 blur-0"
            : "pointer-events-none -translate-y-1 scale-95 opacity-0 blur-[3px]",
          panelClassName,
        )}
      >
        {items.map((item, i) => (
          <button
            key={item}
            type="button"
            role="option"
            aria-selected={i === index}
            onClick={() => {
              setIndex(i);
              setOpen(false);
              onChange?.(i);
            }}
            className="interactive flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-left text-fg-secondary hover:bg-white/[0.07] hover:text-fg"
          >
            <span>{item}</span>
            {i === index && <CheckIcon className="size-3.5 shrink-0 text-fg" />}
          </button>
        ))}
      </div>
    </div>
  );
}
