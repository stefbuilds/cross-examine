import { useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  type RouteObject,
  useLocation,
} from "react-router-dom";

import { loadBrokenFixture, loadCorpus, loadRun, loadRuns } from "@/app/api";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "@/components/ui/dashboard-sidebar";
import { CorpusPage } from "@/features/corpus/CorpusPage";
import { EvidenceLandingPage } from "@/features/evidence/EvidenceLandingPage";
import { HowItWorksPage } from "@/features/method/HowItWorksPage";
import { NewRunPage } from "@/features/runs/NewRunPage";
import { RunHistoryPage } from "@/features/runs/RunHistoryPage";
import { FixtureRunPage, RunPage } from "@/features/runs/RunPage";
import { TrialsPage } from "@/features/trials/TrialsPage";

function activeNavigation(pathname: string): string {
  if (pathname.startsWith("/corpus")) return "corpus";
  if (pathname.startsWith("/about")) return "about";
  if (pathname.startsWith("/run")) return "run";
  if (pathname.startsWith("/runs") || pathname.startsWith("/fixtures")) return "runs";
  return "evidence";
}

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window === "undefined" || window.innerWidth >= 768,
  );
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background/80">
      <aside
        aria-hidden={!sidebarOpen}
        className={`fixed inset-y-0 left-0 z-30 shrink-0 overflow-hidden bg-card shadow-xl transition-[width,opacity] duration-300 motion-reduce:transition-none md:static md:z-auto md:shadow-none ${
          sidebarOpen ? "w-[276px] opacity-100" : "w-0 opacity-0"
        }`}
        inert={!sidebarOpen ? true : undefined}
      >
        <nav aria-label="Primary" className="h-screen w-[276px]">
          <SidebarNav
            activeId={activeNavigation(location.pathname)}
            activeWorkspace="Cross-Examine"
            className="w-[276px]"
            onSelect={() => {
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
          />
        </nav>
      </aside>
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          className="fixed inset-0 z-20 bg-black/20 md:hidden"
          onClick={() => setSidebarOpen(false)}
          type="button"
        />
      )}

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-foreground/15 bg-background/90 px-4 backdrop-blur-xl md:px-6">
          <Button
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            onClick={() => setSidebarOpen((open) => !open)}
            size="icon-sm"
            variant="ghost"
          >
            {sidebarOpen ? (
              <PanelLeftClose aria-hidden="true" />
            ) : (
              <PanelLeftOpen aria-hidden="true" />
            )}
          </Button>
          <span className="ml-3 mr-auto font-heading text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Independent verification harness</span>
          <a className="hidden text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground sm:inline" href="https://deerflow.tech" rel="noreferrer" target="_blank">Created By Deerflow</a>
        </header>
        <Outlet />
      </div>
    </div>
  );
}

function LoadingShell() {
  return (
    <main className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
      Loading verification evidence…
    </main>
  );
}

// oxlint-disable-next-line react/only-export-components -- route objects are exported for deterministic tests.
export const appRoutes: RouteObject[] = [
  {
    element: <AppShell />,
    hydrateFallbackElement: <LoadingShell />,
    children: [
      { index: true, loader: loadBrokenFixture, element: <EvidenceLandingPage /> },
      { path: "run", element: <NewRunPage /> },
      { path: "runs", loader: loadRuns, element: <RunHistoryPage /> },
      {
        path: "runs/:runId",
        loader: ({ params }) => loadRun(params.runId ?? ""),
        element: <RunPage />,
      },
      {
        path: "fixtures/broken",
        loader: loadBrokenFixture,
        element: <FixtureRunPage />,
      },
      { path: "corpus", loader: loadCorpus, element: <CorpusPage /> },
      { path: "trials", element: <TrialsPage /> },
      { path: "about", element: <HowItWorksPage /> },
    ],
  },
];

const browserRouter = createBrowserRouter(appRoutes);

export function App() {
  return <RouterProvider router={browserRouter} />;
}
