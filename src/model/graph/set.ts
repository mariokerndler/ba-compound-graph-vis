import type { GraphVertex } from "./vertex";

export interface GraphSet {
    readonly name: string;
    readonly vertices: GraphVertex[];
}