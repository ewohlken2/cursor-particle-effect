import { expect, test } from "vitest";
import { createFieldGeometry } from "./geometry";

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
