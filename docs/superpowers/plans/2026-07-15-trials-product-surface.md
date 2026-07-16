# Trials Product Surface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render every documented public-repository trial as an evidence-first frontend page.

**Architecture:** A feature-local JSON fixture is imported by a data module and rendered by `TrialsPage`. Application wiring only adds a route and navigation item; the feature owns the content.

**Tech Stack:** React 19, TypeScript, React Router, Tailwind CSS, Vitest, Testing Library, 21st.dev table composition.

## Global Constraints

- Keep all new feature files under `frontend/src/features/trials/`.
- Derive fixture values from `docs/trials.md`; do not alter outcomes, counts, or limitation notes.
- Include every documented row and prominently explain both `RISKY` results.
- Keep the three self-caught defects distinct from repository verdicts.
- Do not modify existing feature directories.

---

### Task 1: Fixture and feature-local data boundary

**Files:**
- Create: `frontend/src/features/trials/trials.fixture.json`
- Create: `frontend/src/features/trials/trials-data.ts`
- Test: `frontend/src/features/trials/trials-data.test.ts`

**Interfaces:**
- Produces: `Trial` and `trials` exported from `trials-data.ts`.
- Consumes: Results-table rows from `docs/trials.md`.

- [ ] **Step 1: Write the failing test**

```ts
expect(trials.map((trial) => trial.repository)).toEqual([
  "python-slugify", "humanize", "validators", "packaging",
]);
expect(trials.filter((trial) => trial.layerA.verdict === "RISKY")).toHaveLength(2);
expect(trials.find((trial) => trial.repository === "humanize")?.limitation).toContain("freezegun");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/features/trials/trials-data.test.ts`

Expected: FAIL because `./trials-data` does not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
// Provenance: derived verbatim from docs/trials.md Results. Regenerate by parsing every Results-table row; do not hand-edit presentation values.
import fixture from "./trials.fixture.json";

export type TrialVerdict = "SAFE" | "RISKY" | "BROKEN";
export type Trial = { repository: string; limitation: string; layerA: { verdict: TrialVerdict }; layerAB: { verdict: TrialVerdict } };
export const trials = fixture as Trial[];
```

Populate JSON with repository name/url, refs, setup, exact Layer A and Layer A+B strings/verdicts, and exact limitations.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/features/trials/trials-data.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/trials/trials.fixture.json frontend/src/features/trials/trials-data.ts frontend/src/features/trials/trials-data.test.ts
git commit -m "feat: add documented trials fixture"
```

### Task 2: Trials evidence page

**Files:**
- Create: `frontend/src/features/trials/TrialsPage.tsx`
- Test: `frontend/src/features/trials/TrialsPage.test.tsx`

**Interfaces:**
- Consumes: `trials` from `trials-data.ts`.
- Produces: `TrialsPage` for the `/trials` route.

- [ ] **Step 1: Write the failing test**

```tsx
render(<TrialsPage />);
expect(screen.getByRole("heading", { name: "Real-world compatibility trials" })).toBeInTheDocument();
expect(screen.getAllByText("RISKY")).toHaveLength(4);
expect(screen.getByText(/abstained rather than claiming safety/i)).toBeInTheDocument();
expect(screen.getByRole("heading", { name: "What the trials taught us" })).toBeInTheDocument();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/features/trials/TrialsPage.test.tsx`

Expected: FAIL because `./TrialsPage` does not exist.

- [ ] **Step 3: Write minimal implementation**

```tsx
export function TrialsPage() {
  return (
    <main>
      <h1>Real-world compatibility trials</h1>
      <p>When dependencies prevented verification, Cross-Examine abstained rather than claiming safety.</p>
      <table aria-label="Documented repository trials">{/* map trials into evidence columns */}</table>
      <section><h2>What the trials taught us</h2>{/* three documented defects */}</section>
    </main>
  );
}
```

Use the selected 21st.dev table structure adapted only to existing tokens. Render all fixture fields, verdict badges, links, and limitations. Keep the table horizontally scrollable on narrow viewports.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/features/trials/TrialsPage.test.tsx`

Expected: PASS with RISKY evidence and all lessons rendered.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/trials/TrialsPage.tsx frontend/src/features/trials/TrialsPage.test.tsx
git commit -m "feat: render real compatibility trials"
```

### Task 3: Application route and navigation

**Files:**
- Modify: `frontend/src/app/App.tsx`
- Modify: `frontend/src/components/ui/dashboard-sidebar.tsx`
- Modify: `frontend/src/app/App.test.tsx`

**Interfaces:**
- Consumes: `TrialsPage`.
- Produces: the `/trials` route and `Trials` primary-navigation link.

- [ ] **Step 1: Write the failing test**

```tsx
const router = createMemoryRouter(appRoutes, { initialEntries: ["/trials"] });
render(<RouterProvider router={router} />);
expect(await screen.findByRole("heading", { name: "Real-world compatibility trials" })).toBeInTheDocument();
expect(screen.getByRole("link", { name: "Trials" })).toHaveAttribute("href", "/trials");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/app/App.test.tsx`

Expected: FAIL because `/trials` has no route and the sidebar lacks its link.

- [ ] **Step 3: Write minimal implementation**

```tsx
import { TrialsPage } from "@/features/trials/TrialsPage";

function activeNavigation(pathname: string) {
  if (pathname.startsWith("/trials")) return "trials";
}

{ path: "trials", element: <TrialsPage /> }
```

Add a `Trials` item to Cross-Examine primary navigation using an existing evidence-appropriate icon.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/app/App.test.tsx`

Expected: PASS including the route and sidebar link.

- [ ] **Step 5: Run full frontend verification and commit**

Run: `npm test -- --run`

Run: `npm run build`

Expected: both commands exit 0.

```bash
git add frontend/src/app/App.tsx frontend/src/components/ui/dashboard-sidebar.tsx frontend/src/app/App.test.tsx
git commit -m "feat: add trials destination"
```

