import { Blocks, FlaskConical, History, Home, Library, Play, Search, Settings } from "lucide-react";
import * as React from "react";
import { useNavigate } from "react-router-dom";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

const destinations = [
  { icon: Home, label: "Evidence catch", path: "/" },
  { icon: Play, label: "Run locally", path: "/run" },
  { icon: History, label: "Run history", path: "/runs" },
  { icon: Library, label: "Behavioral corpus", path: "/corpus" },
  { icon: FlaskConical, label: "Compatibility trials", path: "/trials" },
  { icon: Settings, label: "Interface settings", path: "/settings" },
] as const;

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <>
      <button
        aria-label="Search and commands"
        className="inline-flex h-9 items-center gap-2 rounded-[var(--radius-sm)] border bg-background px-3 text-xs text-muted-foreground shadow-sm transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Search aria-hidden="true" className="size-3.5" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="ml-2 hidden rounded border bg-muted px-1.5 font-mono text-[10px] sm:inline">⌘K</kbd>
      </button>
      <CommandDialog onOpenChange={setOpen} open={open}>
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty>No matching route or action.</CommandEmpty>
          <CommandGroup heading="Navigate">
            {destinations.map(({ icon: Icon, label, path }) => (
              <CommandItem key={path} onSelect={() => go(path)} value={`${label} ${path}`}>
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Quick start">
            <CommandItem onSelect={() => go("/run")}>
              <Blocks aria-hidden="true" />
              <span>Cross-examine a Python change</span>
              <CommandShortcut>↵</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
