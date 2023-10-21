import type { SimulationNodeDatum } from "d3";

export interface GraphVertex extends SimulationNodeDatum {
    readonly id: string;
    
    x?: number | undefined;
    y?: number | undefined;
    fx?: number | undefined;
    fy?: number | undefined;
}