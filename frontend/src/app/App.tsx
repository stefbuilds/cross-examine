import { useState } from "react";
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  type RouteObject,
  useLocation,
} from "react-router-dom";

import { loadBrokenFixture, loadCorpus, loadRun, loadRuns } from "@/app/api";
import { SessionNavBar } from "@/components/ui/session-nav-bar";
import { CorpusPage } from "@/features/corpus/CorpusPage";
import { EvidenceLandingPage } from "@/features/evidence/EvidenceLandingPage";
import { WelcomePage } from "@/features/welcome/WelcomePage";
import { RunHistoryPage } from "@/features/runs/RunHistoryPage";
import { RunLocallyPage } from "@/features/runs/RunLocallyPage";
import { FixtureRunPage, RunPage } from "@/features/runs/RunPage";
import { TrialsPage } from "@/features/trials/TrialsPage";

function activeNavigation(pathname: string): string {
  if (pathname.startsWith("/corpus")) return "corpus";
  if (pathname.startsWith("/run")) return "runs";
  if (pathname.startsWith("/trials")) return "trials";
  if (pathname.startsWith("/runs") || pathname.startsWith("/fixtures")) return "runs";
  return "evidence";
}

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window === "undefined" || window.innerWidth >= 768,
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background/80">
      <aside
        aria-hidden={!sidebarOpen}
        className={`fixed inset-y-0 left-0 z-30 shrink-0 overflow-hidden bg-card shadow-xl transition-[width,opacity] duration-300 motion-reduce:transition-none md:static md:z-auto md:shadow-none ${
          sidebarOpen
            ? sidebarCollapsed
              ? "w-[15rem] opacity-100 md:w-[3.05rem]"
              : "w-[15rem] opacity-100"
            : "w-0 opacity-0"
        }`}
        inert={!sidebarOpen ? true : undefined}
      >
        <nav aria-label="Primary" className="h-screen w-[15rem]">
          <SessionNavBar
            activeId={activeNavigation(location.pathname)}
            activeWorkspace="Cross-Examine"
            className="w-full"
            onCollapsedChange={setSidebarCollapsed}
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
  { path: "welcome", element: <WelcomePage /> },
  {
    element: <AppShell />,
    hydrateFallbackElement: <LoadingShell />,
    children: [
      { index: true, loader: loadBrokenFixture, element: <EvidenceLandingPage /> },
      { path: "run", loader: loadRuns, element: <RunLocallyPage /> },
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
    ],
  },
];

const browserRouter = createBrowserRouter(appRoutes);

export function App() {
  return <RouterProvider router={browserRouter} />;
}
