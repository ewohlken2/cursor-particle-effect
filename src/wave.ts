const MIN_INTENSITY = 0;
const MAX_INTENSITY = 0.6;
const STEP = 0.05;

export const clampWaveIntensity = (value: number) => {
  return Math.max(MIN_INTENSITY, Math.min(MAX_INTENSITY, value));
};

export const adjustWaveIntensity = (current: number, direction: number) => {
  return clampWaveIntensity(current + STEP * direction);
};

