import "./style.css";
import * as THREE from "three";
import vertexShader from "./shaders/mesh.vert.glsl?raw";
import fragmentShader from "./shaders/mesh.frag.glsl?raw";
import { createGrid, stepGrid } from "./mesh-grid";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("Missing #app element");
}

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const grid = createGrid({
  cols: 24,
  rows: 14,
  spacing: 0.085,
  bound: 0.95,
  stiffness: 0.45,
  iterations: 4,
  collisionRadius: 0.04,
});

const geometry = new THREE.BufferGeometry();
geometry.setAttribute("position", new THREE.BufferAttribute(grid.positions, 3));

const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  uniforms: {
    uPointSize: { value: 5.5 },
    uColor: { value: new THREE.Color("#6bd6ff") },
  },
});

const points = new THREE.Points(geometry, material);
scene.add(points);

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const clock = new THREE.Clock();

const animate = () => {
  const elapsed = clock.getElapsedTime();
  stepGrid(grid, elapsed);
  geometry.attributes.position.needsUpdate = true;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();
