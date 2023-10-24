import type { Graph } from '../../model/graph/graph';
import type { GraphVertex } from '../../model/graph/vertex';
import type { GraphEdge } from '../../model/graph/edge';
import type { GraphSet } from '../../model/graph/set';

export class CSVImport {

    async import(matrix: string, edgeList: Map<string, string>): Promise<Graph> {
        // Parse incidence matrix
        const incidenceMatrix: IncidenceMatrix = this.parseIncidenceMatrix(matrix);
        
        // Parse edge lists
        // Map where key is set name and value is edges of the set
        const setEdgeMap: Map<string, Edge[]> = this.parseEdgeLists(edgeList);
        
        // Parse and create vertices
        // Map where key is vertex name and value is the parsed vertex
        const nameVertexMap: Map<string, GraphVertex> = this.parseVertices(incidenceMatrix);
        
        // Convert edge list
        // Map where key is set name and value is the converted edges of the set
        const convSetEdgeMap: Map<string, GraphEdge[]> = this.convertEdgeLists(setEdgeMap, nameVertexMap);
        
        // Generate all the new values
        const newVertices: GraphVertex[] = this.createNewVertices(nameVertexMap);
        const newEdges: GraphEdge[] = this.createNewEdges(convSetEdgeMap);
        const newSets: Graph[] = this.createNewSets(convSetEdgeMap, nameVertexMap, incidenceMatrix);
        
        const graph: Graph = {
            name: "Graph",
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
    
    private parseEdgeList(edgeList: string): Edge[] {
        const edges: Edge[] = [];
        
        const lines = edgeList.split('\n');
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
                edge: line[2]
            };
            
            edges.push(edge);
        }
        
        return edges;
    }
    
    private parseEdgeLists(edgeLists: Map<string, string>): Map<string, Edge[]> {
        const edges: Map<string, Edge[]> = new Map<string, Edge[]>();
        
        edgeLists.forEach((val, key) => {
            const newList: Edge[] = this.parseEdgeList(val);
            edges.set(key, newList);
        });
        
        return edges;
    }
    
    private parseVertices(incidenceMatrix: IncidenceMatrix): Map<string, GraphVertex> {
        const nameVertexMap: Map<string, GraphVertex> = new Map<string, GraphVertex>();
    
        incidenceMatrix.vertices.forEach((vertex) => {
            const newNode: GraphVertex = {
                id: vertex,
            };
            
            if (!nameVertexMap.has(vertex)) {
                nameVertexMap.set(vertex, newNode);
            }
        });
        
        return nameVertexMap;
    }
    
    private createNewVertices(nameVertexMap: Map<string, GraphVertex>): GraphVertex[] {
        const newVertices: GraphVertex[] = [];
        
        nameVertexMap.forEach((val, _) => {
            newVertices.push(val);
        });
        
        return newVertices;
    }
    
    private createNewEdges(setEdgeMap: Map<string, GraphEdge[]>): GraphEdge[] {
        const newEdges: GraphEdge[] = [];
        
        setEdgeMap.forEach((val, _) => {
            val.forEach((edge) => newEdges.push(edge));
        });
        
        return newEdges;
    }
    
    private createNewSets(convSetEdgeMap: Map<string, GraphEdge[]>, nameVertexMap: Map<string, GraphVertex>, incidenceMatrix: IncidenceMatrix): Graph[] {
        const newSets: Graph[] = [];
        
        convSetEdgeMap.forEach((val, key) => {            
            const setVertices: string[] | undefined = incidenceMatrix.sets.get(key);
            if (setVertices === undefined) {
                return newSets;
            } 
            const vertices: GraphVertex[] = [];
            setVertices.forEach((vert) => {
                const vertex: GraphVertex | undefined = nameVertexMap.get(vert);
                if (vertex !== undefined) {
                    vertices.push(vertex);
                }
            });
            
            const newSet: Graph = {
                name: key,
                vertices: vertices,
                edges: val,
                sets: []
            };
            
            newSets.push(newSet);
        });
        
        return newSets;
    }
    
    private convertEdgeLists(edgeList: Map<string, Edge[]>, map: Map<string, GraphVertex>): Map<string, GraphEdge[]> {
        const newEdges: Map<string, GraphEdge[]> = new Map<string, GraphEdge[]>();
        
        edgeList.forEach((val, key) => {
        
            const edges: GraphEdge[] = [];
            val.forEach((edge) => {
                const newEdge = this.convertEdgeList(edge, map);
                if (newEdge) {
                    edges.push(newEdge);
                }
            })
            
            newEdges.set(key, edges);
        });
        
        return newEdges;
    }
    
    private convertEdgeList(edge: Edge, map: Map<string, GraphVertex>): GraphEdge | null {
        const s = map.get(edge.vertexA);
        const t = map.get(edge.vertexB);
            
        if (s === undefined || t === undefined) {
            //console.error("Link could not be converted.");
            return null;
        }
        
        const newEdge: GraphEdge = {
            source: s,
            target: t,
            edge: edge.edge
        };
        
        return newEdge;
    }
}

interface IncidenceMatrix {
    vertices: string[];
    sets: Map<string, string[]>;
}

interface Edge {
    vertexA: string;
    vertexB: string;
    edge: string;
}
