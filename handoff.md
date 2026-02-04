# Handoff

## Status
- Field effect is active in `src/field/` and wired to `/field` via `field.html`.
- Lens behavior is configurable via `CONFIG` in `src/field/index.ts`.
- Recent changes focused on oscillation lens behavior, edge-weighted boosts, and size falloff.

## Current Behavior
- `lensType`:
  - `0` = off
  - `1` = vortex (push + swirl + vortex wave)
  - `2` = oscillate (directional oscillation tied to smoothed lens direction)
- Oscillation now persists around the last hovered point (uses `uLensCenter` + `uLensDir`).
- Edge-weighted oscillation boosts increase amplitude and jitter near the lens radius.
- Particle size now shrinks both near the lens center and beyond the outer start.

## Key Config Knobs (src/field/index.ts)
- Lens control: `lensType`, `lensRadius`, `lensStrength`, `swirlStrength`
- Vortex wave: `vortexFreq`, `vortexSpeed`
- Oscillation: `oscillateAmp`, `oscillateFreq`, `oscillateSpeed`
- Direction variation: `oscillateDirJitter`, `oscillateWobbleAmp`, `oscillateWobbleSpeed`
- Edge boosts: `oscillateEdgeStart`, `oscillateEdgeAmpBoost`, `oscillateEdgeJitterBoost`
- Size falloff: `sizeFalloffInnerStart`, `sizeFalloffInnerRate`, `sizeFalloffOuterStart`, `sizeFalloffOuterRate`
- Mouse smoothing: `mouse.follow`, `mouse.velocityFollow`, `mouse.dirFollow`, `mouse.dirMinSpeed`

## Files Touched Recently
- `src/field/index.ts`
- `src/field/shaders/field.vert.glsl`

## Open Items / Next Steps
- Tune defaults for lens configs (currently a mix of experimental values).
- Consider exposing `lensType` as a string enum in TS for readability.
- Add small UI toggles (optional) for live tuning if desired.

## Test Status
- `npx vitest run` passed after latest changes (last run in this session).
