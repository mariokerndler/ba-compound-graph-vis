import { Graph, Vertex as GVertex} from "../types/Graph";
import { type Edge, type JSONGraphDTO, type Vertex, type Set } from "../types/JSONGraphDTO";
import type { DataImport } from "./DataImport";

export class JSONImport implements DataImport {

    import(data: string): Promise<Graph<string>> {
        const dto: JSONGraphDTO = JSON.parse(data);
        
        if (!dto) {
            // TODO: Add proper error handling
            throw new Error("Could not parse json dto.");
        }
        
        let graph: Graph<string> = new Graph(); 

        // Create a map where the the vertex id is the key and the vertex is the value.
        const vertexMap = this.importVertices(dto.vertices, graph);
        this.importEdges(dto.edges, vertexMap, graph);
        this.importSets(dto.sets, vertexMap, graph);
        
        return new Promise((resolve) => {
            resolve(graph);
        });
    }
    
    
    private importVertices(vertices: Vertex[], graph: Graph<string>): Map<number, GVertex<string>> {
        const idMap = new Map<number, GVertex<string>>();
        
        vertices.forEach((v) => {
            const newV = graph.addVertex(v.data);
            idMap.set(v.id, newV);
        });
        
        return idMap;
    }
    
    private importEdges(edges: Edge[], vertexMap: Map<number, GVertex<string>>, graph: Graph<string>) {
        edges.forEach((e) => {
            const source = vertexMap.get(e.source);
            const destination = vertexMap.get(e.target);
            
            if (source != undefined && destination != undefined) {
                graph.addEdge(source, destination);
            } else {
                // TODO: Add proper error handling
            }
        });
    }
    
    private importSets(sets: Set[], vertexMap: Map<number, GVertex<string>>, graph: Graph<string>){
        sets.forEach((s) => {
            const set = graph.addSet(s.name);
        
            s.members.forEach((m) => {
                const elem = vertexMap.get(m);
                
                if (elem != undefined) {
                    set.addElement(elem);
                } else {
                    // TODO: Add proper error handling
                }
            })
        });
    }

}