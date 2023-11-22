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

export function ApplyOpacityToHexColor(hexColor: string, opacity: number): string {
  // Ensure opacity is within the valid range [0, 1]
  opacity = Math.min(1, Math.max(0, opacity));

  // Parse the hex color code and extract RGB values
  const hex = hexColor.replace(/^#/, "");
  const bigint = parseInt(hex, 16);
  const red = (bigint >> 16) & 255;
  const green = (bigint >> 8) & 255;
  const blue = bigint & 255;

  // Convert RGB values to rgba format with the specified opacity
  const rgbaColor = `rgba(${red}, ${green}, ${blue}, ${opacity})`;

  return rgbaColor;
}
