import type { SimulationLinkDatum } from "d3";
import type { GraphVertex } from "./vertex";

export interface GraphEdge extends SimulationLinkDatum<GraphVertex> {
    readonly source: GraphVertex;
    readonly target: GraphVertex;
    readonly edge: string;
}