import type { GraphEdge } from "./edge";
import type { GraphVertex } from "./vertex";

export interface Graph {
  readonly name: string;
  readonly vertices: GraphVertex[];
  readonly edges: GraphEdge[];
  readonly sets: Graph[];
}

export function defineGraphWithDefaults(): Graph {
  return {
    name: "Graph",
    vertices: [],
    edges: [],
    sets: [],
  };
}
