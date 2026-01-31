import "./style.css";
import * as THREE from "three";
import vertexShader from "./shaders/particles.vert.glsl?raw";
import fragmentShader from "./shaders/particles.frag.glsl?raw";
import { createParticles } from "./particles";
import { lerp } from "./motion";
import { adjustWaveIntensity } from "./wave";

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

const uniforms = {
  uTime: { value: 0 },
  uCursor: { value: new THREE.Vector2(0, 0) },
  uWaveIntensity: { value: 0.25 },
};

const geometry = createParticles(160);
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  uniforms,
});

const points = new THREE.Points(geometry, material);
scene.add(points);

const targetCursor = new THREE.Vector2(0, 0);
const currentCursor = new THREE.Vector2(0, 0);

let targetWaveIntensity = uniforms.uWaveIntensity.value;
let currentWaveIntensity = uniforms.uWaveIntensity.value;

const updateTargetCursor = (x: number, y: number) => {
  const nx = (x / window.innerWidth) * 2 - 1;
  const ny = -(y / window.innerHeight) * 2 + 1;
  targetCursor.set(nx, ny);
};

window.addEventListener("mousemove", (event) => {
  updateTargetCursor(event.clientX, event.clientY);
});

window.addEventListener("mouseleave", () => {
  targetCursor.set(0, 0);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp") {
    targetWaveIntensity = adjustWaveIntensity(targetWaveIntensity, 1);
  }
  if (event.key === "ArrowDown") {
    targetWaveIntensity = adjustWaveIntensity(targetWaveIntensity, -1);
  }
});

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const clock = new THREE.Clock();

const animate = () => {
  const elapsed = clock.getElapsedTime();
  uniforms.uTime.value = elapsed;

  currentCursor.set(
    lerp(currentCursor.x, targetCursor.x, 0.12),
    lerp(currentCursor.y, targetCursor.y, 0.12)
  );
  uniforms.uCursor.value.copy(currentCursor);

  currentWaveIntensity = lerp(currentWaveIntensity, targetWaveIntensity, 0.08);
  uniforms.uWaveIntensity.value = currentWaveIntensity;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();
