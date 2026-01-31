import * as THREE from "three";

export const createParticles = (count: number) => {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const radii = new Float32Array(count);
  const angles = new Float32Array(count);
  const bands = new Float32Array(count);
  const hues = new Float32Array(count);

  const minRadius = 0.03;
  const maxRadius = 0.35;
  const range = maxRadius - minRadius;

  for (let i = 0; i < count; i++) {
    const radius = minRadius + Math.random() * range;
    const idx = i * 3;

    // Required by three.js to determine draw count; positions are unused in shader.
    positions[idx] = 0;
    positions[idx + 1] = 0;
    positions[idx + 2] = 0;

    seeds[i] = Math.random();
    radii[i] = radius;
    angles[i] = Math.random() * Math.PI * 2;
    bands[i] = (radius - minRadius) / range;
    hues[i] = Math.random();
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  geometry.setAttribute("aRadius", new THREE.BufferAttribute(radii, 1));
  geometry.setAttribute("aAngle", new THREE.BufferAttribute(angles, 1));
  geometry.setAttribute("aBand", new THREE.BufferAttribute(bands, 1));
  geometry.setAttribute("aHue", new THREE.BufferAttribute(hues, 1));

  return geometry;
};
