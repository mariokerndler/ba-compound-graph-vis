import type { GraphEdge } from "./edge";
import type { GraphSet } from "./set";
import type { GraphVertex } from "./vertex";

export interface Graph {
    readonly vertices: GraphVertex[];
    readonly edges: GraphEdge[];
    readonly sets: GraphSet[];
}

export function defineGraphWithDefaults(): Graph {
    return {
        vertices: [],
        edges: [],
        sets: []
    };
}