import type { GraphEdge } from "../model/graph/edge";
import { type Graph } from "../model/graph/graph";
import type { GraphVertex } from "../model/graph/vertex";

/**
 * Combines two graphs into one, discarding duplicates.
 * @param g1 The first graph
 * @param g2 The second graph
 * @returns The combined graph
 */
export function CombineGraphs(g1: Graph, g2: Graph): Graph {
    const graphName: string = g1.name.includes(g2.name) ? g1.name : `${g1.name} + ${g2.name}`;

    const combinedGraph: Graph = {
        name: graphName,
        vertices: [...g1.vertices],
        edges: [...g1.edges],
        sets: [],
    };
    
    // Helper function to check if a vertex already exists in the combined graph
    const isVertexInCombinedGraph = (vertex: GraphVertex) => 
        combinedGraph.vertices.some((v) => v.id === vertex.id);
    
    // Helper function to check if an edge already exists in the combined graph
    const isEdgeInCombinedGraph = (edge: GraphEdge) =>
        combinedGraph.edges.some(
          (e) =>
            e.source.id === edge.source.id &&
            e.target.id === edge.target.id &&
            e.edge === edge.edge
        );
        
    // Add vertices from g2 to the combined graph
    for (const vertex of g2.vertices) {
        if (!isVertexInCombinedGraph(vertex)) {
          combinedGraph.vertices.push(vertex);
        }
    }    
    
    // Add edges from g2 to the combined graph
    for (const edge of g2.edges) {
        if (!isEdgeInCombinedGraph(edge)) {
          combinedGraph.edges.push(edge);
        }
    }
    
    return combinedGraph;
}

export function RemoveDisconnectedVertices(g: Graph): Graph {
    const connectedVertices: Set<GraphVertex> = new Set();
    
    // Collect all vertices that have connected edges
    for (const edge of g.edges) {
        connectedVertices.add(edge.source);
        connectedVertices.add(edge.target);
    }
    
    // Filter out vertices that are not connected
      const filteredVertices = g.vertices.filter((vertex) =>
      connectedVertices.has(vertex)
    );

    // Create a new graph with filtered vertices
    const filteredGraph: Graph = {
      ...g,
      vertices: filteredVertices,
    };

    return filteredGraph;
}