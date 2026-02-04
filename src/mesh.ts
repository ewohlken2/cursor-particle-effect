import "./style.css";
import * as THREE from "three";
import vertexShader from "./shaders/mesh.vert.glsl?raw";
import fragmentShader from "./shaders/mesh.frag.glsl?raw";
import { createGrid, stepGrid } from "./mesh-grid";
import { visibilityForDistance } from "./mesh-visibility";

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
  bound: 1,
  stiffness: 0.45,
  iterations: 4,
  collisionRadius: 0.04,
});

const geometry = new THREE.BufferGeometry();
geometry.setAttribute("position", new THREE.BufferAttribute(grid.positions, 3));
const alphaAttribute = new THREE.BufferAttribute(new Float32Array(grid.points.length), 1);
geometry.setAttribute("aAlpha", alphaAttribute);

const hoverConfig = {
  innerRadius: 0.35,
  outerRadius: 0.7,
  maxAlpha: 1,
};

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

const mouse = new THREE.Vector2(0, 0);
let hasPointer = false;

const setMouseFromEvent = (event: PointerEvent) => {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
  hasPointer = true;
};

renderer.domElement.addEventListener("pointermove", setMouseFromEvent);
renderer.domElement.addEventListener("pointerdown", setMouseFromEvent);
renderer.domElement.addEventListener("pointerleave", () => {
  hasPointer = false;
});

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const clock = new THREE.Clock();

const animate = () => {
  const elapsed = clock.getElapsedTime();
  stepGrid(grid, elapsed);
  const { innerRadius, outerRadius, maxAlpha } = hoverConfig;
  for (let i = 0; i < grid.points.length; i++) {
    const p = grid.points[i];
    const dx = p.x - mouse.x;
    const dy = p.y - mouse.y;
    const dist = Math.hypot(dx, dy);
    const vis = hasPointer ? visibilityForDistance(dist, innerRadius, outerRadius) : 1;
    alphaAttribute.array[i] = vis * maxAlpha;
  }
  alphaAttribute.needsUpdate = true;
  geometry.attributes.position.needsUpdate = true;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();
