import { useState, type FormEvent } from "react";
import { FlaskConical, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { createHeroRun, createRun } from "@/app/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function NewRunPage() {
  const navigate = useNavigate();
  const [repo, setRepo] = useState("");
  const [baseRef, setBaseRef] = useState("");
  const [headRef, setHeadRef] = useState("");
  const [layerB, setLayerB] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [heroSubmitting, setHeroSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!repo.trim()) nextErrors.repo = "Repository is required";
    if (!baseRef.trim()) nextErrors.baseRef = "Base ref is required";
    if (!headRef.trim()) nextErrors.headRef = "Head ref is required";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const run = await createRun({
        repo: repo.trim(),
        base_ref: baseRef.trim(),
        head_ref: headRef.trim(),
        layer_b: layerB,
      });
      navigate(`/runs/${run.id}`);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : "Unable to start run",
      });
      setSubmitting(false);
    }
  }

  async function runHero() {
    setHeroSubmitting(true);
    setErrors({});
    try {
      const run = await createHeroRun();
      navigate(`/runs/${run.id}`);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : "Unable to start hero run",
      });
      setHeroSubmitting(false);
    }
  }

  function clearError(key: string) {
    if (errors[key]) setErrors((current) => ({ ...current, [key]: "" }));
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <div className="grid gap-4">
          <p className="eyebrow">Contract-first / Python</p>
          <h1 className="page-title">Trust the evidence. Not the patch.</h1>
        </div>
        <p className="page-copy md:max-w-sm">
          Compare captured base behavior with the head revision, then hunt
          adversarial boundaries. Every conclusion opens to its receipt.
        </p>
      </header>

      <Card className="p-0 md:p-0">
      <form className="grid gap-7 p-5 md:p-8" onSubmit={submit}>
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary p-3 text-primary-foreground shadow-[3px_3px_0_#000]">
            <FlaskConical aria-hidden="true" className="size-5" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold uppercase tracking-[-0.03em]">New verification run</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Local paths and Git URLs are accepted. Both refs resolve into
              isolated worktrees.
            </p>
          </div>
        </div>

        <aside
          aria-label="Hosted deployment limitation"
          className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm leading-6"
        >
          <p className="font-semibold text-foreground">Hosted evidence explorer only</p>
          <p className="mt-1 text-muted-foreground">
            This Vercel deployment cannot execute submitted repositories: Vercel
            Functions do not provide the Git and runtime isolation required.
            Run Cross-Examine locally instead:
          </p>
          <code className="mt-3 block overflow-x-auto rounded-lg bg-background px-3 py-2 font-mono text-xs text-foreground">
            uv sync --extra dev && uv run cross-examine demo --no-open
          </code>
        </aside>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="repo">
              Repository URL or path
              <span aria-hidden="true" className="text-destructive">
                *
              </span>
            </Label>
            <Input
              aria-describedby={errors.repo ? "repo-error" : undefined}
              aria-invalid={errors.repo ? true : undefined}
              aria-required="true"
              id="repo"
              onChange={(event) => {
                setRepo(event.target.value);
                clearError("repo");
              }}
              placeholder="C:\\code\\project or https://github.com/org/repo"
              value={repo}
            />
            {errors.repo && (
              <p
                id="repo-error"
                role="alert"
                className="text-sm text-destructive"
              >
                {errors.repo}
              </p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="base-ref">
                Base ref
                <span aria-hidden="true" className="text-destructive">
                  *
                </span>
              </Label>
              <Input
                aria-describedby={errors.baseRef ? "base-ref-error" : undefined}
                aria-invalid={errors.baseRef ? true : undefined}
                aria-required="true"
                id="base-ref"
                onChange={(event) => {
                  setBaseRef(event.target.value);
                  clearError("baseRef");
                }}
                placeholder="main"
                value={baseRef}
              />
              {errors.baseRef && (
                <p
                  id="base-ref-error"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {errors.baseRef}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="head-ref">
                Head ref
                <span aria-hidden="true" className="text-destructive">
                  *
                </span>
              </Label>
              <Input
                aria-describedby={errors.headRef ? "head-ref-error" : undefined}
                aria-invalid={errors.headRef ? true : undefined}
                aria-required="true"
                id="head-ref"
                onChange={(event) => {
                  setHeadRef(event.target.value);
                  clearError("headRef");
                }}
                placeholder="feature/candidate"
                value={headRef}
              />
              {errors.headRef && (
                <p
                  id="head-ref-error"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {errors.headRef}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-primary/25 bg-primary/10 p-4">
          <div>
            <Label htmlFor="layer-b">Adversarial Layer B</Label>
            <p className="mt-1 text-xs text-muted-foreground">
              Hunt and shrink generated edge cases after behavioral replay.
            </p>
          </div>
          <Switch checked={layerB} id="layer-b" onCheckedChange={setLayerB} />
        </div>

        {errors.submit && (
          <p role="alert" className="text-sm text-destructive">
            {errors.submit}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <Button
            aria-busy={submitting}
            disabled={submitting || heroSubmitting}
            type="submit"
          >
            <Play aria-hidden="true" />
            {submitting ? "Starting…" : "Cross-examine PR"}
          </Button>
          <Button
            aria-busy={heroSubmitting}
            disabled={submitting || heroSubmitting}
            onClick={runHero}
            type="button"
            variant="outline"
          >
            {heroSubmitting ? "Starting hero…" : "Run offline hero demo"}
          </Button>
        </div>
        <p className="border-t border-border pt-4 text-xs leading-5 text-muted-foreground">
          The offline hero uses a checked-in, visibly labeled characterization
          fixture and executes the real comparison pipeline without an API key.
        </p>
      </form>
      </Card>
    </main>
  );
}
