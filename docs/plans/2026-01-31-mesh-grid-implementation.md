# Mesh Grid Effect Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a new `/mesh` page that renders a grid of particles with mesh-like physics (spring constraints + collision radius) and no cursor interaction.

**Architecture:** A separate Vite entry (`mesh.html` + `src/mesh.ts`) uses three.js to render `THREE.Points` from a grid. Each frame runs a lightweight Verlet solver with neighbor constraints and local collision resolution, then writes positions into the geometry.

**Tech Stack:** Vite (vanilla TS), three.js, Vitest

### Task 1: Add `/mesh` HTML entry and build wiring

**Files:**
- Create: `mesh.html`, `src/mesh.ts`
- Modify: `vite.config.ts`
- Test: none

**Step 1: Add new HTML entry**

`mesh.html` should mirror `index.html` but load `/src/mesh.ts`.

**Step 2: Configure Vite multi-page build**

Update `vite.config.ts` to include `mesh.html` in `build.rollupOptions.input`.

**Step 3: Commit**

```bash
git add mesh.html src/mesh.ts vite.config.ts
git commit -m "feat: add mesh page entry"
```

### Task 2: Add mesh physics helper with tests (TDD)

**Files:**
- Create: `src/mesh-physics.ts`, `src/mesh-physics.test.ts`
- Test: `src/mesh-physics.test.ts`

**Step 1: Write failing tests**

```ts
import { expect, test } from "vitest";
import { clampPosition, resolvePairCollision } from "./mesh-physics";

test("clampPosition keeps points within bounds", () => {
  expect(clampPosition({ x: -2, y: 0 }, 1)).toEqual({ x: -1, y: 0 });
  expect(clampPosition({ x: 0.5, y: 2 }, 1)).toEqual({ x: 0.5, y: 1 });
});

test("resolvePairCollision separates overlapping points", () => {
  const a = { x: 0, y: 0 };
  const b = { x: 0.01, y: 0 };
  const { aOut, bOut } = resolvePairCollision(a, b, 0.05);
  const dist = Math.hypot(aOut.x - bOut.x, aOut.y - bOut.y);
  expect(dist).toBeGreaterThanOrEqual(0.05);
});
```

**Step 2: Run test to verify it fails**

```bash
npx vitest run src/mesh-physics.test.ts
```

**Step 3: Write minimal implementation**

```ts
export const clampPosition = (p: { x: number; y: number }, bound: number) => ({
  x: Math.max(-bound, Math.min(bound, p.x)),
  y: Math.max(-bound, Math.min(bound, p.y)),
});

export const resolvePairCollision = (
  a: { x: number; y: number },
  b: { x: number; y: number },
  radius: number
) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy) || 1;
  const minDist = radius;
  if (dist >= minDist) return { aOut: a, bOut: b };
  const push = (minDist - dist) / 2;
  const nx = dx / dist;
  const ny = dy / dist;
  return {
    aOut: { x: a.x - nx * push, y: a.y - ny * push },
    bOut: { x: b.x + nx * push, y: b.y + ny * push },
  };
};
```

**Step 4: Run test to verify it passes**

```bash
npx vitest run src/mesh-physics.test.ts
```

**Step 5: Commit**

```bash
git add src/mesh-physics.ts src/mesh-physics.test.ts
git commit -m "test: add mesh physics helpers"
```

### Task 3: Implement mesh grid simulation + rendering

**Files:**
- Modify: `src/mesh.ts`
- Create: `src/mesh-grid.ts`
- Test: none

**Step 1: Create grid and Verlet solver**

`src/mesh-grid.ts` should:
- Initialize a 2D grid of points with `pos` and `prev`.
- Apply gentle oscillation force per frame (time-based).
- Enforce neighbor constraints (horizontal + vertical) for spacing.
- Resolve local collisions within neighbor cells.
- Update a `Float32Array` for positions.

**Step 2: Render with three.js**

`src/mesh.ts` should:
- Create a full-screen renderer + orthographic camera.
- Create `THREE.Points` with a `position` attribute from the grid.
- Animate: step physics, write positions, render.

**Step 3: Commit**

```bash
git add src/mesh.ts src/mesh-grid.ts
git commit -m "feat: add mesh grid simulation"
```

### Task 4: Wire visuals + styling

**Files:**
- Modify: `src/style.css`, `mesh.html`, `README.md`
- Test: manual

**Step 1: Style mesh page**

- Keep background consistent, hide overflow.
- Optionally add subtle title in mesh page (optional).

**Step 2: Manual validation**

- Open `/mesh` and confirm grid visible.
- Particles move in a gentle wave.
- No overlaps (collision radius).

**Step 3: Commit**

```bash
git add src/style.css mesh.html README.md
git commit -m "chore: polish mesh page"
```
