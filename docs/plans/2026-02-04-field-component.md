# Field Component Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a new `/field` route that renders a minimal field-driven particle effect using GPU shaders (curl-ish flow + mouse lens).

**Architecture:** New entrypoint `src/field.ts` renders a `THREE.Points` plane with anchor positions and per-point attributes. Vertex shader computes field displacement and lens deformation. Fragment shader renders soft additive points. New `field.html` and Vite multi-page input integrate the route.

**Tech Stack:** Three.js, Vite, TypeScript, GLSL shaders, Vitest for unit tests.

### Task 1: Add `/field` entry page and Vite input

**Files:**
- Create: `field.html`
- Modify: `vite.config.ts`

**Step 1: Create `field.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Field</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/field.ts"></script>
  </body>
</html>
```

**Step 2: Add `field` input to Vite config**

```ts
import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        mesh: resolve(__dirname, "mesh.html"),
        field: resolve(__dirname, "field.html"),
      },
    },
  },
});
```

**Step 3: Commit**

```bash
git add field.html vite.config.ts
git commit -m "feat: add field route entry"
```

### Task 2: Create field geometry helper (TDD)

**Files:**
- Create: `src/field-geometry.ts`
- Create: `src/field-geometry.test.ts`

**Step 1: Write the failing test**

```ts
import { expect, test } from "vitest";
import { createFieldGeometry } from "./field-geometry";

test("createFieldGeometry builds attributes with expected sizes", () => {
  const geometry = createFieldGeometry({ cols: 10, rows: 6, width: 2, height: 1 });
  const position = geometry.getAttribute("position");
  const seed = geometry.getAttribute("aSeed");
  const phase = geometry.getAttribute("aPhase");

  expect(position.count).toBe(60);
  expect(seed.count).toBe(60);
  expect(phase.count).toBe(60);
});

test("createFieldGeometry seeds are in [0,1]", () => {
  const geometry = createFieldGeometry({ cols: 8, rows: 4, width: 2, height: 1 });
  const seed = geometry.getAttribute("aSeed");
  for (let i = 0; i < seed.count; i++) {
    const value = seed.array[i] as number;
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(1);
  }
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/field-geometry.test.ts`
Expected: FAIL with "Cannot find module './field-geometry'" or missing export.

**Step 3: Write minimal implementation**

```ts
import * as THREE from "three";

type FieldGeometryOptions = {
  cols: number;
  rows: number;
  width: number;
  height: number;
};

export const createFieldGeometry = ({ cols, rows, width, height }: FieldGeometryOptions) => {
  const count = cols * rows;
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const phases = new Float32Array(count);

  let i = 0;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const u = cols === 1 ? 0.5 : x / (cols - 1);
      const v = rows === 1 ? 0.5 : y / (rows - 1);
      positions[i * 3 + 0] = (u - 0.5) * width;
      positions[i * 3 + 1] = (v - 0.5) * height;
      positions[i * 3 + 2] = 0;

      const s = (Math.sin((x + 1) * 12.9898 + (y + 1) * 78.233) * 43758.5453) % 1;
      const seed = s < 0 ? s + 1 : s;
      seeds[i] = seed;
      phases[i] = seed * Math.PI * 2;
      i++;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
  return geometry;
};
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/field-geometry.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/field-geometry.ts src/field-geometry.test.ts
git commit -m "feat: add field geometry helper"
```

### Task 3: Add field shaders

**Files:**
- Create: `src/shaders/field.vert.glsl`
- Create: `src/shaders/field.frag.glsl`

**Step 1: Add vertex shader**

```glsl
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uMouseV;
uniform float uPointScale;
uniform float uFlowAmp;
uniform float uWaveAmp;
uniform float uJitterAmp;
uniform float uLensRadius;
uniform float uLensStrength;
uniform float uSwirlStrength;

attribute float aSeed;
attribute float aPhase;

varying float vDepth;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float value = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amp * noise(p);
    p *= 2.02;
    amp *= 0.5;
  }
  return value;
}

vec2 curlLike(vec2 p, float t) {
  float n1 = fbm(p + vec2(0.0, t));
  float n2 = fbm(p + vec2(5.2, t * 0.7));
  vec2 v = vec2(n1 - 0.5, n2 - 0.5);
  return vec2(-v.y, v.x);
}

void main() {
  vec3 base = position;
  float t = uTime;

  vec2 flow = curlLike(base.xy * 1.4, t * 0.25) * uFlowAmp;
  float wave = sin((base.x + base.y) * 3.0 + t * 0.6 + aPhase);
  vec2 waves = vec2(wave, sin(base.x * 2.2 - t * 0.5)) * uWaveAmp;
  vec2 jitter = (vec2(fbm(base.xy * 6.0 + t * 1.6), fbm(base.xy * 6.0 - t * 1.3)) - 0.5) * uJitterAmp;

  vec2 offset = flow + waves + jitter;

  vec2 dir = base.xy - uMouse;
  float dist = length(dir);
  float falloff = smoothstep(uLensRadius, 0.0, dist);
  vec2 normDir = dist > 0.0001 ? dir / dist : vec2(0.0, 1.0);
  vec2 push = normDir * falloff * uLensStrength;
  vec2 swirl = vec2(-normDir.y, normDir.x) * falloff * uSwirlStrength * (1.0 + length(uMouseV));

  vec3 displaced = base + vec3(offset + push + swirl, 0.0);

  float z = fbm(base.xy * 1.3 + t * 0.15);
  vDepth = z;

  gl_Position = vec4(displaced, 1.0);
  gl_PointSize = uPointScale * (0.6 + z * 0.8);
}
```

