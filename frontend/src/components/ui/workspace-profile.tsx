// Account / workspace identity plus the secondary Settings and appearance controls.
// A clearly labelled workspace row, so it no longer reads as an ambiguous
// profile or shortcut control.
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Theme } from "@/components/ui/theme-dropdown";
import { Settings } from "lucide-react";
import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";

type WorkspaceProfileProps = {
  collapsed?: boolean;
  settingsActive?: boolean;
  onSelect?: (id: string) => void;
};

export function WorkspaceProfile({ collapsed = false, settingsActive = false, onSelect }: WorkspaceProfileProps) {
  return (
    <div className="flex flex-col gap-1">
      <div
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1.5",
          collapsed && "justify-center px-0",
        )}
      >
        <Avatar className="size-7 shrink-0 rounded-md">
          <AvatarFallback className="rounded-md bg-primary/15 text-[11px] font-semibold text-primary">
            CE
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-foreground">Cross-Examine</span>
            <span className="block truncate text-xs text-muted-foreground">Local workspace</span>
          </span>
        )}
      </div>

      <div className={cn("flex items-center gap-1", collapsed ? "flex-col" : "justify-between")}>
        <Link
          aria-current={settingsActive ? "page" : undefined}
          aria-label="Settings"
          className={cn(
            "flex h-8 items-center gap-2 rounded-md px-2 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
            collapsed ? "w-8 justify-center px-0" : "flex-1",
            settingsActive
              ? "bg-primary/10 text-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
          onClick={() => onSelect?.("settings")}
          title={collapsed ? "Settings" : undefined}
          to="/settings"
        >
          <Settings
            aria-hidden="true"
            className={cn("size-4 shrink-0", settingsActive && "text-primary")}
            strokeWidth={settingsActive ? 2 : 1.75}
          />
          {!collapsed && <span>Settings</span>}
        </Link>
        <Theme size="sm" variant="dropdown" themes={["light", "dark", "system"]} />
      </div>
    </div>
  );
}
