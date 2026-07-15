// Visual grammar imported from andrewlu0/sidebar on 21st.dev.
// Cross-Examine keeps the hover-expansion motion while replacing demo content
// with product routes, React Router navigation, and accessible link semantics.
import type React from "react";
import { motion } from "framer-motion";
import { Blocks, FlaskConical, LayoutDashboard, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { News, type NewsArticle } from "@/components/ui/sidebar-news";
import { WorkspaceProfile } from "@/components/ui/workspace-profile";
import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@/components/ui/coss-accordion";
import { cn } from "@/lib/utils";

const sidebarVariants = {
  open: { width: "15rem" },
  closed: { width: "3.05rem" },
};

const contentVariants = {
  open: { display: "block", opacity: 1 },
  closed: { display: "block", opacity: 1 },
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

const productUseArticles: NewsArticle[] = [
  {
    href: "/run",
    title: "Run a local verification",
    summary: "Paste a Python repository and PR refs, then let the five-stage harness run.",
    image: "Run",
    navId: "run",
  },
  {
    href: "/fixtures/broken",
    title: "Inspect the evidence",
    summary: "Review exact commands, outputs, repro input, and the refuted behavior.",
    image: "Proof",
    navId: "runs",
  },
  {
    href: "/trials",
    title: "Review real trials",
    summary: "See the documented compatibility trials that back the Build Week demo.",
    image: "Trials",
    navId: "trials",
  },
];

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
        <div className="flex h-[54px] w-full shrink-0 items-center border-b border-sidebar-border p-2">
          <Link
            aria-label="Cross-Examine home"
            className={cn(
              "items-center gap-2 rounded-md px-2 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
              isCollapsed ? "hidden" : "flex",
            )}
            onClick={() => onSelect("evidence")}
            to="/"
          >
            <span aria-hidden="true" className="grid size-4 place-items-center rounded bg-primary font-heading text-[9px] font-bold text-primary-foreground">X_</span>
            <motion.span className="flex w-fit items-center" variants={variants}>
              {!isCollapsed && <span className="text-sm font-medium">Cross-Examine</span>}
            </motion.span>
          </Link>
          <button
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "ml-auto grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground outline-none transition hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
              isCollapsed && "mx-auto",
            )}
            onClick={() => setCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            type="button"
          >
            {isCollapsed ? (
              <PanelLeftOpen aria-hidden="true" className="size-4" />
            ) : (
              <PanelLeftClose aria-hidden="true" className="size-4" />
            )}
          </button>
        </div>

        <motion.ul className="flex min-h-0 flex-1 flex-col p-2" variants={staggerVariants}>
          <li className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <motion.span variants={variants}>{!isCollapsed && "Workspace"}</motion.span>
          </li>
          <li className="min-h-0 flex-1 overflow-y-auto" data-testid="sidebar-navigation">
            <ul className="flex flex-col gap-1">
            {items.map((item) => {
              const active = item.id === activeId;
              const Icon = item.icon;
              return (
                <motion.li key={item.id} variants={variants}>
                  <Link
                    aria-current={active ? "page" : undefined}
                    aria-label={item.title}
                    className={cn(
                      "flex w-full items-center text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                      "h-8 rounded-md px-2 py-1.5",
                      active
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                    onClick={() => onSelect(item.id)}
                    title={isCollapsed ? item.title : undefined}
                    to={item.href}
                  >
                    <Icon aria-hidden="true" className="size-4 shrink-0" strokeWidth={active ? 2.25 : 1.75} />
                    {!isCollapsed && <span className="ml-2">{item.title}</span>}
                  </Link>
                </motion.li>
              );
            })}
            <motion.li variants={variants}>
              <Accordion
                onValueChange={(value) => setRunsOpen(value.includes("runs"))}
                value={!isCollapsed && runsOpen ? ["runs"] : []}
              >
                <AccordionItem value="runs">
                  <AccordionTrigger
                    aria-label="Runs"
                    className={cn(
                      "text-muted-foreground",
                      activeId === "runs" && "bg-primary/15 text-primary",
                      isCollapsed && "justify-center px-0",
                    )}
                    title={isCollapsed ? "Runs" : undefined}
                  >
                    <span className="flex items-center">
                      <LayoutDashboard aria-hidden="true" className="size-4 shrink-0" strokeWidth={activeId === "runs" ? 2.25 : 1.75} />
                      {!isCollapsed && <span className="ml-2">Runs</span>}
                    </span>
                  </AccordionTrigger>
                  <AccordionPanel>
                    <div className="ml-3 flex flex-col gap-1 border-l border-sidebar-border pl-2">
                      <Link
                        aria-current={activeId === "runs" && location.pathname.startsWith("/runs") ? "page" : undefined}
                        className="flex h-8 items-center rounded-md px-2 text-sm font-medium text-muted-foreground outline-none transition hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
                        onClick={() => onSelect("runs")}
                        to="/runs"
                      >
                        View runs
                      </Link>
                      <Link
                        aria-current={activeId === "runs" && location.pathname.startsWith("/run") && !location.pathname.startsWith("/runs") ? "page" : undefined}
                        className="flex h-8 items-center rounded-md px-2 text-sm font-medium text-muted-foreground outline-none transition hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
                        onClick={() => onSelect("runs")}
                        to="/run"
                      >
                        Run locally
                      </Link>
                    </div>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </motion.li>
            </ul>
          </li>
          <li className="shrink-0 border-t border-sidebar-border pt-2">
            <motion.div variants={variants}>
              {!isCollapsed && (
                <News
                  articles={productUseArticles}
                  onArticleSelect={(article) => onSelect(article.navId ?? article.href)}
                />
              )}
            </motion.div>
          </li>
          <li className="shrink-0 border-t border-sidebar-border pt-2">
            <motion.div variants={variants}>
              {!isCollapsed && <WorkspaceProfile onSelect={onSelect} />}
            </motion.div>
          </li>
        </motion.ul>
      </motion.div>
    </motion.div>
  );
}
