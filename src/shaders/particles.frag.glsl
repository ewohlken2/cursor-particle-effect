precision mediump float;

varying float vHue;

vec3 hsl2rgb(vec3 c) {
  vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  rgb = rgb * rgb * (3.0 - 2.0 * rgb);
  return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
}

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float alpha = smoothstep(0.5, 0.0, d);

  vec3 color = hsl2rgb(vec3(fract(vHue), 0.65, 0.55));
  // Softer edge for gas-like appearance.
  color *= mix(1.1, 0.7, d * 2.0);

  gl_FragColor = vec4(color, alpha);
}
