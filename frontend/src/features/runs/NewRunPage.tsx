import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { createHeroRun, createRun, loadHealth } from "@/app/api";
import CheckoutForm from "@/components/ui/checkout-form";
import { GradientShimmer } from "@/components/ui/gradient-shimmer";

export function NewRunPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [repo, setRepo] = useState(() => searchParams.get("repo") ?? "");
  const [baseRef, setBaseRef] = useState(() => searchParams.get("base") ?? "");
  const [headRef, setHeadRef] = useState(() => searchParams.get("head") ?? "");
  const [layerB, setLayerB] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [heroSubmitting, setHeroSubmitting] = useState(false);
  const [hosted, setHosted] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadHealth()
      .then((health) => {
        if (!cancelled) setHosted(health.hosted === true);
      })
      .catch(() => {
        if (!cancelled) setHosted(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
      <header className="grid gap-5 border-b pb-7 text-center">
        <div className="mx-auto grid max-w-4xl gap-4">
          <p className="eyebrow">Contract-first / Python</p>
          <h1 className="text-4xl font-bold tracking-[-0.045em] md:text-6xl">
            <GradientShimmer>Trust the evidence. Not the patch.</GradientShimmer>
          </h1>
        </div>
        <p className="page-copy mx-auto">
          Compare captured base behavior with the head revision, then hunt
          adversarial boundaries. Every conclusion opens to its receipt.
        </p>
      </header>

      <CheckoutForm
        baseRef={baseRef}
        errors={errors}
        headRef={headRef}
        heroSubmitting={heroSubmitting}
        hosted={hosted}
        layerB={layerB}
        onBaseRefChange={(value) => {
          setBaseRef(value);
          clearError("baseRef");
        }}
        onHeadRefChange={(value) => {
          setHeadRef(value);
          clearError("headRef");
        }}
        onHeroRun={runHero}
        onLayerBChange={setLayerB}
        onRepoChange={(value) => {
          setRepo(value);
          clearError("repo");
        }}
        onSubmit={submit}
        repo={repo}
        submitting={submitting}
      />
    </main>
  );
}
