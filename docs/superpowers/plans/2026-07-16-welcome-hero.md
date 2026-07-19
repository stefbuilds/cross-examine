# Welcome Hero Implementation Plan

> **Historical design record.** Written 2026-07-15/16 during the build. It describes intent at the time, not current behavior, and contains claims now superseded by the implementation. For current architecture see [docs/architecture.md](../../architecture.md). Retained for provenance.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a sidebar-free, sourced welcome hero at `/welcome` that links to the existing evidence dashboard at `/`.

**Architecture:** `WelcomePage` composes sourced `PixelHero` and `PaperDesignBackground` components. The router exposes `/welcome` outside `AppShell`; the existing dashboard routes and loaders stay where they are. The dither component reads the existing document theme only and never mutates global theme state.

**Tech Stack:** React 19, React Router, Tailwind, Vitest, shared interface components, `@paper-design/shaders-react`.

## Global Constraints

- Work only on branch `visuals`.
- Preserve sourced motion, transitions, hover behavior, and reduced-motion behavior exactly.
- Change orange/gold dither colors only to Cross-Examine purple; do not let its theme mode own `document.documentElement`.
- Use real semantic links, active-state indication, focus rings, and the existing mobile `onSelect` callback.
- Do not change loaders, API/data wiring, or AppShell's inert/overlay/collapse mechanics.
- Update `docs/provenance.md`, run `cd frontend && npm run build` and `cd frontend && npm run test`, then commit and push.

---

### Task 1: Source and wire the welcome hero

**Files:**
- Create: `frontend/src/components/ui/pixel-perfect-hero.tsx`
- Create: `frontend/src/components/ui/neon-dither.tsx`
- Create: `frontend/src/features/welcome/WelcomePage.tsx`
- Modify: `frontend/package.json`
- Modify: `frontend/src/app/App.tsx`
- Modify: `frontend/src/components/ui/session-nav-bar.tsx`
- Modify: `frontend/src/app/App.test.tsx`
- Modify: `frontend/src/components/ui/session-nav-bar.test.tsx`
- Modify: `docs/provenance.md`

**Interfaces:**
- Consumes: `Link` from `react-router-dom`; existing `SessionNavBar` props.
- Produces: `PixelHero` with `primaryAction: React.ReactNode`; `PaperDesignBackground` with `className`, `intensity`, and `parallax`; `WelcomePage` at `/welcome`.

- [ ] **Step 1: Write the failing tests**

```tsx
it("renders the welcome hero outside the dashboard shell", async () => {
  const router = createMemoryRouter(appRoutes, { initialEntries: ["/welcome"] });
  render(<RouterProvider router={router} />);
  expect(await screen.findByRole("heading", { name: "Evidence, examined." })).toBeInTheDocument();
  expect(screen.queryByRole("navigation", { name: "Primary" })).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Enter dashboard" })).toHaveAttribute("href", "/");
});
```

- [ ] **Step 2: Run the focused tests to verify they fail**

Run: `cd frontend && npm run test -- src/app/App.test.tsx src/components/ui/session-nav-bar.test.tsx`

Expected: FAIL because `/welcome` and the sidebar removal do not exist.

- [ ] **Step 3: Add the package and interface components**

```bash
cd frontend && npm install @paper-design/shaders-react
```

Implement the pixel hero and dither background with canvas motion, shimmer, CTA reveal, shader, parallax, glow, grain, and source timing. Remove demo logos, GitHub CTA, and all global `dark`-class writes. Substitute purple `#7F76CA`, `#D08CE8`, and `#AC82DB` for the dither's warm colors.

- [ ] **Step 4: Wire the standalone route and semantic dashboard action**

```tsx
{ path: "welcome", element: <WelcomePage /> },
{
  element: <AppShell />,
  children: [{ index: true, loader: loadBrokenFixture, element: <EvidenceLandingPage /> }],
}
```

Render `<Link to="/">Enter dashboard</Link>` inside the hero CTA frame. Delete only the evidence nav item and related demo article; keep all remaining `SessionNavBar` behavior unchanged.

- [ ] **Step 5: Run focused tests to verify they pass**

Run: `cd frontend && npm run test -- src/app/App.test.tsx src/components/ui/session-nav-bar.test.tsx`

Expected: PASS for the new welcome-route and sidebar assertions.

- [ ] **Step 6: Verify**

Run `cd frontend && npm run build` and `cd frontend && npm run test`.

- [ ] **Step 7: Commit and push**

```bash
git add frontend
git commit -m "feat(ui): add welcome hero"
git push origin visuals
```
