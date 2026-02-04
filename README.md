# Cursor Particle Cloud

Organic cursor-following particle cloud built with three.js + Vite.

## Pages

- `/` - Cursor-following particle cloud with pulsing waves
- `/mesh` - Mesh grid particles with spring constraints and collision radius
- `/field` - Field-driven particle plane with curl-ish flow + cursor lens

## Run

```bash
npm install
npm run dev
```

## Tuning

- Particle count: `createParticles(160)` in `src/main.ts`
- Cloud radius range: `minRadius` / `maxRadius` in `src/particles.ts`
- Wave intensity: Up/Down arrows (`src/main.ts`)
- Mesh grid: `src/mesh-grid.ts` and `src/mesh.ts`
