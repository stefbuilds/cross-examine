import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  type RouteObject,
  useLocation,
  useNavigation,
} from "react-router-dom";
import { Skeleton as BoneyardSkeleton } from "boneyard-js/react";

import { loadBrokenFixture, loadCorpus, loadRun, loadRuns } from "@/app/api";
import { CrossExamineCommandDock } from "@/features/navigation/CrossExamineCommandDock";
import { PointerCursor } from "@/components/ui/pointer-cursor";
import { CorpusPage } from "@/features/corpus/CorpusPage";
import { EvidenceLandingPage } from "@/features/evidence/EvidenceLandingPage";
import { WelcomePage } from "@/features/welcome/WelcomePage";
import { RunHistoryPage } from "@/features/runs/RunHistoryPage";
import { RunLocallyPage } from "@/features/runs/RunLocallyPage";
import { FixtureRunPage, RunPage } from "@/features/runs/RunPage";
import { TrialsPage } from "@/features/trials/TrialsPage";
import { TrialsNavigation } from "@/features/trials/TrialsNavigation";
import { SettingsPage } from "@/features/settings/SettingsPage";
import { WorkspaceToolbar } from "@/components/ui/workspace-toolbar";
import { LoaderDotMatrix } from "@/components/ui/loader-dot-matrix";
import { ReportLoadingSkeleton } from "@/components/ui/report-loading-skeleton";

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
    loadRuns().then((value) => Array.isArray(value) ? value : []).catch(() => []),
  ]);
  return { fixture, runs };
}

function AppShell() {
  const location = useLocation();
  const navigation = useNavigation();
  return (
    <div className="min-h-screen bg-background/80">
      <div className="min-w-0 pb-44">
        <WorkspaceToolbar />
        <BoneyardSkeleton animate="shimmer" className="w-full" fallback={<LoadingShell />} loading={navigation.state === "loading"} name={pageSkeletonName(navigation.location?.pathname ?? location.pathname)} select="viewport" transition>
          <Outlet />
        </BoneyardSkeleton>
      </div>
      <CrossExamineCommandDock />
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
      { path: "assistant", element: null },
      { path: "evidence", loader: loadEvidenceLanding, element: <EvidenceLandingPage /> },
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
      { path: "corpus", loader: loadCorpus, element: <><TrialsNavigation /><CorpusPage /></> },
      { path: "trials", element: <><TrialsNavigation /><TrialsPage /></> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
];

const browserRouter = createBrowserRouter(appRoutes);

export function App() {
  return (
    <>
      <RouterProvider router={browserRouter} />
      <PointerCursor />
    </>
  );
}
