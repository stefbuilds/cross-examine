// Primary workspace navigation.
// Cross-Examine keeps the hover-expansion motion while presenting a clear
// hierarchy: header, a prominent New Run action, the main navigation, then an
// anchored secondary area with onboarding, workspace identity, and settings.
import type React from "react";
import { motion } from "framer-motion";
import { Blocks, ChevronDown, FlaskConical, LayoutDashboard, PanelLeft, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { SidebarHelpBanner } from "@/components/ui/sidebar-help-banner";
import { WorkspaceProfile } from "@/components/ui/workspace-profile";
import { cn } from "@/lib/utils";

const sidebarVariants = {
  open: { width: "15rem" },
  closed: { width: "3.05rem" },
};

const contentVariants = {
  open: { display: "flex", opacity: 1 },
  closed: { display: "flex", opacity: 1 },
};

const variants = {
  open: {
    x: 0,
    opacity: 1,
    transition: { x: { stiffness: 1000, velocity: -100 } },
  },
  closed: {
    x: -20,
    opacity: 0,
    transition: { x: { stiffness: 100 } },
  },
};

const transitionProps = {
  type: "tween" as const,
  ease: "easeOut" as const,
  duration: 0.2,
  staggerChildren: 0.1,
};

const staggerVariants = {
  open: { transition: { staggerChildren: 0.03, delayChildren: 0.02 } },
};

type NavItemData = {
  id: string;
  title: string;
  icon: React.ElementType;
  href: string;
};

const items: NavItemData[] = [
  { id: "trials", title: "Trials", icon: FlaskConical, href: "/trials" },
  { id: "corpus", title: "Corpus", icon: Blocks, href: "/corpus" },
];

const navItemClass =
  "flex h-8 items-center gap-2 rounded-md px-2 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar";

const subItemClass =
  "flex h-7 items-center rounded-md px-2 text-[0.8125rem] font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar";

export function SessionNavBar({
  activeId = "evidence",
  className,
  onSelect = () => undefined,
  onCollapsedChange,
}: {
  activeId?: string;
  className?: string;
  onSelect?: (id: string) => void;
  activeWorkspace?: string;
  onCollapsedChange?: (collapsed: boolean) => void;
}) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(
    () => typeof window === "undefined" || window.innerWidth >= 768,
  );
  const [runsOpen, setRunsOpen] = useState(activeId === "runs");

  useEffect(() => {
    if (activeId === "runs") setRunsOpen(true);
  }, [activeId]);

  const setCollapsed = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    onCollapsedChange?.(collapsed);
  };

  const runsActive = activeId === "runs";
  const viewRunsActive = runsActive && location.pathname.startsWith("/runs");
  const runLocallyActive =
    runsActive && location.pathname.startsWith("/run") && !location.pathname.startsWith("/runs");

  return (
    <motion.div
      animate={isCollapsed ? "closed" : "open"}
      className={cn("sidebar relative z-40 h-full shrink-0 border-r border-sidebar-border", className)}
      initial={isCollapsed ? "closed" : "open"}
      onMouseEnter={() => {
        if (window.innerWidth >= 768) setCollapsed(false);
      }}
      onMouseLeave={() => {
        if (window.innerWidth >= 768) setCollapsed(true);
      }}
      transition={transitionProps}
      variants={sidebarVariants}
    >
      <motion.div
        className="relative z-40 flex h-full shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-all"
        variants={contentVariants}
      >
        {/* Header */}
        <div className="flex h-[54px] w-full shrink-0 items-center gap-2 border-b border-sidebar-border px-2">
          <Link
            aria-label="Cross-Examine home"
            className={cn(
              "min-w-0 items-center gap-2 rounded-md px-1 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
              isCollapsed ? "hidden" : "flex",
            )}
            onClick={() => onSelect("evidence")}
            to="/"
          >
            <span aria-hidden="true" className="grid size-5 shrink-0 place-items-center rounded bg-primary font-heading text-[9px] font-bold text-primary-foreground">
              X_
            </span>
            <motion.span className="flex w-fit items-center" variants={variants}>
              {!isCollapsed && <span className="truncate text-sm font-semibold">Cross-Examine</span>}
            </motion.span>
          </Link>
          <button
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground outline-none transition hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
              isCollapsed ? "mx-auto" : "ml-auto",
            )}
            onClick={() => setCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            type="button"
          >
            <PanelLeft aria-hidden="true" className="size-4" />
          </button>
        </div>

        {/* Primary action */}
        <div className="shrink-0 p-2">
          <Link
            aria-label="New Run"
            className={cn(
              "flex h-9 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm outline-none transition hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
              isCollapsed ? "mx-auto size-9" : "w-full",
            )}
            onClick={() => onSelect("run")}
            title={isCollapsed ? "New Run" : undefined}
            to="/run"
          >
            <Plus aria-hidden="true" className="size-4 shrink-0" strokeWidth={2.25} />
            {!isCollapsed && <span>New Run</span>}
          </Link>
        </div>

        {/* Main navigation */}
        <motion.ul
          className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-2 pb-2"
          data-testid="sidebar-navigation"
          variants={staggerVariants}
        >
          {items.map((item) => {
            const active = item.id === activeId;
            const Icon = item.icon;
            return (
              <motion.li key={item.id}>
                <Link
                  aria-current={active ? "page" : undefined}
                  aria-label={item.title}
                  className={cn(
                    navItemClass,
                    isCollapsed && "justify-center px-0",
                    active
                      ? "bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  onClick={() => onSelect(item.id)}
                  title={isCollapsed ? item.title : undefined}
                  to={item.href}
                >
                  <Icon
                    aria-hidden="true"
                    className={cn("size-4 shrink-0", active && "text-primary")}
                    strokeWidth={active ? 2 : 1.75}
                  />
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              </motion.li>
            );
          })}

          {/* Runs: clicking navigates to the default runs view; the chevron reveals specifics */}
          <motion.li>
            <div
              className={cn(
                "flex items-center rounded-md",
                isCollapsed && "justify-center",
                runsActive ? "bg-primary/10" : "hover:bg-muted",
              )}
            >
              <Link
                aria-current={runsActive ? "page" : undefined}
                aria-label="Runs"
                className={cn(
                  navItemClass,
                  "flex-1 bg-transparent hover:bg-transparent",
                  isCollapsed && "justify-center px-0",
                  runsActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
                onClick={() => onSelect("runs")}
                title={isCollapsed ? "Runs" : undefined}
                to="/runs"
              >
                <LayoutDashboard
                  aria-hidden="true"
                  className={cn("size-4 shrink-0", runsActive && "text-primary")}
                  strokeWidth={runsActive ? 2 : 1.75}
                />
                {!isCollapsed && <span>Runs</span>}
              </Link>
              {!isCollapsed && (
                <button
                  aria-expanded={runsOpen}
                  aria-label={runsOpen ? "Collapse runs" : "Expand runs"}
                  className="mr-1 grid size-6 shrink-0 place-items-center rounded text-muted-foreground outline-none transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
                  onClick={() => setRunsOpen((open) => !open)}
                  type="button"
                >
                  <ChevronDown
                    aria-hidden="true"
                    className={cn("size-4 transition-transform duration-200", runsOpen && "rotate-180")}
                  />
                </button>
              )}
            </div>
            {!isCollapsed && (
              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-200 ease-out",
                  runsOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="overflow-hidden">
                  <div className="mt-0.5 flex flex-col gap-0.5 pl-8">
                    <Link
                      aria-current={viewRunsActive ? "page" : undefined}
                      className={cn(
                        subItemClass,
                        viewRunsActive
                          ? "text-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                      onClick={() => onSelect("runs")}
                      to="/runs"
                    >
                      View runs
                    </Link>
                    <Link
                      aria-current={runLocallyActive ? "page" : undefined}
                      className={cn(
                        subItemClass,
                        runLocallyActive
                          ? "text-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                      onClick={() => onSelect("runs")}
                      to="/run"
                    >
                      Run locally
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </motion.li>
        </motion.ul>

        {/* Secondary area, anchored to the bottom */}
        <div className="flex shrink-0 flex-col gap-2 border-t border-sidebar-border p-2">
          {!isCollapsed && <SidebarHelpBanner onOpen={() => onSelect("run")} />}
          <WorkspaceProfile
            collapsed={isCollapsed}
            onSelect={onSelect}
            settingsActive={activeId === "settings"}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
