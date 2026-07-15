import { useState } from "react";
import { Info, PanelLeftClose, PanelLeftOpen } from "lucide-react";
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
import { NewRunPage } from "@/features/runs/NewRunPage";
import { RunHistoryPage } from "@/features/runs/RunHistoryPage";
import { FixtureRunPage, RunPage } from "@/features/runs/RunPage";

function activeNavigation(pathname: string): string {
  if (pathname.startsWith("/corpus")) return "corpus";
  if (pathname.startsWith("/about")) return "about";
  return "runs";
}

function AboutPage() {
  return (
    <main className="mx-auto grid w-full max-w-5xl gap-6 p-4 md:p-8">
      <Info aria-hidden="true" className="size-5 text-muted-foreground" />
      <h1 className="text-3xl font-semibold tracking-tight">
        About Cross-Examine
      </h1>
      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
        An independent verification harness for Codex-authored Python changes.
        Models propose checks; execution supplies evidence; a pure function
        decides the verdict.
      </p>
    </main>
  );
}

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window === "undefined" || window.innerWidth >= 768,
  );
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-black/[0.02] dark:bg-white/[0.02]">
      <aside
        aria-hidden={!sidebarOpen}
        className={`fixed inset-y-0 left-0 z-30 shrink-0 overflow-hidden bg-card shadow-xl transition-[width,opacity] duration-300 motion-reduce:transition-none md:static md:z-auto md:shadow-none ${
          sidebarOpen ? "w-[260px] opacity-100" : "w-0 opacity-0"
        }`}
        inert={!sidebarOpen ? true : undefined}
      >
        <nav aria-label="Primary" className="h-screen w-[260px]">
          <SidebarNav
            activeId={activeNavigation(location.pathname)}
            activeWorkspace="Cross-Examine"
            className="w-[260px]"
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
        <header className="sticky top-0 z-20 flex h-14 items-center border-b border-border/50 bg-card/95 px-3 backdrop-blur md:px-4">
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
          <span className="ml-3 text-sm font-medium">
            Independent verification harness
          </span>
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
      { index: true, element: <NewRunPage /> },
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
      { path: "about", element: <AboutPage /> },
    ],
  },
];

const browserRouter = createBrowserRouter(appRoutes);

export function App() {
  return <RouterProvider router={browserRouter} />;
}
