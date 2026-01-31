import { expect, test } from "vitest";
import { adjustWaveIntensity, clampWaveIntensity } from "./wave";

test("clampWaveIntensity keeps values within bounds", () => {
  expect(clampWaveIntensity(-1)).toBe(0);
  expect(clampWaveIntensity(0.2)).toBe(0.2);
  expect(clampWaveIntensity(2)).toBe(0.6);
});

test("adjustWaveIntensity steps up and down", () => {
  expect(adjustWaveIntensity(0.2, 1)).toBeCloseTo(0.25);
  expect(adjustWaveIntensity(0.2, -1)).toBeCloseTo(0.15);
});

