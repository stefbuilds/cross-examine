# Sidebar Bottom Anchoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the sidebar background continuous and preserve bottom-anchored utility controls as page content scrolls.

**Architecture:** Move desktop sidebar positioning responsibility into `AppShell`, making it a fixed viewport-height column. Keep `SessionNavBar` as the internal flex layout: its navigation region scrolls and its utility regions remain non-shrinking bottom children.

**Tech Stack:** React, TypeScript, Tailwind CSS, Vitest, Vite.

## Global Constraints

- Preserve the existing mobile overlay sidebar behavior.
- Keep all existing navigation routes and accessible labels intact.
- Do not alter the visual components beyond their placement and scrolling behavior.

---

### Task 1: Pin the desktop sidebar and retain its internal navigation scroll

**Files:**
- Modify: `frontend/src/app/App.tsx:36-59`
- Modify: `frontend/src/app/App.test.tsx`

**Interfaces:**
- Consumes: `SessionNavBar` as the sidebar content component.
- Produces: a desktop `aside` that remains fixed at viewport height while page content scrolls independently.

- [ ] **Step 1: Write the failing test**

Add a focused render assertion to `frontend/src/app/App.test.tsx` that locates the primary navigation's enclosing `aside` and expects Tailwind's `md:fixed`, `md:inset-y-0`, and `md:left-0` classes.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run frontend/src/app/App.test.tsx`

Expected: FAIL because the desktop sidebar currently uses `md:static`.

- [ ] **Step 3: Write minimal implementation**

Replace the desktop `md:static` positioning class on `AppShell`'s `aside` with fixed viewport positioning, add a matching desktop left margin to the main content container, and retain the existing `h-screen` navigation shell.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run frontend/src/app/App.test.tsx frontend/src/components/ui/session-nav-bar.test.tsx`

Expected: PASS with zero test failures.

- [ ] **Step 5: Build the frontend**

Run: `npm run build`

Expected: Vite completes with exit code 0 and emits `dist` assets.
