import "../style.css";
import * as THREE from "three";
import vertexShader from "./shaders/field.vert.glsl?raw";
import fragmentShader from "./shaders/field.frag.glsl?raw";
import { createFieldGeometry } from "./geometry";
import { lerp } from "../motion";

const CONFIG = {
  grid: {
    cols: 25,
    rows: 25,
    width: 2.2,
    height: 1.4,
  },
  uniforms: {
    pointScale: 14.0,
    flowAmp: 0.003,
    waveAmp: 0.06,
    jitterAmp: 0.02,
    lensMode: 1,
    lensRadius: 3,
    lensStrength: 0.2,
    swirlStrength: 0.0,
    vortexFreq: 100.0,
    vortexSpeed: 4.0,
  },

  mouse: {
    follow: 0.12,
    velocityFollow: 0.2,
    minDt: 0.0001,
  },
} as const;

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("Missing #app element");
}

// Entry point for the field-driven particle plane rendered at `/field`.
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

// Anchor grid: points never store velocity; motion comes from shader fields.
const geometry = createFieldGeometry(CONFIG.grid);

// Field/lens uniforms drive all motion in the vertex shader.
const uniforms = {
  uTime: { value: 0 },
  uMouse: { value: new THREE.Vector2(0, 0) },
  uMouseV: { value: new THREE.Vector2(0, 0) },
  uPointScale: { value: CONFIG.uniforms.pointScale },
  uFlowAmp: { value: CONFIG.uniforms.flowAmp },
  uWaveAmp: { value: CONFIG.uniforms.waveAmp },
  uJitterAmp: { value: CONFIG.uniforms.jitterAmp },
  uLensMode: { value: CONFIG.uniforms.lensMode },
  uLensRadius: { value: CONFIG.uniforms.lensRadius },
  uLensStrength: { value: CONFIG.uniforms.lensStrength },
  uSwirlStrength: { value: CONFIG.uniforms.swirlStrength },
  uVortexFreq: { value: CONFIG.uniforms.vortexFreq },
  uVortexSpeed: { value: CONFIG.uniforms.vortexSpeed },
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

// Smooth cursor to keep lens deformation stable and fluid.
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
    lerp(currentMouse.x, targetMouse.x, CONFIG.mouse.follow),
    lerp(currentMouse.y, targetMouse.y, CONFIG.mouse.follow),
  );

  const safeDt = Math.max(dt, CONFIG.mouse.minDt);
  const vx = (currentMouse.x - lastMouse.x) / safeDt;
  const vy = (currentMouse.y - lastMouse.y) / safeDt;
  currentMouseV.set(
    lerp(currentMouseV.x, vx, CONFIG.mouse.velocityFollow),
    lerp(currentMouseV.y, vy, CONFIG.mouse.velocityFollow),
  );
  lastMouse = currentMouse.clone();

  uniforms.uMouse.value.copy(currentMouse);
  uniforms.uMouseV.value.copy(currentMouseV);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();
