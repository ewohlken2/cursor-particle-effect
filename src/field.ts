import "./style.css";
import * as THREE from "three";
import vertexShader from "./shaders/field.vert.glsl?raw";
import fragmentShader from "./shaders/field.frag.glsl?raw";
import { createFieldGeometry } from "./field-geometry";
import { lerp } from "./motion";

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

const geometry = createFieldGeometry({ cols: 200, rows: 120, width: 2.2, height: 1.4 });

const uniforms = {
  uTime: { value: 0 },
  uMouse: { value: new THREE.Vector2(0, 0) },
  uMouseV: { value: new THREE.Vector2(0, 0) },
  uPointScale: { value: 140.0 },
  uFlowAmp: { value: 0.09 },
  uWaveAmp: { value: 0.06 },
  uJitterAmp: { value: 0.02 },
  uLensRadius: { value: 0.5 },
  uLensStrength: { value: 0.08 },
  uSwirlStrength: { value: 0.12 },
};

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

const targetMouse = new THREE.Vector2(0, 0);
const currentMouse = new THREE.Vector2(0, 0);
const currentMouseV = new THREE.Vector2(0, 0);
let lastMouse = new THREE.Vector2(0, 0);

const updateTarget = (x: number, y: number) => {
  const nx = (x / window.innerWidth) * 2 - 1;
  const ny = -(y / window.innerHeight) * 2 + 1;
  targetMouse.set(nx, ny);
};

window.addEventListener("pointermove", (event) => {
  updateTarget(event.clientX, event.clientY);
});

window.addEventListener("pointerleave", () => {
  targetMouse.set(0, 0);
});

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const clock = new THREE.Clock();

const animate = () => {
  const elapsed = clock.getElapsedTime();
  const dt = clock.getDelta();
  uniforms.uTime.value = elapsed;

  currentMouse.set(
    lerp(currentMouse.x, targetMouse.x, 0.12),
    lerp(currentMouse.y, targetMouse.y, 0.12)
  );

  const safeDt = Math.max(dt, 0.0001);
  const vx = (currentMouse.x - lastMouse.x) / safeDt;
  const vy = (currentMouse.y - lastMouse.y) / safeDt;
  currentMouseV.set(lerp(currentMouseV.x, vx, 0.2), lerp(currentMouseV.y, vy, 0.2));
  lastMouse = currentMouse.clone();

  uniforms.uMouse.value.copy(currentMouse);
  uniforms.uMouseV.value.copy(currentMouseV);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();
