1. Stop Animating Particles — Animate Fields

The biggest mental shift:

Particles should sample motion from a field, not store motion themselves

Instead of:

particle.position += velocity


Think:

velocity = field(position, time)
position += velocity

Common fields

Curl noise fields (smooth, rotational flow)

Signed distance fields (SDFs) for shape attraction/repulsion

Wave interference fields (multiple sinusoids layered)

This makes motion feel continuous and fluid, not discrete.

2. Curl Noise (Why Everything Looks “Alive”)

Curl noise is the secret sauce behind:

Smoke

Water flow

Organic swarm motion

Key property:

Divergence-free → no collapsing or exploding motion

Particles orbit invisible structures

Conceptually:

curl = ∇ × noise(x, y, z, t)


Use it to:

Rotate particles around invisible wave crests

Create perpetual motion without randomness

💡 This alone instantly upgrades a system from “particles” to “phenomenon.”

3. Layered Time Domains (Micro vs Macro Motion)

Organic motion requires motion at multiple time scales.

Typical layering
Layer	Purpose
Fast noise	Surface jitter, shimmer
Medium waves	Breathing, pulsing
Slow drift	Large spatial movement

Example:

float pulse = sin(time * 0.6);
float wobble = noise(pos * 2.0 + time * 0.3);
float jitter = noise(pos * 10.0 + time * 3.0);

finalOffset = pulse * 0.4 + wobble * 0.4 + jitter * 0.1;


This is why Antigravity feels biological, not mechanical.

4. Mouse Interaction as a Deforming Force (Not Attraction)

Don’t “pull” particles toward the mouse.

Instead:

Treat the mouse as a temporary field distortion

Think gravity lens, not magnet

Techniques

Radial displacement field

Vortex field centered on cursor

Pressure wave that propagates outward

vec2 dir = pos - mouse;
float dist = length(dir);
float influence = smoothstep(radius, 0.0, dist);

pos += normalize(dir) * influence * strength;


Key idea:
Particles flow around the cursor, not into it.

5. Fake 3D Without 3D

Antigravity’s particles often aren’t truly 3D — they feel 3D.

Depth illusions

Z simulated via noise

Perspective scaling

Parallax motion layers

Depth-based blur or brightness

float z = noise(vec3(pos.xy, time));
float scale = mix(0.5, 1.2, z);
float alpha = mix(0.3, 1.0, z);


Your brain does the rest.

6. Phase-Shifted Pulsing (Avoid Synchronized Motion)

Nothing screams “fake” like all particles pulsing together.

Instead:

Give each particle a phase offset

Pulse emerges statistically, not uniformly

float phase = hash(id) * TWO_PI;
float pulse = sin(time * speed + phase);


This produces:

Traveling waves

Breathing clusters

Non-repeating motion

7. Motion via Displacement, Not Velocity

For smooth elegance:

Avoid velocity accumulation

Use position = base + deformation

vec3 base = initialPosition;
vec3 offset = noise(base * freq + time);
position = base + offset * amplitude;


This prevents:

Energy buildup

Numerical instability

“Particle soup”

8. GPU-First Thinking (This Is Mandatory)

Antigravity-level motion cannot be CPU-driven at scale.

Use:

Vertex shaders for motion

Fragment shaders for glow & softness

Uniforms for time, mouse, global state

Conceptually:

position += curlNoise(position + time);
position += mouseField(position);


If you’re using Three.js:

BufferGeometry

Custom ShaderMaterial

Attributes: aSeed, aPhase, aDepth

9. Temporal Coherence > Randomness

Organic motion is:

Predictable locally

Surprising globally

Avoid:

Math.random() per frame

Abrupt direction changes

Prefer:

Continuous noise

Interpolated signals

Easing over time

10. Think Like a Musician

These systems behave more like sound synthesis than animation.

Particles are:

Oscillators

Phase-shifted signals

Modulated by envelopes

That’s why the motion feels rhythmic and intentional.

If you want, next we can:

Break down Antigravity’s motion pattern frame-by-frame

Design a Three.js shader architecture for this

Build a minimal curl-noise + mouse field demo

Convert your existing particle code into a field-driven system

Just tell me what level you want to go to next.

brea dkown th antigravity motion frame by frame, then develop a threejs shared for this
Thought for 36s

I can’t literally inspect Google’s internal shader from here (their page is heavily script-rendered and didn’t expose readable source in the fetch), but we can break down the observable motion and then implement the same class of effect in Three.js: a field-driven point cloud with phase-offset pulsation + curl-ish flow + cursor “lens” distortion. (The screenshots show a sparse dot field that subtly drifts/pulses behind the hero content.)

Motion breakdown, “frame by frame” (what’s happening each RAF tick)

Think of the effect as: static anchor positions + time-varying displacement field (not ballistic particles).

0) Inputs are smoothed

