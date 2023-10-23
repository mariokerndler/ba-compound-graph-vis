import type { Graph } from '../../model/graph/graph';
import type { GraphVertex } from '../../model/graph/vertex';
import type { GraphEdge } from '../../model/graph/edge';
import type { GraphSet } from '../../model/graph/set';

export class CSVImport {

    async import(matrix: string, edgeList: string[]): Promise<Graph> {
        const incidenceMatrix: IncidenceMatrix = this.parseIncidenceMatrix(matrix);
        const edges: Edge[] = this.parseEdgeList(edgeList);
        
        const idMap: Map<string, GraphVertex> = new Map<string, GraphVertex>();
        
        const newVertices: GraphVertex[] = this.generateVertices(incidenceMatrix, idMap);
        const newEdges: GraphEdge[] = this.generateEdges(edges, idMap);
        const newSets: GraphSet[] = this.generateSets(incidenceMatrix.sets, idMap);
        
        const graph: Graph = {
            vertices: newVertices,
            edges: newEdges,
            sets: newSets
        };
        
        return new Promise((resolve) => {
            resolve(graph);
        });
    }
    
    private parseIncidenceMatrix(matrix: string): IncidenceMatrix {
        const incidenceMatrix: IncidenceMatrix = {
            vertices: [],
            sets: new Map<string, string[]>()
        };
        
        const lines = matrix.split('\n');
        const headers = lines[0].split(',');
        
        // Set the set names
        for (let i = 1; i < headers.length; i++) {
            incidenceMatrix.sets.set(headers[i], []);
        }
        
        // Go through each line
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].split(',');
            
            if (line.length < headers.length) {
                // TODO: Add proper error handling
                //console.error('Skipping incomplete row:', line);
                continue;
            }
            
            const vertex = line[0];
            incidenceMatrix.vertices.push(vertex);
            
            // Go through each entry per line
            for (let j = 1; j < line.length; j++) {
                const currentSet: string[] | undefined = incidenceMatrix.sets.get(headers[j]);
                if (!currentSet) {
                    // TODO: Add proper error handling
                    console.error('Set not found.');
                    continue;
                }
                
                if (line[j] === "1") {
                    currentSet.push(vertex);
                }
                
                incidenceMatrix.sets.set(headers[j], currentSet);
            }
        }
        
        return incidenceMatrix;
    }
    
    private parseEdgeList(edgeList: string[]): Edge[] {
        const edges: Edge[] = [];
        
        edgeList.forEach((el) => {
            const lines = el.split('\n');
            const headers = lines[0].split(',');
            
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].split(',');
                
                if (line.length < headers.length) {
                    // TODO: Add proper error handling
                    // console.error('Skipping incomplete row:', line);
                    continue;
                }
                
                const edge: Edge = {
                    vertexA: line[0],
                    vertexB: line[1],
                    node: line[2]
                };
                
                edges.push(edge);
            }
        });
        
        return edges;
    }
    
    private generateVertices(matrix: IncidenceMatrix, map: Map<string, GraphVertex>): GraphVertex[] {
        const nodes: GraphVertex[] = [];
        
        matrix.vertices.forEach((vertex) => {
            const newNode: GraphVertex = {
                id: vertex,
            };
            
            if (!map.has(vertex)) {
                nodes.push(newNode);
            
                map.set(vertex, newNode);
            }
        });
        
        return nodes;
    }
    
    private generateEdges(edgeList: Edge[], map: Map<string, GraphVertex>): GraphEdge[] {
        const newLinks: GraphEdge[] = [];
        
        edgeList.forEach((edge) => {
            const s = map.get(edge.vertexA);
            const t = map.get(edge.vertexB);
            
            if (s === undefined || t === undefined) {
                //console.error("Link could not be converted.");
                return newLinks;
            }
            
            const newLink: GraphEdge = {
                source: s,
                target: t,
            };
            
            newLinks.push(newLink);
        });
        
        return newLinks;
    }
    
    private generateSets(sets: Map<string, string[]>, map: Map<string, GraphVertex>): GraphSet[] {
        const newSets: GraphSet[] = [];
        
        for (const [key, value] of sets) {
            const newSet: GraphSet = {
                name: key,
                vertices: []
            };
            
            value.forEach((vertex) => {
                const vert = map.get(vertex);
                
                if (vert === undefined) {
                    console.error("Vertex could not be found.");
                    return newSets;
                }
                
                newSet.vertices.push(vert);
            });
            
            newSets.push(newSet);
        }
        
        return newSets;
    }
    
}

interface IncidenceMatrix {
    vertices: string[];
    sets: Map<string, string[]>;
}

interface Edge {
    vertexA: string;
    vertexB: string;
    node: string;
}
