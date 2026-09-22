"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * A real, typable text field whose characters roll up out of a blur as they
 * land, behind a caret that glides between positions instead of jumping.
 *
 * The native input sits on top, transparent — it owns focus, selection and
 * keyboard behaviour — while a mirrored span layer underneath does the
 * animating. Character keys are `index-char`, so appending only mounts the
 * new character and the ones already on screen stay put.
 *
 * `defaultValue` is seeded demo text, not a value the reader chose, so it gets
 * out of the way on the first keystroke: whatever they type replaces the whole
 * seed, and a single backspace clears it rather than nibbling one character off
 * the end of a sentence they never wrote. After that the field is ordinary.
 */
export function TypingField({
  defaultValue = "",
  replaceDefaultOnEdit = true,
  placeholder = "",
  className,
  inputClassName,
  caretClassName,
  onValueChange,
  ...props
}: {
  defaultValue?: string;
  replaceDefaultOnEdit?: boolean;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  caretClassName?: string;
  onValueChange?: (value: string) => void;
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "defaultValue" | "placeholder" | "className" | "value" | "onChange"
>) {
  const [value, setValue] = useState(defaultValue);
  const [caret, setCaret] = useState(defaultValue.length);
  const [focused, setFocused] = useState(false);
  const [typing, setTyping] = useState(false);
  const [offset, setOffset] = useState(0);

  const measureRef = useRef<HTMLSpanElement>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  /* True until the reader's first edit, while the value is still the seed. */
  const seeded = useRef(replaceDefaultOnEdit && defaultValue.length > 0);

  /*
   * Measure the text preceding the caret so the caret can be positioned
   * absolutely — the only way to ease it between characters.
   *
   * Plus the wrapper's left padding, which is the caller's (`px-1` on the dock
   * bar) and is the difference between the two coordinate systems in play here:
   * an absolutely-positioned child starts at the *padding* box, while the text
   * it is measuring against starts at the *content* box. Without it the caret
   * sits a padding's width inside the text and lands on the last character.
   */
  useLayoutEffect(() => {
    const probe = measureRef.current;
    if (!probe) return;
    const pad = wrapRef.current
      ? parseFloat(getComputedStyle(wrapRef.current).paddingLeft) || 0
      : 0;
    setOffset(probe.offsetWidth + pad);
  }, [value, caret]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const sync = (el: HTMLInputElement) => setCaret(el.selectionStart ?? el.value.length);

  /**
   * What the reader just inserted, found by trimming the prefix and suffix the
   * two strings still share. Works for a keystroke, a paste, or a drop; returns
   * "" for a deletion, which is what makes one backspace clear the whole seed.
   */
  const inserted = (before: string, after: string) => {
    let head = 0;
    while (head < before.length && head < after.length && before[head] === after[head]) {
      head += 1;
    }
    let tail = 0;
    while (
      tail < before.length - head &&
      tail < after.length - head &&
      before[before.length - 1 - tail] === after[after.length - 1 - tail]
    ) {
      tail += 1;
    }
    return after.slice(head, after.length - tail);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let next = e.target.value;

    if (seeded.current) {
      seeded.current = false;
      next = inserted(value, next);
      /* The input is controlled, so React rewrites it on the next render; the
         caret has to be told where it landed because the browser put it at the
         end of a string that no longer exists. */
      setValue(next);
      setCaret(next.length);
      onValueChange?.(next);
      setTyping(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setTyping(false), 650);
      return;
    }

    setValue(next);
    sync(e.target);
    onValueChange?.(next);
    setTyping(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setTyping(false), 650);
  };

  return (
    <span ref={wrapRef} className={cn("relative block min-w-0", className)}>
      {/* Width probe for everything left of the caret. It repeats the mirror's
          one-span-per-character markup rather than measuring the string in a
          single run: separate inline boxes get no kerning between them, so a
          run measures narrower than the same text drawn character by character,
          and the caret drifts left by a fraction of a pixel per glyph. */}
      <span
        ref={measureRef}
        aria-hidden
        className="pointer-events-none invisible absolute left-0 top-0 whitespace-pre"
      >
        {value
          .slice(0, caret)
          .split("")
          .map((ch, i) => (
            <span key={`${i}-${ch}`}>{ch}</span>
          ))}
      </span>

      {/* Animated mirror of the value. */}
      <span aria-hidden className="pointer-events-none block truncate">
        {value
          ? value
              .split("")
              .map((ch, i) => (
                <span key={`${i}-${ch}`} className="roll-in">
                  {ch}
                </span>
              ))
          : <span className="text-fg-muted">{placeholder}</span>}
      </span>

      {/* Caret. Position eases; opacity breathes unless mid-keystroke. */}
      {focused && (
        <span
          aria-hidden
          data-typing={typing}
          style={{ transform: `translate(${offset}px, -50%)` }}
          className={cn(
            "caret-smooth pointer-events-none absolute left-0 top-1/2 h-[1.05em] w-px bg-fg",
            caretClassName,
          )}
        />
      )}

      <input
        {...props}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        onSelect={(e) => sync(e.currentTarget)}
        onKeyUp={(e) => sync(e.currentTarget)}
        onClick={(e) => sync(e.currentTarget)}
        onFocus={(e) => {
          setFocused(true);
          sync(e.currentTarget);
        }}
        onBlur={() => {
          setFocused(false);
          setTyping(false);
        }}
        className={cn(
          "absolute inset-0 w-full bg-transparent text-transparent caret-transparent outline-none placeholder:text-transparent",
          inputClassName,
        )}
      />
    </span>
  );
}
