import { useState } from "react";
import { Skeleton as BoneyardSkeleton } from "boneyard-js/react";
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  type RouteObject,
  useLocation,
  useNavigation,
} from "react-router-dom";

import { loadBrokenFixture, loadCorpus, loadRun, loadRuns } from "@/app/api";
import { SessionNavBar } from "@/components/ui/session-nav-bar";
import { WorkspaceToolbar } from "@/components/ui/workspace-toolbar";
import { CorpusPage } from "@/features/corpus/CorpusPage";
import { EvidenceLandingPage } from "@/features/evidence/EvidenceLandingPage";
import { WelcomePage } from "@/features/welcome/WelcomePage";
import { RunHistoryPage } from "@/features/runs/RunHistoryPage";
import { RunLocallyPage } from "@/features/runs/RunLocallyPage";
import { FixtureRunPage, RunPage } from "@/features/runs/RunPage";
import { TrialsPage } from "@/features/trials/TrialsPage";
import { SettingsPage } from "@/features/settings/SettingsPage";
import { LoaderDotMatrix } from "@/components/ui/loader-dot-matrix";
import { ReportLoadingSkeleton } from "@/components/ui/report-loading-skeleton";

function activeNavigation(pathname: string): string {
  if (pathname.startsWith("/corpus")) return "corpus";
  if (pathname.startsWith("/run")) return "runs";
  if (pathname.startsWith("/trials")) return "trials";
  if (pathname.startsWith("/settings")) return "settings";
  if (pathname.startsWith("/runs") || pathname.startsWith("/fixtures")) return "runs";
  return "evidence";
}

function pageSkeletonName(pathname: string): string {
  if (pathname.startsWith("/fixtures") || /^\/runs\/[^/]+/.test(pathname)) return "verification-report";
  if (pathname.startsWith("/runs")) return "run-history-page";
  if (pathname.startsWith("/run")) return "run-entry-page";
  if (pathname.startsWith("/corpus")) return "corpus-page";
  if (pathname.startsWith("/trials")) return "trials-page";
  if (pathname.startsWith("/settings")) return "settings-page";
  return "evidence-page";
}

async function loadEvidenceLanding() {
  const [fixture, runs] = await Promise.all([
    loadBrokenFixture(),
    loadRuns()
      .then((value) => (Array.isArray(value) ? value : []))
      .catch(() => []),
  ]);
  return { fixture, runs };
}

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window === "undefined" || window.innerWidth >= 768,
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const location = useLocation();
  const navigation = useNavigation();
  const destinationPath = navigation.location?.pathname ?? location.pathname;

  return (
    <div className="flex h-screen overflow-hidden bg-background/80">
      <aside
        aria-hidden={!sidebarOpen}
        className={`fixed inset-y-0 left-0 z-30 shrink-0 overflow-hidden bg-card shadow-xl transition-[width,opacity] duration-300 motion-reduce:transition-none md:sticky md:top-0 md:z-auto md:h-screen md:shadow-none ${
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

      <div className="h-screen min-w-0 flex-1 overflow-y-auto">
        <WorkspaceToolbar />
        <BoneyardSkeleton
          animate="shimmer"
          className="w-full"
          fallback={<LoadingShell />}
          loading={navigation.state === "loading"}
          name={pageSkeletonName(destinationPath)}
          select="viewport"
          transition
        >
          <Outlet />
        </BoneyardSkeleton>
      </div>
    </div>
  );
}

function LoadingShell() {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-6xl content-center gap-6 bg-background px-5 py-12 md:px-10">
      <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
        <LoaderDotMatrix cols={5} dotSize={2.5} pattern="wave" />
        Loading verification evidence…
      </div>
      <ReportLoadingSkeleton />
    </main>
  );
}

// oxlint-disable-next-line react/only-export-components -- route objects are exported for deterministic tests.
export const appRoutes: RouteObject[] = [
  { path: "/", element: <WelcomePage /> },
  { path: "welcome", element: <WelcomePage /> },
  {
    element: <AppShell />,
    hydrateFallbackElement: <LoadingShell />,
    children: [
      {
        path: "evidence",
        loader: loadEvidenceLanding,
        element: <EvidenceLandingPage />,
      },
      { path: "run", element: <RunLocallyPage /> },
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
      { path: "settings", element: <SettingsPage /> },
    ],
  },
];

const browserRouter = createBrowserRouter(appRoutes);

export function App() {
  return <RouterProvider router={browserRouter} />;
}
