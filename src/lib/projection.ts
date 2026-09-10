// Lightweight isometric-style projection so trajectory points can be drawn
// with plain SVG and rotated with a single angle control, no 3D engine needed.

export function project(x: number, y: number, z: number, angleDeg: number, scale = 18) {
  const angle = (angleDeg * Math.PI) / 180;
  const rx = x * Math.cos(angle) - y * Math.sin(angle);
  const ry = x * Math.sin(angle) + y * Math.cos(angle);
  const screenX = rx * scale;
  const screenY = ry * scale * 0.42 - z * scale * 1.6;
  return { screenX, screenY };
}
