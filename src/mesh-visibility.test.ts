import { expect, test } from "vitest";
import { visibilityForDistance } from "./mesh-visibility";

test("visibilityForDistance falls off smoothly between inner and outer radius", () => {
  const inner = 0.4;
  const outer = 0.8;

  expect(visibilityForDistance(0, inner, outer)).toBe(1);
  expect(visibilityForDistance(inner, inner, outer)).toBe(1);
  expect(visibilityForDistance(outer, inner, outer)).toBe(0);
  expect(visibilityForDistance(1.2, inner, outer)).toBe(0);

  const mid = visibilityForDistance(0.6, inner, outer);
  expect(mid).toBeGreaterThan(0);
  expect(mid).toBeLessThan(1);
});
