import type { SimulationLinkDatum, SimulationNodeDatum } from "d3";

export enum HypernodeType {
  VERTEX = "vertex",
  SET = "set",
}

export interface Hypergraph {
  readonly name: string;
  readonly vertices: Hypervertex[];
  readonly edges: Hyperedge[];
}

export interface Hypervertex extends SimulationNodeDatum {
  readonly name: string;
  readonly type: HypernodeType;
  readonly size: number;
}

export interface Hyperedge extends SimulationLinkDatum<Hypervertex> {
  readonly source: Hypervertex;
  readonly target: Hypervertex;
}

export function defineHypergraphWithDefaults(): Hypergraph {
  return {
    name: "Hypergraph",
    vertices: [],
    edges: [],
  };
}
