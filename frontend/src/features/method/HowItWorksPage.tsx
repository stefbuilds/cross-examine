import { Bot, CircleAlert, GitBranch, Scale, Terminal } from "lucide-react";

const boundaries = [
  ["Untrusted model proposal", "Characterize", "The model can propose strict claims, never findings or a verdict.", Bot],
  ["Grounded execution", "Layer A and Layer B", "Base and head execution produces findings with exact commands and captured output.", Terminal],
  ["Pure judgment", "Aggregate", "aggregate() turns findings into the verdict without IO, network, or a model call.", Scale],
] as const;

export function HowItWorksPage() {
  return (
    <main className="page-shell">
      <header className="page-header">
        <div className="grid gap-4">
          <p className="eyebrow">Trust boundary / five stages</p>
          <h1 className="page-title">How it works</h1>
          <p className="page-copy">The model proposes claims. Deterministic execution produces findings. Pure code decides the verdict.</p>
        </div>
      </header>
      <ol className="grid gap-4 md:grid-cols-3">
        {boundaries.map(([title, stage, detail, Icon]) => (
          <li className="surface-frame p-5" key={title}>
            <Icon aria-hidden="true" className="size-5 text-primary" />
            <p className="mt-6 font-mono text-xs text-muted-foreground">{stage}</p>
            <h2 className="mt-2 font-semibold">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{detail}</p>
          </li>
        ))}
      </ol>
      <section className="surface-frame flex gap-3 p-5" aria-label="Verdict semantics">
        <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-amber-700" />
        <p className="text-sm leading-6 text-muted-foreground"><strong className="text-foreground">BROKEN</strong> is a preserve-critical refutation; <strong className="text-foreground">RISKY</strong> is another refutation or critical abstention; <strong className="text-foreground">SAFE</strong> is a grounded pass. Missing critical execution resolves toward risk, never safety.</p>
      </section>
      <p className="flex items-center gap-2 text-sm text-muted-foreground"><GitBranch aria-hidden="true" className="size-4" />Base and head run from detached worktrees; reports expose receipts, not a model verdict.</p>
    </main>
  );
}
