import * as THREE from "three";

type FieldGeometryOptions = {
  cols: number;
  rows: number;
  width: number;
  height: number;
};

// Builds a deterministic anchor grid with per-point seed/phase attributes.
export const createFieldGeometry = ({ cols, rows, width, height }: FieldGeometryOptions) => {
  const count = cols * rows;
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const phases = new Float32Array(count);

  let i = 0;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const u = cols === 1 ? 0.5 : x / (cols - 1);
      const v = rows === 1 ? 0.5 : y / (rows - 1);

      positions[i * 3 + 0] = (u - 0.5) * width;
      positions[i * 3 + 1] = (v - 0.5) * height;
      positions[i * 3 + 2] = 0;

      const s = (Math.sin((x + 1) * 12.9898 + (y + 1) * 78.233) * 43758.5453) % 1;
      const seed = s < 0 ? s + 1 : s;
      seeds[i] = seed;
      phases[i] = seed * Math.PI * 2;

      i++;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

  return geometry;
};
