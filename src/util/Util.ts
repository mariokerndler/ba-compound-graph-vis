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

export function InterpolateColor(hex: string, value: number): string {
  // Ensure the value is within the valid range [0, 1]
  value = Math.max(0, Math.min(1, value));

  // Convert hex to RGB
  const hexToRgb = (hex: string): number[] => {
    const bigint = parseInt(hex.slice(1), 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
  };

  // Convert RGB to hex
  const rgbToHex = (r: number, g: number, b: number): string => {
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
  };

  const startColor = hexToRgb(hex);
  const whiteColor = hexToRgb("#ffffff");

  // Interpolate between startColor and whiteColor
  const interpolatedColor = startColor.map((startValue, index) => {
    const endValue = whiteColor[index];
    const interpolatedValue = Math.round(startValue + value * (endValue - startValue));
    return Math.min(255, Math.max(0, interpolatedValue)); // Ensure the value is within the valid range [0, 255]
  });

  return rgbToHex(interpolatedColor[0], interpolatedColor[1], interpolatedColor[2]);
}
