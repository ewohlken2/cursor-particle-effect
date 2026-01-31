# Cursor Particle Cloud

Organic cursor-following particle cloud built with three.js + Vite.

## Run

```bash
npm install
npm run dev
```

## Tuning

- Particle count: `createParticles(160)` in `src/main.ts`
- Cloud radius range: `minRadius` / `maxRadius` in `src/particles.ts`
- Pulse strength: `pulse` and `sizePulse` in `src/shaders/particles.vert.glsl`
- Color drift: `vHue` in `src/shaders/particles.vert.glsl`
