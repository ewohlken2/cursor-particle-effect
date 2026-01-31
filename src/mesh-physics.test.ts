import { expect, test } from "vitest";
import { clampPosition, resolvePairCollision } from "./mesh-physics";

test("clampPosition keeps points within bounds", () => {
  expect(clampPosition({ x: -2, y: 0 }, 1)).toEqual({ x: -1, y: 0 });
  expect(clampPosition({ x: 0.5, y: 2 }, 1)).toEqual({ x: 0.5, y: 1 });
});

test("resolvePairCollision separates overlapping points", () => {
  const a = { x: 0, y: 0 };
  const b = { x: 0.01, y: 0 };
  const { aOut, bOut } = resolvePairCollision(a, b, 0.05);
  const dist = Math.hypot(aOut.x - bOut.x, aOut.y - bOut.y);
  expect(dist).toBeGreaterThanOrEqual(0.05);
});
