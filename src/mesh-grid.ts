import { clampPosition, resolvePairCollision } from "./mesh-physics";

export type GridPoint = {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
};

export type GridConfig = {
  cols: number;
  rows: number;
  spacing: number;
  bound: number;
  stiffness: number;
  iterations: number;
  collisionRadius: number;
};

export type GridState = {
  points: GridPoint[];
  config: GridConfig;
  positions: Float32Array;
};

const indexFor = (x: number, y: number, cols: number) => y * cols + x;

const pinnedColsFor = (cols: number) => {
  const colsList: number[] = [];
  for (let col = 0; col < cols; col++) colsList.push(col);
  return colsList;
};

const targetXForCol = (col: number, cols: number, bound: number) => {
  if (cols <= 1) return 0;
  const t = col / (cols - 1);
  return -bound + 2 * bound * t;
};

const isPinnedIndex = (index: number, cols: number, rows: number) => {
  const col = index % cols;
  const row = Math.floor(index / cols);
  if (row !== 0 && row !== rows - 1) return false;
  return pinnedColsFor(cols).includes(col);
};

const pinnedTargetForIndex = (index: number, cols: number, bound: number) => {
  const col = index % cols;
  const row = Math.floor(index / cols);
  const y = row === 0 ? -bound : bound;
  return { x: targetXForCol(col, cols, bound), y };
};

const applyEdgePins = (state: GridState) => {
  const { cols, rows, bound } = state.config;
  const { points } = state;
  const pinnedCols = pinnedColsFor(cols);
  const indices: number[] = [];

  for (const col of pinnedCols) {
    indices.push(col);
    indices.push((rows - 1) * cols + col);
  }

  for (const index of indices) {
    const target = pinnedTargetForIndex(index, cols, bound);
    const p = points[index];
    p.x = target.x;
    p.y = target.y;
    p.prevX = target.x;
    p.prevY = target.y;
  }
};

export const createGrid = (config: GridConfig): GridState => {
  const { cols, rows, spacing } = config;
  const points: GridPoint[] = [];
  const startX = -((cols - 1) * spacing) / 2;
  const startY = -((rows - 1) * spacing) / 2;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const px = startX + x * spacing;
      const py = startY + y * spacing;
      points.push({ x: px, y: py, prevX: px, prevY: py });
    }
  }

  return {
    points,
    config,
    positions: new Float32Array(points.length * 3),
  };
};

const applyForces = (state: GridState, time: number) => {
  const { points } = state;
  const { cols, rows } = state.config;
  const amp = 0.0025;
  for (let i = 0; i < points.length; i++) {
    if (isPinnedIndex(i, cols, rows)) continue;
    const p = points[i];
    const dx = p.x - p.prevX;
    const dy = p.y - p.prevY;

    const wave = Math.sin(time * 1.2 + i * 0.15) * amp;
    const nx = p.x + dx + wave;
    const ny = p.y + dy + wave;

    p.prevX = p.x;
    p.prevY = p.y;
    p.x = nx;
    p.y = ny;
  }
};

const satisfyConstraints = (state: GridState) => {
  const { cols, rows, spacing, stiffness, bound } = state.config;
  const { points } = state;

  for (let iter = 0; iter < state.config.iterations; iter++) {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const idx = indexFor(x, y, cols);
        const p = points[idx];
        const pPinned = isPinnedIndex(idx, cols, rows);

        if (x < cols - 1) {
          const rightIndex = indexFor(x + 1, y, cols);
          const right = points[rightIndex];
          const rightPinned = isPinnedIndex(rightIndex, cols, rows);
          applyConstraint(p, right, spacing, stiffness, pPinned, rightPinned);
        }
        if (y < rows - 1) {
          const downIndex = indexFor(x, y + 1, cols);
          const down = points[downIndex];
          const downPinned = isPinnedIndex(downIndex, cols, rows);
          applyConstraint(p, down, spacing, stiffness, pPinned, downPinned);
        }

        const clamped = clampPosition(p, bound);
        p.x = clamped.x;
        p.y = clamped.y;
      }
    }
  }
};

const applyConstraint = (
  a: GridPoint,
  b: GridPoint,
  spacing: number,
  stiffness: number,
  aPinned: boolean,
  bPinned: boolean
) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy) || 1;
  const diff = (dist - spacing) / dist;

  if (aPinned && bPinned) return;

  if (aPinned || bPinned) {
    const offsetX = dx * diff * stiffness;
    const offsetY = dy * diff * stiffness;
    if (aPinned) {
      b.x -= offsetX;
      b.y -= offsetY;
    } else {
      a.x += offsetX;
      a.y += offsetY;
    }
    return;
  }

  const offsetX = dx * diff * 0.5 * stiffness;
  const offsetY = dy * diff * 0.5 * stiffness;

  a.x += offsetX;
  a.y += offsetY;
  b.x -= offsetX;
  b.y -= offsetY;
};

const resolveCollisions = (state: GridState) => {
  const { cols, rows, collisionRadius, bound } = state.config;
  const { points } = state;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const idx = indexFor(x, y, cols);
      const p = points[idx];
      const pPinned = isPinnedIndex(idx, cols, rows);

      // Only check nearby neighbors to keep it cheap.
      for (let oy = -1; oy <= 1; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          if (ox === 0 && oy === 0) continue;
          const nx = x + ox;
          const ny = y + oy;
          if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
          const nIdx = indexFor(nx, ny, cols);
          if (nIdx <= idx) continue;
          const other = points[nIdx];
          const otherPinned = isPinnedIndex(nIdx, cols, rows);

          if (pPinned && otherPinned) continue;

          const { aOut, bOut } = resolvePairCollision(
            { x: p.x, y: p.y },
            { x: other.x, y: other.y },
            collisionRadius
          );
          if (!pPinned) {
            p.x = aOut.x;
            p.y = aOut.y;
          } else {
            const target = pinnedTargetForIndex(idx, cols, bound);
            p.x = target.x;
            p.y = target.y;
          }

          if (!otherPinned) {
            other.x = bOut.x;
            other.y = bOut.y;
          } else {
            const target = pinnedTargetForIndex(nIdx, cols, bound);
            other.x = target.x;
            other.y = target.y;
          }
        }
      }
    }
  }
};

export const stepGrid = (state: GridState, time: number) => {
  applyEdgePins(state);
  applyForces(state, time);
  satisfyConstraints(state);
  resolveCollisions(state);
  applyEdgePins(state);
  writePositions(state);
};

const writePositions = (state: GridState) => {
  const { positions, points } = state;
  for (let i = 0; i < points.length; i++) {
    const idx = i * 3;
    positions[idx] = points[i].x;
    positions[idx + 1] = points[i].y;
    positions[idx + 2] = 0;
  }
};
