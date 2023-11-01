import { type Graph, type GraphEdge, type GraphVertex } from "../model/graph";
import {
  HypernodeType,
  type Hyperedge,
  type Hypergraph,
  type Hypervertex,
} from "../model/hypergraph.";

/**
 * Combines two graphs into one, discarding duplicates.
 * @param g1 The first graph
 * @param g2 The second graph
 * @returns The combined graph
 */
export function CombineGraphs(g1: Graph, g2: Graph): Graph {
  const graphName: string = g1.name.includes(g2.name)
    ? g1.name
    : `${g1.name} + ${g2.name}`;

  const combinedGraph: Graph = {
    name: graphName,
    color: "black",
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
        e.edge === edge.edge,
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

/**
 * Removes all vertices that are disconnected.
 * @param g The graph of which vertices should be removed.
 * @returns The updated graph.
 */
export function RemoveDisconnectedVertices(g: Graph): Graph {
  const connectedVertices: Set<GraphVertex> = new Set();

  // Collect all vertices that have connected edges
  for (const edge of g.edges) {
    connectedVertices.add(edge.source);
    connectedVertices.add(edge.target);
  }

  // Filter out vertices that are not connected
  const filteredVertices = g.vertices.filter((vertex) =>
    connectedVertices.has(vertex),
  );

  // Create a new graph with filtered vertices
  const filteredGraph: Graph = {
    ...g,
    vertices: filteredVertices,
  };

  return filteredGraph;
}

/**
 * Generate a hypergraph from a given graph
 * @param g The graph from which the hypergraph should be generated
 * @returns The generated hypergraph
 */
export function GenerateHypergraphFromGraph(g: Graph): Hypergraph {
  const hypervertices: Hypervertex[] = [];
  const hyperedges: Hyperedge[] = [];

  const sharedVerticesMap: Map<string, Set<string>> = new Map();

  g.sets.forEach((set) => {
    // Generate sharedVerticesMap
    set.vertices.forEach((vertex) => {
      if (!sharedVerticesMap.has(vertex.id)) {
        sharedVerticesMap.set(vertex.id, new Set());
      }
      sharedVerticesMap.get(vertex.id)?.add(set.name);
    });

    // Add a hypervertex for each set
    const hypervertex: Hypervertex = {
      name: set.name,
      type: HypernodeType.SET,
      size: set.vertices.length,
    };
    hypervertices.push(hypervertex);
  });

  // Add all vertices with multiple shared vertices
  sharedVerticesMap.forEach((val, key) => {
    if (val.size > 1) {
      const hypervertex: Hypervertex = {
        name: key,
        type: HypernodeType.VERTEX,
        size: val.size,
      };

      hypervertices.push(hypervertex);
    }
  });

  // Create edges
  sharedVerticesMap.forEach((val, key) => {
    if (val.size > 1) {
      val.forEach((set) => {
        // Find the vertices
        const sourceVertex: Hypervertex = hypervertices.filter(
          (x) => x.name === key,
        )[0];
        const targetVertex: Hypervertex = hypervertices.filter(
          (x) => x.name === set,
        )[0];

        if (!sourceVertex || !targetVertex) {
          return;
        }

        const hyperedge: Hyperedge = {
          source: sourceVertex,
          target: targetVertex,
        };

        hyperedges.push(hyperedge);
      });
    }
  });

  return {
    name: g.name + "-Hypergraph",
    vertices: hypervertices,
    edges: hyperedges,
  };
}