import { expect, test } from "vitest";
import { lerp, sizeFromBand, pulse } from "./motion";

test("lerp moves toward target", () => {
  expect(lerp(0, 10, 0.1)).toBeCloseTo(1);
});

test("sizeFromBand peaks near middle", () => {
  const mid = sizeFromBand(0.5);
  const edge = sizeFromBand(0.0);
  expect(mid).toBeGreaterThan(edge);
});

test("pulse varies over time", () => {
  const a = pulse(0, 0.0);
  const b = pulse(0, 10.0);
  expect(a).not.toBe(b);
});
