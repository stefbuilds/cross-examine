import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  type RouteObject,
} from "react-router-dom";

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

function AppShell() {
  return (
    <div className="min-h-screen bg-background/80">
      <div className="min-w-0 pb-44">
        <Outlet />
      </div>
      <CrossExamineCommandDock />
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
      { path: "assistant", element: null },
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
      { path: "corpus", loader: loadCorpus, element: <><TrialsNavigation /><CorpusPage /></> },
      { path: "trials", element: <><TrialsNavigation /><TrialsPage /></> },
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
