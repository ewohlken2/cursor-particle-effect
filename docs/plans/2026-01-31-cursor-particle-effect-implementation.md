# Cursor Particle Effect Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a full-screen, cursor-following particle cloud in three.js with organic pulsing, smooth gradient color shifts, and mid-band size emphasis for 100–200 particles.

**Architecture:** Single `THREE.Points` with custom `ShaderMaterial` and per-particle attributes. CPU updates only uniforms (time, cursor). All motion and color happens in shaders.

**Tech Stack:** Vite (vanilla TS), three.js, Vitest

### Task 1: Scaffold the project (Vite + three.js)

**Files:**
- Create: `package.json`, `vite.config.ts`, `index.html`, `src/main.ts`, `src/style.css`
- Modify: `package-lock.json`
- Test: none

**Step 1: Initialize Vite app**

```bash
npm create vite@latest . -- --template vanilla-ts
```

**Step 2: Install dependencies**

```bash
npm install
npm install three
npm install -D vitest jsdom
```

**Step 3: Add Vitest config**

```ts
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    environment: "jsdom",
  },
});
```

**Step 4: Commit**

```bash
git add package.json package-lock.json vite.config.ts index.html src/main.ts src/style.css
git commit -m "chore: scaffold vite app and install deps"
```

### Task 2: Add math helpers + tests (TDD)

**Files:**
- Create: `src/motion.ts`, `src/motion.test.ts`
- Test: `src/motion.test.ts`

**Step 1: Write failing tests**

```ts
import { expect, test } from "vitest";
import { lerp, sizeFromBand, pulse } from "./motion";

test("lerp moves toward target", () => {
  expect(lerp(0, 10, 0.1)).toBeCloseTo(1);
});

test("sizeFromBand peaks near middle", () => {
  const mid = sizeFromBand(0.5);
  const edge = sizeFromBand(0.0);
  expect(mid).toBeGreaterThan(edge);
});

test("pulse varies over time", () => {
  const a = pulse(0, 0.0);
  const b = pulse(0, 10.0);
  expect(a).not.toBe(b);
});
```

**Step 2: Run test to verify it fails**

```bash
npx vitest run
```

**Step 3: Write minimal implementation**

```ts
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const sizeFromBand = (band: number) => {
  const x = Math.max(0, Math.min(1, band));
  return 4 * x * (1 - x);
};

export const pulse = (seed: number, t: number) => {
  return Math.sin(t * 0.4 + seed * 6.28318530718);
};
```

**Step 4: Run test to verify it passes**

```bash
npx vitest run
```

**Step 5: Commit**

```bash
git add src/motion.ts src/motion.test.ts
git commit -m "test: add motion helpers with basic tests"
```

### Task 3: Add shaders and particle system module

**Files:**
- Create: `src/particles.ts`, `src/shaders/particles.vert.glsl`, `src/shaders/particles.frag.glsl`
- Modify: none
- Test: none

**Step 1: Create shader files**

(see repository for full shader contents)

**Step 2: Create particle system module**

(see `src/particles.ts` for full implementation)

**Step 3: Commit**

```bash
git add src/particles.ts src/shaders/particles.vert.glsl src/shaders/particles.frag.glsl
git commit -m "feat: add particle geometry and shaders"
```

### Task 4: Implement renderer, input, and animation loop

**Files:**
- Modify: `src/main.ts`, `src/style.css`, `index.html`, `src/vite-env.d.ts`
- Test: none

**Step 1: Set up full-screen canvas + styles**

**Step 2: Implement scene in `src/main.ts`**

- Set up renderer, scene, orthographic camera.
- Track cursor in NDC and smooth with lerp.
- Update uniforms each frame.
- Handle resize + devicePixelRatio.

**Step 3: Manual run**

```bash
npm run dev
```

**Step 4: Commit**

```bash
git add src/main.ts src/style.css index.html src/vite-env.d.ts
git commit -m "feat: render full-screen cursor particle cloud"
```

### Task 5: Tune parameters + add notes

**Files:**
- Modify: `src/particles.ts`
- Create: `README.md`
- Test: manual

**Step 1: Tune**

- Adjust radius range and size curve.
- Validate center/edge smallest, mid-band largest.

**Step 2: Commit**

```bash
git add src/particles.ts README.md
git commit -m "chore: tune particle cloud and document controls"
```