**Step 2: Add fragment shader**

```glsl
precision highp float;

varying float vDepth;

void main() {
  vec2 uv = gl_PointCoord.xy - 0.5;
  float d = length(uv) * 2.0;
  float alpha = smoothstep(1.0, 0.0, d);
  vec3 color = mix(vec3(0.35, 0.7, 1.0), vec3(0.75, 0.9, 1.0), vDepth);
  gl_FragColor = vec4(color, alpha * (0.4 + vDepth * 0.7));
}
```

**Step 3: Commit**

```bash
git add src/shaders/field.vert.glsl src/shaders/field.frag.glsl
git commit -m "feat: add field shaders"
```

### Task 4: Add field entrypoint

**Files:**
- Create: `src/field.ts`
- Modify: `src/style.css` (if needed for background tweaks)

**Step 1: Write `src/field.ts`**

```ts
import "./style.css";
import * as THREE from "three";
import vertexShader from "./shaders/field.vert.glsl?raw";
import fragmentShader from "./shaders/field.frag.glsl?raw";
import { createFieldGeometry } from "./field-geometry";
import { lerp } from "./motion";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("Missing #app element");
}

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const geometry = createFieldGeometry({ cols: 200, rows: 120, width: 2.2, height: 1.4 });

const uniforms = {
  uTime: { value: 0 },
  uMouse: { value: new THREE.Vector2(0, 0) },
  uMouseV: { value: new THREE.Vector2(0, 0) },
  uPointScale: { value: 140.0 },
  uFlowAmp: { value: 0.09 },
  uWaveAmp: { value: 0.06 },
  uJitterAmp: { value: 0.02 },
  uLensRadius: { value: 0.5 },
  uLensStrength: { value: 0.08 },
  uSwirlStrength: { value: 0.12 },
};

const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  uniforms,
});

const points = new THREE.Points(geometry, material);
scene.add(points);

const targetMouse = new THREE.Vector2(0, 0);
const currentMouse = new THREE.Vector2(0, 0);
const currentMouseV = new THREE.Vector2(0, 0);
let lastMouse = new THREE.Vector2(0, 0);

const updateTarget = (x: number, y: number) => {
  const nx = (x / window.innerWidth) * 2 - 1;
  const ny = -(y / window.innerHeight) * 2 + 1;
  targetMouse.set(nx, ny);
};

window.addEventListener("pointermove", (event) => {
  updateTarget(event.clientX, event.clientY);
});

window.addEventListener("pointerleave", () => {
  targetMouse.set(0, 0);
});

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const clock = new THREE.Clock();

const animate = () => {
  const elapsed = clock.getElapsedTime();
  const dt = clock.getDelta();
  uniforms.uTime.value = elapsed;

  currentMouse.set(
    lerp(currentMouse.x, targetMouse.x, 0.12),
    lerp(currentMouse.y, targetMouse.y, 0.12)
  );

  const vx = (currentMouse.x - lastMouse.x) / Math.max(dt, 0.0001);
  const vy = (currentMouse.y - lastMouse.y) / Math.max(dt, 0.0001);
  currentMouseV.set(lerp(currentMouseV.x, vx, 0.2), lerp(currentMouseV.y, vy, 0.2));
  lastMouse = currentMouse.clone();

  uniforms.uMouse.value.copy(currentMouse);
  uniforms.uMouseV.value.copy(currentMouseV);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();
```

**Step 2: Run tests**

Run: `npx vitest run`
Expected: PASS

**Step 3: Commit**

```bash
git add src/field.ts
git commit -m "feat: add field entrypoint"
```

### Task 5: Update README routes

**Files:**
- Modify: `README.md`

**Step 1: Update routes section**

```md
- `/` - Cursor-following particle cloud with pulsing waves
- `/mesh` - Mesh grid particles with spring constraints and collision radius
- `/field` - Field-driven particle plane with curl-ish flow + cursor lens
```

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: document field route"
```

### Task 6: Final verification

**Step 1: Run full test suite**

Run: `npx vitest run`
Expected: PASS

**Step 2: Run build**

Run: `npm run build`
Expected: PASS

**Step 3: Commit (if any uncommitted changes remain)**

```bash
git status --short
```

