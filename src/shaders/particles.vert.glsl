uniform float uTime;
uniform vec2 uCursor;

attribute float aSeed;
attribute float aRadius;
attribute float aAngle;
attribute float aBand;
attribute float aHue;

varying float vHue;

void main() {
  float t = uTime;
  float pulse = 1.0 + 0.15 * sin(t * 0.4 + aSeed * 6.2831853) + 0.08 * sin(t * 0.17);
  float angle = aAngle + t * 0.2 + aSeed * 2.0;
  float r = aRadius * pulse;

  // Low-cost turbulence to keep motion organic.
  float wobble = 0.02 * sin(t * 0.8 + aSeed * 12.0);
  vec2 offset = vec2(cos(angle), sin(angle)) * r;
  offset += vec2(-sin(angle), cos(angle)) * wobble;

  vec2 pos = uCursor + offset;

  // Size profile: mid-band larger, center/edge smaller.
  float band = aBand;
  float sizeCurve = 4.0 * band * (1.0 - band);
  float baseSize = mix(2.0, 8.0, sizeCurve);
  float sizePulse = 1.0 + 0.15 * sin(t * 0.6 + aSeed * 4.0);

  vHue = aHue + t * 0.03 + band * 0.08;

  vec4 mvPosition = vec4(pos, 0.0, 1.0);
  gl_Position = mvPosition;
  gl_PointSize = baseSize * sizePulse;
}