At the start of every frame:

t = elapsedTime

Read raw mouse in NDC: mRaw

Smooth it: m = lerp(m, mRaw, 1 - exp(-dt * mouseFollow))

Compute mouse velocity too: v = (m - mPrev)/dt, also smoothed

Compute a hover/intensity gate (e.g., stronger when cursor is over the hero area)

This smoothing is why it feels “buttery” instead of twitchy.

1) Each point samples a continuous field

Each point has:

p0 = its anchor (never changes)

seed/phase = stable per-point randomness

In the shader you compute:

breath = sin(t*breathFreq + phase) (pulsing, but phase-shifted per point)

flow = curlLikeNoise(p0, t) (organic drift)

waves = interference(p0, t) (slow traveling wave sheets)

Then combine:

offset = flow*flowAmp + waves*waveAmp + normalNoise*jitterAmp

p = p0 + offset

2) Cursor acts like a deforming lens, not an attractor

Near the mouse:

points get pushed + swirled

the field locally “bends”

Typically:

falloff = smoothstep(R, 0, dist(p.xy, mouse))

push = normalize(p.xy - mouse) * falloff * pushAmp

swirl = perpendicular(dir) * falloff * swirlAmp * (1 + speedFactor)

So the cursor creates a controllable vortex + pressure bubble.

3) Fake depth makes it “almost 3D”

You compute a pseudo z from noise:

z = fbm(p0*freq + t*speed)
Then use z to drive:

point size (near = bigger)

alpha/brightness

slight parallax offset

That’s the “almost-3D” quality.

4) Render as soft discs with additive blending

Fragment shader:

soft circular mask in point sprite space

optional glow edge

additive blending = “misty” accumulation

Three.js implementation: shader-driven “Antigravity-like” dot field

Below is a working architecture: Points + ShaderMaterial, with:

anchor positions in a plane

per-point phase/seed

vertex shader builds displacement using fbm noise + cursor lens

fragment shader draws soft dots

Note: This is the “fast path” (no GPGPU). For true particle advection you’d use an FBO sim, but this gets very close to the Antigravity feel while staying simple.

JS/TS (Three.js) setup
import * as THREE from "three";

export function createAntigravityField({
  width = 2.2,
  height = 1.4,
  xCount = 220,
  yCount = 140,
} = {}) {
  const count = xCount * yCount;

  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const phases = new Float32Array(count);

  let i = 0;
  for (let y = 0; y < yCount; y++) {
    for (let x = 0; x < xCount; x++) {
      const u = x / (xCount - 1);
      const v = y / (yCount - 1);

      const px = (u - 0.5) * width;
      const py = (v - 0.5) * height;

      positions[i * 3 + 0] = px;
      positions[i * 3 + 1] = py;
      positions[i * 3 + 2] = 0;

      const s = (Math.sin((x + 1) * 12.9898 + (y + 1) * 78.233) * 43758.5453) % 1;
      seeds[i] = s < 0 ? s + 1 : s;
      phases[i] = seeds[i] * Math.PI * 2;

      i++;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uDt: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },      // NDC-ish in plane space (see note)
      uMouseV: { value: new THREE.Vector2(0, 0) },     // smoothed velocity
      uHover: { value: 0 },                            // 0..1 intensity gate
      uPointScale: { value: 140.0 },                   // tune for DPI
      uFlowAmp: { value: 0.10 },
      uWaveAmp: { value: 0.08 },
      uSwirlAmp: { value: 0.18 },
      uPushAmp: { value: 0.14 },
      uRadius: { value: 0.45 },                        // cursor influence radius in plane units
    },
    vertexShader,
    fragmentShader,
  });

  const points = new THREE.Points(geometry, material);
  return { points, material };
}

Feeding mouse into the shader (important)

If your points live in a plane in world space, convert mouse to plane coords via ray-plane intersection. (That’s the “secret” that makes cursor interaction feel locked to the dots.)

Vertex shader (organic drift + pulsation + cursor lens)
// language=GLSL
precision highp float;

uniform float uTime;
uniform float uDt;
uniform vec2  uMouse;
uniform vec2  uMouseV;
uniform float uHover;

uniform float uPointScale;
uniform float uFlowAmp;
uniform float uWaveAmp;
uniform float uSwirlAmp;
uniform float uPushAmp;
uniform float uRadius;

attribute float aSeed;
attribute float aPhase;

varying float vAlpha;
varying float vGlow;

// --- hash/noise/fbm (fast-ish value noise) ---
float hash21(vec2 p){
  p = fract(p*vec2(123.34, 345.45));
  p += dot(p, p+34.345);
  return fract(p.x*p.y);
}

float noise2(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash21(i);
  float b = hash21(i+vec2(1.0,0.0));
  float c = hash21(i+vec2(0.0,1.0));
  float d = hash21(i+vec2(1.0,1.0));
  vec2 u = f*f*(3.0-2.0*f);
  return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
}

