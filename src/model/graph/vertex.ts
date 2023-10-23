import type { SimulationNodeDatum } from "d3";

export interface GraphVertex extends SimulationNodeDatum {
    readonly id: string;
}