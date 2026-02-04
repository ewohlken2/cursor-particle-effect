# Field Component Design

**Date:** 2026-02-04

## Goal
Add a new `/field` route that renders a field-driven particle plane where points sample a continuous motion field instead of carrying velocity. Minimal scope: curl-ish flow + layered time noise + mouse “lens” distortion that pushes/swirls rather than attracts. This should feel fluid and coherent, with GPU-driven motion and no per-frame CPU position updates.

## Approach
Use a new entrypoint (`src/field.ts`) and shader pair (`src/shaders/field.vert.glsl`, `src/shaders/field.frag.glsl`). Particles are anchor points in a plane; the vertex shader computes displacement from a deterministic field (noise-based flow + waves + jitter) and applies a local lens deformation based on cursor distance. The fragment shader renders soft additive points with slight depth modulation.

## Data Model
Geometry carries static anchor positions plus per-point attributes:
- `aSeed`: stable 0..1 random
- `aPhase`: phase offset for pulsation (future use)
- optional `aDepth`: pseudo-depth for size/brightness variation

Uniforms include `uTime`, `uMouse`, `uMouseV`, `uHover`, and tunable field/lens parameters.

## Integration
Create `field.html` and wire Vite multi-page config to include it. Keep `/` and `/mesh` intact. Provide a small geometry helper (new `src/field-geometry.ts` or extend `src/particles.ts`) with a unit test for attribute sizes and ranges.

## Future Extension
The minimal system is designed to extend into full Antigravity-style motion by layering multiple time domains, phase-shifted pulsing, and stronger fake depth (size/alpha modulation).
