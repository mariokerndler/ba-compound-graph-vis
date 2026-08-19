export enum HypervertexType {
  VERTEX = "vertex",
  SET = "set",
}

export interface Hypergraph {
  readonly name: string;
  readonly vertices: Hypervertex[];
  readonly edges: Hyperedge[];
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

export interface Hypervertex extends ForceNodeDatum {
  name: string;
  readonly type: HypervertexType;
  readonly size: number;
}

export interface Hyperedge {
  readonly index?: number;
  readonly source: Hypervertex;
  readonly target: Hypervertex;
  thickness: number;
}

export function defineHypergraphWithDefaults(): Hypergraph {
  return {
    name: "Hypergraph",
    vertices: [],
    edges: [],
  };
}
