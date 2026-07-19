// Visual grammar adapted from the user-supplied 21st.dev checkout form.
// Cross-Examine keeps the summary-card structure while wiring real run inputs.
import { ClipboardPaste, MapPin, Play, ScanSearch, Tag } from "lucide-react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { GradientShimmer } from "@/components/ui/gradient-shimmer";
import { LoaderDotMatrix } from "@/components/ui/loader-dot-matrix";

type CheckoutFormProps = {
  repo: string;
  baseRef: string;
  headRef: string;
  layerB: boolean;
  errors: Record<string, string>;
  submitting: boolean;
  heroSubmitting: boolean;
  onRepoChange: (value: string) => void;
  onBaseRefChange: (value: string) => void;
  onHeadRefChange: (value: string) => void;
  onLayerBChange: (value: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onHeroRun: () => void;
};

export default function CheckoutForm({
  repo,
  baseRef,
  headRef,
  layerB,
  errors,
  submitting,
  heroSubmitting,
  onRepoChange,
  onBaseRefChange,
  onHeadRefChange,
  onLayerBChange,
  onSubmit,
  onHeroRun,
}: CheckoutFormProps) {
  return (
    <form className="flex w-full flex-col items-center justify-center gap-4" onSubmit={onSubmit}>
      <Card className="w-full max-w-4xl rounded-[var(--radius-xl)] border p-0 shadow-xl">
        <CardHeader className="border-b p-5 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-xl font-semibold tracking-tight">New verification run</CardTitle>
            <ScanSearch aria-hidden="true" className="size-6 text-primary" />
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Compare captured base behavior with the head revision, then open every conclusion to its receipt.
          </p>
        </CardHeader>
        <CardContent className="grid gap-0 p-0 md:grid-cols-[1.25fr_.75fr]">
          <div className="space-y-6 p-5 md:p-6">
          <section aria-labelledby="verification-target-heading">
            <div className="mb-3 flex items-center gap-2">
              <MapPin aria-hidden="true" className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-medium" id="verification-target-heading">Verification target</h2>
            </div>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="repo">
                  Repository URL or path
                  <span aria-hidden="true" className="text-destructive">*</span>
                </Label>
                <div className="relative">
                <Input
                  aria-describedby={errors.repo ? "repo-error" : undefined}
                  aria-invalid={errors.repo ? true : undefined}
                  aria-required="true"
                  id="repo"
                  onChange={(event) => onRepoChange(event.target.value)}
                  className="h-12 rounded-[var(--radius)] pr-11 font-mono text-xs"
                  placeholder="C:\\code\\project or https://github.com/org/repo"
                  value={repo}
                />
                <ClipboardPaste aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
                {errors.repo && <p className="text-sm text-destructive" id="repo-error" role="alert">{errors.repo}</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="base-ref">
                    Base ref
                    <span aria-hidden="true" className="text-destructive">*</span>
                  </Label>
                  <Input
                    aria-describedby={errors.baseRef ? "base-ref-error" : undefined}
                    aria-invalid={errors.baseRef ? true : undefined}
                    aria-required="true"
                    id="base-ref"
                    onChange={(event) => onBaseRefChange(event.target.value)}
                    placeholder="main"
                    value={baseRef}
                  />
                  {errors.baseRef && <p className="text-sm text-destructive" id="base-ref-error" role="alert">{errors.baseRef}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="head-ref">
                    Head ref
                    <span aria-hidden="true" className="text-destructive">*</span>
                  </Label>
                  <Input
                    aria-describedby={errors.headRef ? "head-ref-error" : undefined}
                    aria-invalid={errors.headRef ? true : undefined}
                    aria-required="true"
                    id="head-ref"
                    onChange={(event) => onHeadRefChange(event.target.value)}
                    placeholder="feature/candidate"
                    value={headRef}
                  />
                  {errors.headRef && <p className="text-sm text-destructive" id="head-ref-error" role="alert">{errors.headRef}</p>}
                </div>
              </div>
            </div>
          </section>

          <Separator />

          <section aria-labelledby="execution-method-heading">
            <div className="mb-2 flex items-center gap-2">
              <ScanSearch aria-hidden="true" className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-medium" id="execution-method-heading">Execution method</h2>
            </div>
            <aside aria-label="Hosted deployment limitation" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm leading-6">
              <p className="font-semibold text-foreground">Hosted evidence explorer only</p>
              <p className="mt-1 text-muted-foreground">
                This Vercel deployment cannot execute submitted repositories. Run Cross-Examine locally instead:
              </p>
              <code className="mt-3 block overflow-x-auto rounded-lg bg-background px-3 py-2 font-mono text-xs text-foreground">
                uv sync --extra dev && uv run cross-examine demo --no-open
              </code>
            </aside>
          </section>

          <Separator />

          <section aria-labelledby="layer-selection-heading">
            <div className="mb-3 flex items-center gap-2">
              <Tag aria-hidden="true" className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-medium" id="layer-selection-heading">Layer selection</h2>
            </div>
            <div className="rounded-[var(--radius)] border bg-secondary/45 p-1">
              <Switch checked={layerB} className="sr-only" id="layer-b" onCheckedChange={onLayerBChange} />
              <div className="grid grid-cols-2 gap-1" role="group" aria-label="Layer selection">
                <button
                  aria-pressed={!layerB}
                  className={`rounded-[calc(var(--radius)-4px)] px-3 py-2.5 text-sm font-medium transition ${!layerB ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => onLayerBChange(false)}
                  type="button"
                >
                  Layer A
                </button>
                <button
                  aria-pressed={layerB}
                  className={`rounded-[calc(var(--radius)-4px)] px-3 py-2.5 text-sm font-medium transition ${layerB ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => onLayerBChange(true)}
                  type="button"
                >
                  Layer A + B
                </button>
              </div>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Layer B hunts and shrinks generated edge cases after deterministic behavioral replay.</p>
          </section>
          {errors.submit && <p className="text-sm text-destructive" role="alert">{errors.submit}</p>}
          </div>

          <aside className="flex flex-col border-t bg-secondary/35 p-5 md:border-l md:border-t-0 md:p-6" aria-labelledby="run-summary-heading">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Ready for examination</p>
            <h2 className="mt-2 text-lg font-semibold" id="run-summary-heading">
              <GradientShimmer gradient="twilight">Run summary</GradientShimmer>
            </h2>
            <div className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
              <span className="text-muted-foreground">Repository:</span>
              <span className="truncate text-right font-medium">{repo || "Required"}</span>
              <span className="text-muted-foreground">Base ref:</span>
              <span className="truncate text-right font-medium">{baseRef || "Required"}</span>
              <span className="text-muted-foreground">Head ref:</span>
              <span className="truncate text-right font-medium">{headRef || "Required"}</span>
              <span className="text-muted-foreground">Layer B:</span>
              <span className="text-right font-medium">{layerB ? "Enabled" : "Disabled"}</span>
            </div>
            <div className="mt-auto pt-8">
              <p className="text-xs leading-5 text-muted-foreground">No verdict is shown until deterministic aggregation receives executed evidence.</p>
            </div>
          </aside>
        </CardContent>
      </Card>

      <div className="flex w-full max-w-4xl flex-col gap-3 rounded-[var(--radius)] border bg-card px-4 py-3 shadow-lg sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-lg font-bold">Ready</span>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Offline hero uses a checked-in fixture and the real comparison pipeline.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            aria-busy={heroSubmitting}
            disabled={submitting || heroSubmitting}
            onClick={onHeroRun}
            type="button"
            variant="outline"
          >
            {heroSubmitting ? <><LoaderDotMatrix cols={4} dotSize={2} pattern="wave" /> Starting hero…</> : "Run offline hero demo"}
          </Button>
          <Button aria-busy={submitting} disabled={submitting || heroSubmitting} type="submit">
            <Play aria-hidden="true" />
            {submitting ? <><LoaderDotMatrix cols={4} dotSize={2} pattern="wave" /> Starting…</> : "Cross-examine PR"}
          </Button>
        </div>
      </div>
    </form>
  );
}
