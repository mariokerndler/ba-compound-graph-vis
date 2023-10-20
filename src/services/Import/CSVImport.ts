import type { CustomGraph, CustomLink, CustomNode, CustomType } from "../../types/Graph";
import { defineGraph, defineLink, defineNode } from 'd3-graph-controller';

export class CSVImport {

    async import(matrix: string, edgeList: string[]): Promise<CustomGraph> {
        const graph: CustomGraph = defineGraph<CustomType, CustomNode, CustomLink>({
            nodes: [],
            links: [],
        });
        
        return new Promise((resolve) => {
            resolve(graph);
        });
    }
    
}
