export function Interpolate(x: number, n: number, m: number): number {
  x = Math.max(0, Math.min(x, n));
  const t = x / n;
  const result = t * m;

  return result;
}

export function MapValueToColor(value: number): string {
  const clampedValue = Math.min(1, Math.max(0, value));
  const r = Math.round(255 * (1 - clampedValue));
  const g = Math.round(255 * (1 - clampedValue));
  const b = Math.round(255 * (1 - clampedValue));
  const a = 1;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
