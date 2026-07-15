// Visual grammar adapted from OriginUI's 21st.dev theme-toggle dropdown.
import * as React from "react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import { Check, Monitor, Moon, Sun } from "lucide-react";

import { cn } from "@/lib/utils";

type ThemeName = "light" | "dark" | "system";

const options = {
  light: { label: "Light", icon: Sun },
  dark: { label: "Dark", icon: Moon },
  system: { label: "System", icon: Monitor },
} as const;

export function Theme({
  size = "sm",
  variant = "dropdown",
  themes = ["light", "dark", "system"],
  showLabel = false,
}: {
  size?: "sm" | "md" | "lg";
  variant?: "dropdown";
  themes?: ThemeName[];
  showLabel?: boolean;
}) {
  const [theme, setTheme] = React.useState<ThemeName>("light");
  const [systemTheme, setSystemTheme] = React.useState<"light" | "dark">("light");
  const displayedTheme = theme === "system" ? systemTheme : theme;
  const ActiveIcon = options[displayedTheme].icon;

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemTheme = () => setSystemTheme(media.matches ? "dark" : "light");
    updateSystemTheme();
    media.addEventListener("change", updateSystemTheme);
    return () => media.removeEventListener("change", updateSystemTheme);
  }, []);

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", displayedTheme === "dark");
  }, [displayedTheme]);

  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <button
          aria-label="Select theme"
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background text-foreground shadow-sm outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
            size === "sm" && "h-7 px-2 text-xs [&_svg]:size-3.5",
            size === "md" && "h-8 px-2.5 text-sm [&_svg]:size-4",
            size === "lg" && "h-9 px-3 text-sm [&_svg]:size-4",
          )}
          data-variant={variant}
          type="button"
        >
          <ActiveIcon aria-hidden="true" />
          {showLabel && <span>{options[theme].label}</span>}
        </button>
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align="start"
          className="z-50 min-w-32 overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg shadow-black/5 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          sideOffset={4}
        >
          {themes.map((option) => {
            const Icon = options[option].icon;
            return (
              <DropdownMenuPrimitive.Item
                key={option}
                className="relative flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                onSelect={() => setTheme(option)}
              >
                <Icon aria-hidden="true" className="size-4 opacity-60" />
                <span>{options[option].label}</span>
                {theme === option && <Check aria-hidden="true" className="ml-auto size-4" />}
              </DropdownMenuPrimitive.Item>
            );
          })}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}