float fbm2(vec2 p){
  float f = 0.0;
  float a = 0.5;
  for(int i=0;i<5;i++){
    f += a * noise2(p);
    p *= 2.02;
    a *= 0.5;
  }
  return f;
}

// “curl-ish” flow from rotated gradients (cheap approximation)
vec2 flowField(vec2 p, float t){
  float e = 0.02;
  float n1 = fbm2(p*1.6 + vec2( 0.0, t*0.25));
  float n2 = fbm2(p*1.6 + vec2( 5.2, t*0.25));
  // gradient-ish
  float gx = fbm2((p+vec2(e,0.0))*1.6 + vec2(0.0,t*0.25)) - n1;
  float gy = fbm2((p+vec2(0.0,e))*1.6 + vec2(0.0,t*0.25)) - n1;
  vec2 grad = vec2(gx, gy) / e;

  // rotate gradient 90° to get divergence-free-ish swirl
  vec2 curl = vec2(-grad.y, grad.x);

  // add a second band to avoid “single-noise” look
  vec2 curl2 = vec2(-(fbm2(p*2.4 + vec2(2.0,t*0.18))-n2), (fbm2(p*2.4 + vec2(2.0,t*0.18))-n2));
  return normalize(curl + 0.35*curl2);
}

void main(){
  vec3 p0 = position;

  // --- layered time domains ---
  float t = uTime;

  // phase-shifted “breathing” (never syncs globally)
  float breath = sin(t*0.7 + aPhase) * 0.5 + 0.5;     // 0..1
  float micro  = fbm2(p0.xy*8.0 + vec2(t*1.5, -t*1.2));

  // slow traveling wave sheets (gives “weave”)
  float w1 = sin(p0.x*2.6 + t*0.9 + aPhase*0.3);
  float w2 = sin(p0.y*2.2 - t*0.8 + aPhase*0.6);
  float waves = (w1 + w2) * 0.5;

  // organic drift (curl-ish)
  vec2 flow = flowField(p0.xy + aSeed*3.1, t);

  // fake depth (almost-3D)
  float z = fbm2(p0.xy*1.7 + vec2(12.0, t*0.22));
  z = z*z; // bias

  // base displacement
  vec2 disp =
      flow * (uFlowAmp * (0.35 + 0.65*breath))
    + vec2(waves) * uWaveAmp * vec2(0.6, 1.0)
    + (micro - 0.5) * 0.03;

  // cursor lens: push + swirl (scaled by hover gate)
  vec2 toP = p0.xy - uMouse;
  float dist = length(toP) + 1e-6;
  float falloff = smoothstep(uRadius, 0.0, dist);
  float speed = clamp(length(uMouseV)*0.35, 0.0, 1.0);

  vec2 dir = toP / dist;
  vec2 perp = vec2(-dir.y, dir.x);

  vec2 push  = dir  * falloff * uPushAmp  * (0.6 + 0.6*speed);
  vec2 swirl = perp * falloff * uSwirlAmp * (0.5 + 0.9*speed);

  disp += (push + swirl) * uHover;

  // final position
  vec3 p = p0 + vec3(disp, 0.0);

  // use z to fake depth via parallax & size/alpha
  p.z += (z - 0.5) * 0.25;

  // alpha + glow tied to breath/depth and cursor influence
  float a = 0.20 + 0.55*z + 0.15*breath;
  a += falloff * 0.35 * uHover;
  vAlpha = clamp(a, 0.05, 1.0);

  vGlow = clamp(0.25 + 0.75*falloff*uHover, 0.0, 1.0);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;

  // point size: depth-scaled, also slightly modulated by breath
  float size = (0.6 + 1.6*z) * (0.85 + 0.3*breath);
  gl_PointSize = uPointScale * size / (-mv.z);
}

Fragment shader (soft dot + subtle glow)
// language=GLSL
precision highp float;

varying float vAlpha;
varying float vGlow;

void main(){
  // point sprite UV in [0..1]
  vec2 uv = gl_PointCoord - 0.5;
  float r = length(uv);

  // core + feather
  float core = smoothstep(0.22, 0.00, r);
  float feather = smoothstep(0.50, 0.18, r);

  float alpha = feather * vAlpha;

  // glow is just a wider, softer contribution
  float glow = smoothstep(0.55, 0.25, r) * vGlow * 0.45;

  // white dots; let additive blending do the “mist”
  vec3 col = vec3(1.0) * (core + glow);

  gl_FragColor = vec4(col, alpha);

  // kill hard square edges
  if(alpha < 0.01) discard;
}

How to drive it in your render loop

Each frame:

update uTime, uDt

update uMouse, uMouseV

update uHover with easing (0→1 when the hero region is hovered)

Key: never directly set uniforms from raw mouse. Always smooth.