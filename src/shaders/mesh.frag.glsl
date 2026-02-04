precision mediump float;

uniform vec3 uColor;
varying float vAlpha;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float alpha = smoothstep(0.5, 0.0, d);
  vec3 color = mix(uColor * 1.2, uColor * 0.6, d * 2.0);
  gl_FragColor = vec4(color, alpha * vAlpha);
}
