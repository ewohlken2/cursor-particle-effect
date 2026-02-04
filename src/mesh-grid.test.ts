import { expect, test } from "vitest";
import { createGrid, stepGrid } from "./mesh-grid";

test("pin top and bottom edges at eighth-step positions", () => {
  const grid = createGrid({
    cols: 9,
    rows: 3,
    spacing: 0.2,
    bound: 1,
    stiffness: 0.4,
    iterations: 2,
    collisionRadius: 0.05,
  });

  stepGrid(grid, 1.5);

  const cols = grid.config.cols;
  const lastRowStart = grid.points.length - cols;
  const pinnedX = [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1];

  for (let col = 0; col < cols; col++) {
    expect(grid.points[col]).toMatchObject({ x: pinnedX[col], y: -1 });
    expect(grid.points[lastRowStart + col]).toMatchObject({ x: pinnedX[col], y: 1 });
  }
});
