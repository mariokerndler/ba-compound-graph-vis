const schemeCategory10 = [
  "#1f77b4",
  "#ff7f0e",
  "#2ca02c",
  "#d62728",
  "#9467bd",
  "#8c564b",
  "#e377c2",
  "#7f7f7f",
  "#bcbd22",
  "#17becf",
];

const colorDomain = new Map<string, string>();

export function ColorScale(value: string): string {
  const color = colorDomain.get(value);
  if (color !== undefined) return color;

  const nextColor = schemeCategory10[colorDomain.size % schemeCategory10.length];
  colorDomain.set(value, nextColor);
  return nextColor;
}

export const maxSets: number = 10;

export const maxEgoNetDepth: number = 10;
