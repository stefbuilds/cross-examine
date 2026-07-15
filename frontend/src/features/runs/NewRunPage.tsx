import { useState, type FormEvent } from "react";
import { FlaskConical, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { createHeroRun, createRun } from "@/app/api";
import { Button } from "@/components/ui/button";
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
    <main className="mx-auto grid w-full max-w-5xl gap-8 p-4 md:p-8">
      <header className="grid gap-3 border-b border-border/50 pb-7">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Contract-first verification
        </p>
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
          Cross-examine a Python change before you trust it.
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
          Compare captured base behavior with the head revision, then hunt
          adversarial boundaries. Every conclusion opens to the exact command
          and output that earned it.
        </p>
      </header>

      <form
        className="grid gap-6 rounded-xl border border-border/50 bg-card p-5 shadow-sm md:p-7"
        onSubmit={submit}
      >
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary p-2 text-primary-foreground">
            <FlaskConical aria-hidden="true" className="size-4" />
          </div>
          <div>
            <h2 className="font-semibold">New verification run</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Local paths and Git URLs are accepted. Both refs resolve into
              isolated worktrees.
            </p>
          </div>
        </div>

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

        <div className="flex items-center justify-between gap-4 rounded-lg border border-border/50 bg-muted/30 p-4">
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
        <p className="text-xs leading-5 text-muted-foreground">
          The offline hero uses a checked-in, visibly labeled characterization
          fixture and executes the real comparison pipeline without an API key.
        </p>
      </form>
    </main>
  );
}
