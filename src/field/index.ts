import "../style.css";
import * as THREE from "three";
import vertexShader from "./shaders/field.vert.glsl?raw";
import fragmentShader from "./shaders/field.frag.glsl?raw";
import { createFieldGeometry } from "./geometry";
import { lerp } from "../motion";

const CONFIG = {
  grid: {
    cols: 25,
    rows: 30,
    width: 2.2,
    height: 2,
  },
  uniforms: {
    pointScale: 14.0,
    flowAmp: 0.003,
    waveAmp: 0.06,
    jitterAmp: 0.002,
    lensType: 2,
    lensRadius: 0.8,
    lensStrength: 0.3,
    swirlStrength: 0.0,
    vortexFreq: 0,
    vortexSpeed: 0.002,
    oscillateAmp: 0.2,
    oscillateFreq: 1.0,
    oscillateSpeed: 1.0,
    oscillateDirJitter: 0,
    oscillateWobbleAmp: 0,
    oscillateWobbleSpeed: 0.8,
    sizeFalloffInnerStart: 0.6,
    sizeFalloffInnerRate: 4,
    sizeFalloffOuterStart: 0.8,
    sizeFalloffOuterRate: 8,
  },

  mouse: {
    follow: 0.025,
    velocityFollow: 0.02,
    dirFollow: 0.02,
    dirMinSpeed: 0.0005,
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
  uLensCenter: { value: new THREE.Vector2(0, 0) },
  uLensDir: { value: new THREE.Vector2(1, 0) },
  uPointScale: { value: CONFIG.uniforms.pointScale },
  uFlowAmp: { value: CONFIG.uniforms.flowAmp },
  uWaveAmp: { value: CONFIG.uniforms.waveAmp },
  uJitterAmp: { value: CONFIG.uniforms.jitterAmp },
  uLensType: { value: CONFIG.uniforms.lensType },
  uLensRadius: { value: CONFIG.uniforms.lensRadius },
  uLensStrength: { value: CONFIG.uniforms.lensStrength },
  uSwirlStrength: { value: CONFIG.uniforms.swirlStrength },
  uVortexFreq: { value: CONFIG.uniforms.vortexFreq },
  uVortexSpeed: { value: CONFIG.uniforms.vortexSpeed },
  uOscillateAmp: { value: CONFIG.uniforms.oscillateAmp },
  uOscillateFreq: { value: CONFIG.uniforms.oscillateFreq },
  uOscillateSpeed: { value: CONFIG.uniforms.oscillateSpeed },
  uOscillateDirJitter: { value: CONFIG.uniforms.oscillateDirJitter },
  uOscillateWobbleAmp: { value: CONFIG.uniforms.oscillateWobbleAmp },
  uOscillateWobbleSpeed: { value: CONFIG.uniforms.oscillateWobbleSpeed },
  uSizeFalloffInnerStart: { value: CONFIG.uniforms.sizeFalloffInnerStart },
  uSizeFalloffInnerRate: { value: CONFIG.uniforms.sizeFalloffInnerRate },
  uSizeFalloffOuterStart: { value: CONFIG.uniforms.sizeFalloffOuterStart },
  uSizeFalloffOuterRate: { value: CONFIG.uniforms.sizeFalloffOuterRate },
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
const currentLensDir = new THREE.Vector2(1, 0);
let lastMouse = new THREE.Vector2(0, 0);
let hasPointer = false;

const updateTarget = (x: number, y: number) => {
  const nx = (x / window.innerWidth) * 2 - 1;
  const ny = -(y / window.innerHeight) * 2 + 1;
  targetMouse.set(nx, ny);
};

window.addEventListener("pointermove", (event) => {
  updateTarget(event.clientX, event.clientY);
  hasPointer = true;
});

window.addEventListener("pointerleave", () => {
  hasPointer = false;
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
  uniforms.uLensCenter.value.copy(currentMouse);

  const speed = currentMouseV.length();
  if (hasPointer && speed > CONFIG.mouse.dirMinSpeed) {
    const dir = currentMouseV.clone().normalize();
    currentLensDir
      .set(
        lerp(currentLensDir.x, dir.x, CONFIG.mouse.dirFollow),
        lerp(currentLensDir.y, dir.y, CONFIG.mouse.dirFollow),
      )
      .normalize();
  }
  uniforms.uLensDir.value.copy(currentLensDir);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();
