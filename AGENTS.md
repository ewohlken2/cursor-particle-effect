# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains all TypeScript source and GLSL shaders.
- Entry points:
  - `src/main.ts` for `/` (cursor particle cloud)
  - `src/mesh.ts` for `/mesh` (mesh grid effect)
  - `src/field/index.ts` for `/field` (field-driven particles)
- Field module:
  - `src/field/geometry.ts` and `src/field/geometry.test.ts`
  - `src/field/shaders/` for field shaders
- Shared helpers: `src/motion.ts`, `src/wave.ts`, mesh helpers in `src/mesh-*.ts`.
- Static pages: `index.html`, `mesh.html`, `field.html`.
- Plans and design docs: `docs/plans/`.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run dev`: start Vite dev server.
- `npm run build`: type-check and build production assets.
- `npx vitest run`: run the test suite once.

## Coding Style & Naming Conventions
- TypeScript, ES modules, and Three.js.
- 2-space indentation.
- File naming: kebab-case for multi-word files (e.g., `mesh-visibility.ts`).
- Functions use camelCase (e.g., `createFieldGeometry`).
- Shader files live alongside their module (e.g., `src/field/shaders/field.vert.glsl`).
- Keep numeric tuning values centralized (see `CONFIG` in `src/field/index.ts`).

## Testing Guidelines
- Framework: Vitest.
- Tests live next to their module (e.g., `src/field/geometry.test.ts`).
- Naming: `*.test.ts`.
- Prefer small, deterministic unit tests for geometry and helpers.
- Run targeted tests with:
  - `npx vitest run src/field/geometry.test.ts`

## Commit & Pull Request Guidelines
- Commit messages follow a concise convention like `feat: ...`, `docs: ...`, `fix: ...`.
- Keep commits scoped to a single change when practical.
- PRs should include:
  - Summary of behavior or visual changes
  - Test command(s) run
  - Screenshots or screen recordings for visual effects

## Configuration & Assets
- Vite multi-page inputs are defined in `vite.config.ts`.
- Add new routes by creating an HTML entry and wiring it in Vite.
## Agent Notes (Learnings)
- Field-related configs are centralized in `src/field/index.ts` under `CONFIG`.
- Lens behavior is shader-driven in `src/field/shaders/field.vert.glsl`; most motion tweaks should be implemented there and exposed via uniforms.
- Oscillation lens uses `uLensCenter` and `uLensDir` to keep motion smooth even when the cursor stops or changes direction.
