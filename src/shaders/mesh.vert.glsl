uniform float uPointSize;
attribute float aAlpha;
varying float vAlpha;

void main() {
  gl_Position = vec4(position, 1.0);
  gl_PointSize = uPointSize;
  vAlpha = aAlpha;
}
