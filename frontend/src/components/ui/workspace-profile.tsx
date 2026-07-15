// Visual grammar adapted from the user-supplied 21st.dev WithAvatar component.
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Theme } from "@/components/ui/theme-dropdown";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { BookOpenCheck, FlaskConical, FolderCheck, History, Info, Library } from "lucide-react";
import { Link } from "react-router-dom";

type WorkspaceProfileProps = {
  onSelect?: (id: string) => void;
};

export function WorkspaceProfile({ onSelect }: WorkspaceProfileProps) {
  return (
    <div className="px-2 pb-2">
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <button
            aria-label="Workspace shortcuts"
            className="flex w-full items-center gap-2 rounded-md p-2 text-left text-xs outline-none transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
            type="button"
          >
            <Avatar>
              <AvatarFallback>CE</AvatarFallback>
            </Avatar>
            <span className="min-w-0">
              <span className="block truncate font-medium text-foreground">Cross-Examine</span>
              <span className="block truncate text-muted-foreground">Right-click for shortcuts</span>
            </span>
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent aria-label="Workspace shortcuts" className="w-64">
        <ContextMenuItem asChild>
          <Link className="flex items-center" onClick={() => onSelect?.("evidence")} to="/">
            <FlaskConical className="mr-2 size-4" /> Evidence catch
          </Link>
        </ContextMenuItem>
        <ContextMenuItem asChild>
          <Link className="flex items-center" onClick={() => onSelect?.("run")} to="/run">
            <BookOpenCheck className="mr-2 size-4" /> New verification run
          </Link>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem asChild>
          <Link className="flex items-center" onClick={() => onSelect?.("runs")} to="/runs">
            <History className="mr-2 size-4" /> View runs
          </Link>
        </ContextMenuItem>
        <ContextMenuItem asChild>
          <Link className="flex items-center" onClick={() => onSelect?.("corpus")} to="/corpus">
            <Library className="mr-2 size-4" /> Review corpus
          </Link>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem asChild>
          <Link className="flex items-center" onClick={() => onSelect?.("trials")} to="/trials">
            <FolderCheck className="mr-2 size-4" /> Review trials
          </Link>
        </ContextMenuItem>
        <ContextMenuItem asChild>
          <Link className="flex items-center" onClick={() => onSelect?.("about")} to="/about">
            <Info className="mr-2 size-4" /> How it works
          </Link>
        </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <div className="mt-2 flex items-center justify-between border-t border-sidebar-border pt-2">
        <span className="text-xs font-medium text-muted-foreground">Settings</span>
        <Theme size="sm" variant="dropdown" themes={["light", "dark", "system"]} />
      </div>
    </div>
  );
}
