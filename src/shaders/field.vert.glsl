uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uMouseV;
uniform float uPointScale;
uniform float uFlowAmp;
uniform float uWaveAmp;
uniform float uJitterAmp;
uniform float uLensRadius;
uniform float uLensStrength;
uniform float uSwirlStrength;

attribute float aSeed;
attribute float aPhase;

varying float vDepth;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float value = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amp * noise(p);
    p *= 2.02;
    amp *= 0.5;
  }
  return value;
}

vec2 curlLike(vec2 p, float t) {
  float n1 = fbm(p + vec2(0.0, t));
  float n2 = fbm(p + vec2(5.2, t * 0.7));
  vec2 v = vec2(n1 - 0.5, n2 - 0.5);
  return vec2(-v.y, v.x);
}

void main() {
  vec3 base = position;
  float t = uTime;

  vec2 flow = curlLike(base.xy * 1.4, t * 0.25) * uFlowAmp;
  float wave = sin((base.x + base.y) * 3.0 + t * 0.6 + aPhase);
  vec2 waves = vec2(wave, sin(base.x * 2.2 - t * 0.5)) * uWaveAmp;
  vec2 jitter = (vec2(fbm(base.xy * 6.0 + t * 1.6), fbm(base.xy * 6.0 - t * 1.3)) - 0.5) * uJitterAmp;

  vec2 offset = flow + waves + jitter;

  vec2 dir = base.xy - uMouse;
  float dist = length(dir);
  float falloff = smoothstep(uLensRadius, 0.0, dist);
  vec2 normDir = dist > 0.0001 ? dir / dist : vec2(0.0, 1.0);
  vec2 push = normDir * falloff * uLensStrength;
  vec2 swirl = vec2(-normDir.y, normDir.x) * falloff * uSwirlStrength * (1.0 + length(uMouseV));

  vec3 displaced = base + vec3(offset + push + swirl, 0.0);

  float z = fbm(base.xy * 1.3 + t * 0.15);
  vDepth = z;

  gl_Position = vec4(displaced, 1.0);
  gl_PointSize = uPointScale * (0.6 + z * 0.8);
}
