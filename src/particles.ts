import * as THREE from "three";

export const createParticles = (count: number) => {
  const geometry = new THREE.BufferGeometry();
  const seeds = new Float32Array(count);
  const radii = new Float32Array(count);
  const angles = new Float32Array(count);
  const bands = new Float32Array(count);
  const hues = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    seeds[i] = Math.random();
    radii[i] = 0.05 + Math.random() * 0.25;
    angles[i] = Math.random() * Math.PI * 2;
    bands[i] = Math.random();
    hues[i] = Math.random();
  }

  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  geometry.setAttribute("aRadius", new THREE.BufferAttribute(radii, 1));
  geometry.setAttribute("aAngle", new THREE.BufferAttribute(angles, 1));
  geometry.setAttribute("aBand", new THREE.BufferAttribute(bands, 1));
  geometry.setAttribute("aHue", new THREE.BufferAttribute(hues, 1));

  return geometry;
};
