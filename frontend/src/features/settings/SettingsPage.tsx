import { Check, Monitor, Moon, Sun } from "lucide-react";

import type { ThemeName } from "@/lib/theme-preference";
import { useThemePreference } from "@/lib/theme-preference";
import { cn } from "@/lib/utils";

const themes: { icon: typeof Sun; label: string; value: ThemeName }[] = [
  { icon: Sun, label: "Light", value: "light" },
  { icon: Moon, label: "Dark", value: "dark" },
  { icon: Monitor, label: "System", value: "system" },
];

function ThemePreview({ value }: { value: ThemeName }) {
  const dark = value === "dark";
  return (
    <div className={cn("overflow-hidden rounded-t-[var(--radius-sm)] border border-b-0 p-3", dark ? "border-zinc-700 bg-zinc-950" : "border-zinc-200 bg-white")}>
      <div className="flex gap-2">
        <div className={cn("h-24 w-12 rounded-md", dark ? "bg-zinc-800" : "bg-[#ebe9e3]")} />
        <div className="flex-1 space-y-2 pt-1">
          <div className={cn("h-3 w-2/3 rounded-full", dark ? "bg-zinc-600" : "bg-zinc-300")} />
          <div className={cn("h-12 rounded-lg border", dark ? "border-zinc-700 bg-zinc-900" : "border-zinc-200 bg-white")} />
          <div className="h-2 w-1/2 rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const { resolved, setTheme, theme } = useThemePreference();

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Workspace preference</p>
          <h1 className="page-title mt-4">Interface settings</h1>
          <p className="page-copy mt-4">Choose how the evidence workspace follows your environment.</p>
        </div>
      </header>
      <section className="surface-frame p-5 md:p-7" aria-labelledby="theme-heading">
        <h2 className="text-lg font-semibold" id="theme-heading">Theme</h2>
        <p className="mt-1 text-sm text-muted-foreground">Choose your interface color theme.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3" role="radiogroup" aria-label="Theme">
          {themes.map(({ icon: Icon, label, value }) => {
            const selected = theme === value;
            return (
              <button
                aria-checked={selected}
                className={cn(
                  "group overflow-hidden rounded-[var(--radius)] border bg-card text-left shadow-sm outline-none transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring",
                  selected && "border-primary ring-2 ring-primary/30",
                )}
                key={value}
                onClick={() => setTheme(value)}
                role="radio"
                type="button"
              >
                <ThemePreview value={value === "system" ? resolved : value} />
                <span className="flex items-center gap-2 px-3 py-3 text-sm font-semibold">
                  <Icon aria-hidden="true" className="size-4" />
                  {label}
                  {selected && <Check aria-hidden="true" className="ml-auto size-4 text-primary" />}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
