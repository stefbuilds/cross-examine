// Imported from arunjdass/dashboard-sidebar on 21st.dev.
// Content, semantic links, and reference-site theme are project adaptations.
import type React from "react";
import { Blocks, FlaskConical, Info, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";

type NavItemData = {
  id: string;
  title: string;
  icon: React.ElementType;
  href: string;
};

const items: NavItemData[] = [
  { id: "evidence", title: "Evidence catch", icon: FlaskConical, href: "/" },
  { id: "run", title: "Run locally", icon: FlaskConical, href: "/run" },
  { id: "trials", title: "Trials", icon: FlaskConical, href: "/trials" },
  { id: "runs", title: "Runs", icon: LayoutDashboard, href: "/runs" },
  { id: "corpus", title: "Corpus", icon: Blocks, href: "/corpus" },
  { id: "about", title: "About", icon: Info, href: "/about" },
];

export function SidebarNav({
  activeId = "evidence",
  className = "",
  onSelect = () => undefined,
}: {
  activeId?: string;
  className?: string;
  onSelect?: (id: string) => void;
  activeWorkspace?: string;
}) {
  return (
    <div className={`flex h-full w-[276px] flex-col border-r border-sidebar-border bg-sidebar p-4 ${className}`}>
      <Link className="group mb-8 flex items-center gap-3 px-1 py-2" onClick={() => onSelect("evidence")} to="/">
        <span className="grid size-11 place-items-center rounded-xl bg-foreground font-heading text-lg font-semibold text-background shadow-[4px_4px_0_#7f76ca] transition-transform group-hover:-translate-y-0.5">X_</span>
        <span className="grid gap-0.5">
          <span className="font-heading text-base font-semibold uppercase leading-none tracking-[-0.03em]">Cross—Examine</span>
          <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Independent evidence</span>
        </span>
      </Link>

      <p className="mb-2 px-3 font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Workspace</p>
      <div className="flex flex-col gap-1">
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <Link
              className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all ${active ? "bg-primary font-semibold text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-white/70 hover:text-foreground"}`}
              key={item.id}
              onClick={() => onSelect(item.id)}
              to={item.href}
            >
              <item.icon aria-hidden="true" className="size-4" strokeWidth={active ? 2.25 : 1.75} />
              {item.title}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto rounded-2xl border border-primary/20 bg-primary/10 p-4">
        <p className="font-heading text-xs font-semibold uppercase tracking-[0.12em]">Evidence, not confidence</p>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">Every verdict opens to the grounded receipt that earned it.</p>
      </div>
    </div>
  );
}
