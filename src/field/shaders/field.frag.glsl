precision highp float;

varying float vDepth;

void main() {
  // Soft disc with depth-tinted color for subtle fake depth.
  vec2 uv = gl_PointCoord.xy - 0.5;
  float d = length(uv) * 2.0;
  float alpha = smoothstep(1.0, 0.0, d);
  vec3 color = mix(vec3(0.35, 0.7, 1.0), vec3(0.75, 0.9, 1.0), vDepth);
  gl_FragColor = vec4(color, alpha * (0.4 + vDepth * 0.7));
}
