import type { Graph } from "../model/graph";
import {
  HypervertexType,
  type Hyperedge,
  type Hypergraph,
  type Hypervertex,
} from "../model/hypergraph.";
import {
  graphObjectStore,
  hoverStore,
  vertexHoverStore,
} from "../store/GraphStore";
import {
  AddSetToLocalTopologyViewStore,
  LocalTopologyViewStoreHasSet,
  RemoveSetFromLocalTopologyViewStore,
} from "./StoreUtil";

export function Interpolate(x: number, n: number, m: number): number {
  x = Math.max(0, Math.min(x, n));
  const t = x / n;
  const result = t * m;

  return result;
}

export function MapValueToColor(value: number, alpha: number = 1): string {
  const clampedValue = Math.min(1, Math.max(0, value));
  const r = Math.round(255 * (1 - clampedValue));
  const g = Math.round(255 * (1 - clampedValue));
  const b = Math.round(255 * (1 - clampedValue));
  const a = alpha;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function ApplyOpacityToHexColor(
  hexColor: string,
  opacity: number,
): string {
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
    const interpolatedValue = Math.round(
      startValue + value * (endValue - startValue),
    );
    return Math.min(255, Math.max(0, interpolatedValue)); // Ensure the value is within the valid range [0, 255]
  });

  return rgbToHex(
    interpolatedColor[0],
    interpolatedColor[1],
    interpolatedColor[2],
  );
}

export function GetSize(vertex: Hypervertex): number {
  let size: number = vertex.size;

  if (vertex.type === HypervertexType.SET) {
    if (size < 5) size = 5;
    if (size > 35) size = 35;
  }

  if (vertex.type === HypervertexType.VERTEX) {
    size = 10;
  }

  return size;
}

export function GetColor(
  hypergraph: Hypergraph,
  colors: Map<string, string>,
  vertex: Hypervertex,
  hover: string[],
): string {
  if (colors === undefined) return "grey";

  switch (vertex.type) {
    case HypervertexType.SET:
      const color = colors.get(vertex.name);

      if (color !== undefined) {
        return color;
      } else {
        return "grey";
      }
    case HypervertexType.VERTEX:
      const graphSize = hypergraph.vertices.filter(
        (vert) => vert.type === HypervertexType.SET,
      ).length;

      const value = Interpolate(vertex.size, graphSize, 1);
      let col = MapValueToColor(value);

      if (hover !== undefined && hover.length > 0) {
        graphObjectStore.subscribe((graph) => {
          const set = graph.sets.find((s) => s.name === hover[0]);
          if (set) {
            const vert = set.vertices.find((v) => v.name === vertex.name);
            if (vert) {
              col = MapValueToColor(value);
            } else {
              col = MapValueToColor(value, 0.3);
            }
          }
        });
      }

      return col;
  }
}

export function GetStroke(hover: string[], vertex: Hypervertex): string {
  if (hover === undefined) return "none";

  return hover.includes(vertex.name) ? "#2c3e50" : "none";
}

export function OnGlobalNodeMouseEnter(
  name: string,
  tooltip: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
  isVertex: boolean = false,
) {
  tooltip.style("visibility", "visible").text(name);
  if (isVertex) vertexHoverStore.set([name]);
  hoverStore.set([name]);
}

export function OnGlobalNodeMouseExit(
  tooltip: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
  isVertex: boolean = false,
) {
  tooltip.style("visibility", "hidden");
  if (isVertex) vertexHoverStore.set([]);
  hoverStore.set([]);
}

export function OnGlobalNodeClick(graph: Graph, vertex: Hypervertex) {
  if (graph === undefined) return;

  const set: Graph = graph.sets.filter((s) => s.name === vertex.name)[0];

  if (LocalTopologyViewStoreHasSet(set)) {
    RemoveSetFromLocalTopologyViewStore(set);
  } else {
    AddSetToLocalTopologyViewStore(set);
  }
}

export function GetEdgeOpacity(hover: string[], edge: Hyperedge): number {
  if (hover === undefined || hover.length <= 0) return 0.7;

  if (hover.includes(edge.source.name) || hover.includes(edge.target.name)) {
    return 1;
  }

  return 0.2;
}
