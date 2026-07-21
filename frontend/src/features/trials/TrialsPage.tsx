import { ArrowRight, ShieldAlert, Wrench } from "lucide-react";

import {
  ProximityTable,
  ProximityTableBody,
  ProximityTableCell,
  ProximityTableHead,
  ProximityTableHeader,
  ProximityTableRow,
} from "./ProximityTable";
import { trials, type TrialVerdict } from "./trials-data";

const verdictClass: Record<TrialVerdict, string> = {
  SAFE: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  RISKY: "border-amber-500/20 bg-amber-500/10 text-amber-800 dark:text-amber-200",
  BROKEN: "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300",
};

function VerdictBadge({ verdict }: { verdict: TrialVerdict }) {
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 font-mono text-[11px] font-semibold tracking-wide ${verdictClass[verdict]}`}>
      {verdict}
    </span>
  );
}

const lessons = [
  {
    title: "Windows output is evidence infrastructure",
    detail:
      "Child Python inherited Windows cp1252 even while the parent decoded pipes as UTF-8. Generated Unicode could fail before evidence was emitted, so execution now forces UTF-8 child stdio.",
  },
  {
    title: "Missing optional dependencies are not a broken PR",
    detail:
      "A raw pytest failure count can be caused entirely by missing optional dependencies. Both revisions now run, and only a passing-base regression can refute.",
  },
  {
    title: "Pytest cache is not worth an evidentiary failure",
    detail:
      "Pytest cache writes could hit a Windows rename denial in detached worktrees. Conservative evidence commands disable that non-evidentiary cache.",
  },
];

export function TrialsPage() {
  return (
    <main className="mx-auto grid w-full max-w-[88rem] gap-6 p-4 md:gap-8 md:p-8">
      <header className="grid gap-3">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Historical manual trials · unblinded shadow evidence
        </p>
        <h1 className="text-3xl font-bold tracking-[-0.045em] md:text-4xl">
          Real-world compatibility trials
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          These compatibility observations used manual characterization against
          unmodified public Python repositories. They are not qualification evidence
          or proof of model-authored characterization.
        </p>
      </header>

      <section
        aria-label="Why RISKY is evidence of integrity"
        className="grid gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/[0.07] p-5 shadow-sm md:grid-cols-[auto_1fr] md:p-6"
      >
        <ShieldAlert
          aria-hidden="true"
          className="size-8 text-amber-700 dark:text-amber-300"
          strokeWidth={2}
        />
        <div className="grid gap-1">
          <h2 className="font-semibold">Abstention is the point</h2>
          <p className="max-w-4xl text-sm leading-6 text-muted-foreground">
            Humanize and validators stayed <strong className="font-semibold text-foreground">RISKY</strong> after
            Layer B because their missing optional dependencies blocked a reliable
            verification. Cross-Examine abstained rather than claiming safety;
            those limitations are the strongest evidence that verdicts are not
            polished for a demo.
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm">
        <div className="grid gap-1 border-b border-border/50 px-5 py-4">
          <h2 className="font-semibold">Documented trial results</h2>
          <p className="text-sm text-muted-foreground">
            Layer A captures behavior before adversarial exploration; Layer A+B
            adds the differential search.
          </p>
        </div>
        <ProximityTable aria-label="Documented repository trials" className="min-w-[1100px]">
          <ProximityTableHeader className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <ProximityTableRow>
              <ProximityTableHead>Repository</ProximityTableHead>
              <ProximityTableHead>Commit refs</ProximityTableHead>
              <ProximityTableHead>Setup cost</ProximityTableHead>
              <ProximityTableHead>Layer A</ProximityTableHead>
              <ProximityTableHead>Layer A + B</ProximityTableHead>
              <ProximityTableHead>Honest limitation</ProximityTableHead>
            </ProximityTableRow>
          </ProximityTableHeader>
          <ProximityTableBody>
            {trials.map((trial, index) => (
              <ProximityTableRow index={index} key={trial.repository}>
                <ProximityTableCell className="min-w-48 align-top font-medium text-foreground">
                  <a
                    className="inline-flex items-center gap-1 underline-offset-4 hover:underline"
                    href={trial.repositoryUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {trial.repository}
                    <ArrowRight aria-hidden="true" className="size-3" />
                  </a>
                  <p className="mt-1 text-xs font-normal text-muted-foreground">
                    {trial.change}
                  </p>
                </ProximityTableCell>
                <ProximityTableCell className="whitespace-nowrap align-top font-mono text-xs">
                  {trial.baseRef} <span aria-hidden="true">→</span> {trial.headRef}
                </ProximityTableCell>
                <ProximityTableCell className="whitespace-nowrap align-top">
                  {trial.setup}
                </ProximityTableCell>
                <ProximityTableCell className="min-w-60 align-top">
                  <VerdictBadge verdict={trial.layerA.verdict} />
                  <p className="mt-2 text-xs leading-5">{trial.layerA.summary}</p>
                </ProximityTableCell>
                <ProximityTableCell className="min-w-60 align-top">
                  <VerdictBadge verdict={trial.layerAB.verdict} />
                  <p className="mt-2 text-xs leading-5">{trial.layerAB.summary}</p>
                </ProximityTableCell>
                <ProximityTableCell className="min-w-[30rem] align-top text-xs leading-5">
                  {trial.limitation}
                </ProximityTableCell>
              </ProximityTableRow>
            ))}
          </ProximityTableBody>
        </ProximityTable>
      </section>

      <section className="grid gap-4">
        <div className="flex items-center gap-2">
          <Wrench aria-hidden="true" className="size-4 text-muted-foreground" />
          <h2 className="font-semibold">What the trials taught us</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {lessons.map((lesson) => (
            <article className="rounded-xl border border-border/50 bg-card p-5 shadow-sm" key={lesson.title}>
              <h3 className="text-sm font-semibold">{lesson.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{lesson.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
