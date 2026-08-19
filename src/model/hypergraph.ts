import type { SimulationLinkDatum, SimulationNodeDatum } from "d3";

export enum HypervertexType {
  VERTEX = "vertex",
  SET = "set",
}

export interface Hypergraph {
  readonly name: string;
  readonly vertices: Hypervertex[];
  readonly edges: Hyperedge[];
}

export interface Hypervertex extends SimulationNodeDatum {
  name: string;
  readonly type: HypervertexType;
  readonly size: number;
}

export interface Hyperedge extends SimulationLinkDatum<Hypervertex> {
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
