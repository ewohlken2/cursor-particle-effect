type Vec2 = { x: number; y: number };

export const clampPosition = (p: Vec2, bound: number): Vec2 => ({
  x: Math.max(-bound, Math.min(bound, p.x)),
  y: Math.max(-bound, Math.min(bound, p.y)),
});

export const resolvePairCollision = (a: Vec2, b: Vec2, radius: number) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy) || 1;
  const minDist = radius;
  if (dist >= minDist) return { aOut: a, bOut: b };
  const push = (minDist - dist) / 2;
  const nx = dx / dist;
  const ny = dy / dist;
  return {
    aOut: { x: a.x - nx * push, y: a.y - ny * push },
    bOut: { x: b.x + nx * push, y: b.y + ny * push },
  };
};
