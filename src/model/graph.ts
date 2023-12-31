import type { SimulationLinkDatum, SimulationNodeDatum } from "d3";
export interface Graph {
  readonly name: string;
  readonly vertices: GraphVertex[];
  readonly edges: GraphEdge[];
  readonly sets: Graph[];
}

export interface GraphEdge extends SimulationLinkDatum<GraphVertex> {
  readonly source: GraphVertex;
  readonly target: GraphVertex;
  readonly edge: string;
  readonly distance: number;
  readonly set: string;
}

export interface GraphVertex extends SimulationNodeDatum {
  readonly name: string;
  readonly sets: string[];
  readonly neighbours: string[];
}

export function defineGraphWithDefaults(): Graph {
  return {
    name: "Graph",
    vertices: [],
    edges: [],
    sets: [],
  };
}
