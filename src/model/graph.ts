export interface Graph {
  readonly name: string;
  readonly vertices: GraphVertex[];
  readonly edges: GraphEdge[];
  readonly sets: Graph[];
}

interface ForceNodeDatum {
  index?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphEdge {
  readonly index?: number;
  readonly source: GraphVertex;
  readonly target: GraphVertex;
  readonly edge: string;
  readonly distance: number;
  readonly set: string;
}

export interface GraphVertex extends ForceNodeDatum {
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
