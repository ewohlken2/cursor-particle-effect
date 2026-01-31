export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const sizeFromBand = (band: number) => {
  const x = Math.max(0, Math.min(1, band));
  // Simple bell curve; peaks mid-band, smallest at edges.
  return 4 * x * (1 - x);
};

export const pulse = (seed: number, t: number) => {
  return Math.sin(t * 0.4 + seed * 6.28318530718);
};
