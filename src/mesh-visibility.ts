export const visibilityForDistance = (distance: number, inner: number, outer: number) => {
  if (outer <= inner) {
    return distance <= inner ? 1 : 0;
  }

  if (distance <= inner) return 1;
  if (distance >= outer) return 0;

  const t = (distance - inner) / (outer - inner);
  const smooth = t * t * (3 - 2 * t);
  return 1 - smooth;
};
