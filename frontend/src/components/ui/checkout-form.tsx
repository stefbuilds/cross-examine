// Visual grammar adapted from the user-supplied 21st.dev checkout form.
// Cross-Examine keeps the summary-card structure while wiring real run inputs.
import { CreditCard, MapPin, Play, Tag } from "lucide-react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

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
    <form className="flex w-full flex-col items-center justify-center gap-4 p-5 md:p-6" onSubmit={onSubmit}>
      <Card className="w-full max-w-xl rounded-2xl border p-0 shadow-xl">
        <CardHeader className="p-5 pb-0 md:p-6 md:pb-0">
          <CardTitle className="text-lg font-semibold tracking-tight">New verification run</CardTitle>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Compare captured base behavior with the head revision, then open every conclusion to its receipt.
          </p>
        </CardHeader>
        <CardContent className="space-y-6 p-5 md:p-6">
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
                <Input
                  aria-describedby={errors.repo ? "repo-error" : undefined}
                  aria-invalid={errors.repo ? true : undefined}
                  aria-required="true"
                  id="repo"
                  onChange={(event) => onRepoChange(event.target.value)}
                  placeholder="C:\\code\\project or https://github.com/org/repo"
                  value={repo}
                />
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
              <CreditCard aria-hidden="true" className="size-4 text-muted-foreground" />
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
            <div className="flex items-center justify-between gap-4 rounded-xl border border-primary/25 bg-primary/10 p-4">
              <div>
                <Label htmlFor="layer-b">Adversarial Layer B</Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Hunt and shrink generated edge cases after behavioral replay.
                </p>
              </div>
              <Switch checked={layerB} id="layer-b" onCheckedChange={onLayerBChange} />
            </div>
          </section>

          <Separator />

          <section aria-labelledby="run-summary-heading">
            <h2 className="text-sm font-medium" id="run-summary-heading">Run summary</h2>
            <div className="mt-2 grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-muted-foreground">Repository:</span>
              <span className="truncate text-right font-medium">{repo || "Required"}</span>
              <span className="text-muted-foreground">Base ref:</span>
              <span className="truncate text-right font-medium">{baseRef || "Required"}</span>
              <span className="text-muted-foreground">Head ref:</span>
              <span className="truncate text-right font-medium">{headRef || "Required"}</span>
              <span className="text-muted-foreground">Layer B:</span>
              <span className="text-right font-medium">{layerB ? "Enabled" : "Disabled"}</span>
            </div>
          </section>

          {errors.submit && <p className="text-sm text-destructive" role="alert">{errors.submit}</p>}
        </CardContent>
      </Card>

      <div className="flex w-full max-w-xl flex-col gap-3 rounded-xl border bg-card px-4 py-3 shadow-lg sm:flex-row sm:items-center sm:justify-between">
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
            {heroSubmitting ? "Starting hero..." : "Run offline hero demo"}
          </Button>
          <Button aria-busy={submitting} disabled={submitting || heroSubmitting} type="submit">
            <Play aria-hidden="true" />
            {submitting ? "Starting..." : "Cross-examine PR"}
          </Button>
        </div>
      </div>
    </form>
  );
}
