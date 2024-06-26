import { type Graph, type GraphEdge, type GraphVertex } from "../model/graph";
import {
  HypervertexType,
  type Hyperedge,
  type Hypergraph,
  type Hypervertex,
} from "../model/hypergraph.";
import type { SimilarityContainer } from "../model/similarity";

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
    vertices: [...g1.vertices],
    edges: [...g1.edges],
    sets: [],
  };

  // Helper function to check if a vertex already exists in the combined graph
  const isVertexInCombinedGraph = (vertex: GraphVertex) =>
    combinedGraph.vertices.some((v) => v.name === vertex.name);

  // Helper function to check if an edge already exists in the combined graph
  const isEdgeInCombinedGraph = (edge: GraphEdge) =>
    combinedGraph.edges.some(
      (e) =>
        e.source.name === edge.source.name &&
        e.target.name === edge.target.name &&
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

  const vertexSet = new Map<string, Hypervertex>();

  // Add all sets as vertices
  g.sets.forEach((set) => {
    const cardinality: number = set.vertices.filter(
      (v) => v.sets.length == 1,
    ).length;

    const vertex: Hypervertex = {
      name: set.name,
      type: HypervertexType.SET,
      size: cardinality,
    };

    hypervertices.push(vertex);
  });

  g.vertices.forEach((vertex) => {
    if (vertex.sets.length <= 1) return;

    if (vertex.sets.length == 2) {
      // If the vertex is in two sets, add an edge between those two sets.
      const edgeVert = hypervertices.filter(
        (x) => x.name === vertex.sets[0] || x.name === vertex.sets[1],
      );
      const edge: Hyperedge = {
        source: edgeVert[0],
        target: edgeVert[1],
        thickness: 1,
      };

      if (!HasEdge(hyperedges, edge)) {
        hyperedges.push(edge);
      } else {
        const index = hyperedges.findIndex(
          (e) =>
            e.source.name === edge.source.name &&
            e.target.name === edge.target.name,
        );
        hyperedges[index].thickness += 1;
      }
    } else {
      // Check if there is already a vertex connecting the sets.
      const foundVert = vertexSet.get(vertex.sets.toSorted().toString());
      if (foundVert) {
        foundVert.name += " - " + vertex.name;
        return;
      }

      // Create the new vertex
      const newVertex: Hypervertex = {
        name: vertex.name,
        type: HypervertexType.VERTEX,
        size: vertex.sets.length,
      };

      // Add edges from the sets to the new vertex
      const newEdges: Hyperedge[] = [];
      vertex.sets.forEach((set) => {
        const targetVert = hypervertices.filter((x) => x.name === set)[0];
        const edge: Hyperedge = {
          source: newVertex,
          target: targetVert,
          thickness: 1,
        };

        if (!HasEdge(hyperedges, edge)) {
          newEdges.push(edge);
        }
      });

      vertexSet.set(vertex.sets.toSorted().toString(), newVertex);
      newEdges.forEach((e) => hyperedges.push(e));
      hypervertices.push(newVertex);
    }
  });

  g.edges.forEach((edge) => {
    const targetSets = edge.target.sets;
    const sourceSets = edge.source.sets;

    sourceSets.forEach((sSet) => {
      const sourceVert = hypervertices.find((v) => v.name === sSet);
      if (!sourceVert) return;

      targetSets.forEach((tSet) => {
        const targetVert = hypervertices.find((v) => v.name === tSet);
        if (!targetVert) return;

        if (sourceVert.name === targetVert.name) return;

        const newEdge: Hyperedge = {
          source: sourceVert,
          target: targetVert,
          thickness: 1,
        };

        const foundEdges = GetEdge(hyperedges, newEdge);
        if (foundEdges.length == 1) {
          const edge = foundEdges[0];
        } else {
          hyperedges.push(newEdge);
        }
      });
    });
  });

  return {
    name: g.name + "-Hypergraph",
    vertices: hypervertices,
    edges: hyperedges,
  };
}

function HasEdge(hyperedges: Hyperedge[], edge: Hyperedge): boolean {
  const hasEdge =
    hyperedges.filter((x) => {
      return (
        (x.source == edge.source && x.target == edge.target) ||
        (x.source == edge.target && x.target == edge.source)
      );
    }).length > 0;

  return hasEdge;
}

function GetEdge(hyperedges: Hyperedge[], edge: Hyperedge): Hyperedge[] {
  return hyperedges.filter((x) => {
    return (
      (x.source == edge.source && x.target == edge.target) ||
      (x.source == edge.target && x.target == edge.source)
    );
  });
}

/**
 * Calculate jaccard distance between two given sets.
 * @param s1 Set1
 * @param s2 Set2
 * @returns Jaccard distance for the given sets. Between [0, 1].
 */
export function JaccardDistance<T>(s1: T[], s2: T[]) {
  if (s1.length == 0 && s2.length == 0) {
    return 0;
  }

  const intersection: T[] = Intersection(s1, s2);
  const union: T[] = Union(s1, s2);

  return intersection.length / union.length;
}

/**
 * Creates a set similarity matrix and descriptor of the given graph.
 * @param g Graph from which the matrix should be created.
 * @returns The similarity container of the graph.
 */
export function CreateSetSimilariyFeatureMatrix(g: Graph): SimilarityContainer {
  const numGraphs: number = g.sets.length;
  const featureMatrix: number[][] = [];
  const desc: string[] = [];

  for (let i = 0; i < numGraphs; i++) {
    const featureRow: number[] = [];

    desc.push(g.sets[i].name);

    for (let j = 0; j < numGraphs; j++) {
      if (i == j) {
        featureRow.push(0);
      } else {
        const similarity: number = JaccardDistance<GraphVertex>(
          g.sets[i].vertices,
          g.sets[j].vertices,
        );
        featureRow.push(similarity);
      }
    }

    featureMatrix.push(featureRow);
  }

  return {
    descriptor: desc,
    matrix: featureMatrix,
  };
}

/**
 * Creates a vertex similarity matrix and descriptor of the given graph.
 * @param g Graph from which the matrix should be created.
 * @returns The similarity container of the graph.
 */
export function CreateVertexAdjacenyFeatureMatrix(
  g: Graph,
): SimilarityContainer {
  const numVertices: number = g.vertices.length;
  const featureMatrix: number[][] = [];
  const desc: string[] = [];

  for (let i = 0; i < numVertices; i++) {
    const featureRow: number[] = [];

    desc.push(g.vertices[i].name);

    for (let j = 0; j < numVertices; j++) {
      if (i == j) {
        featureRow.push(0);
      } else {
        const similarity: number = JaccardDistance<String>(
          g.vertices[i].neighbours,
          g.vertices[j].neighbours,
        );
        featureRow.push(similarity);
      }
    }

    featureMatrix.push(featureRow);
  }

  return {
    descriptor: desc,
    matrix: featureMatrix,
  };
}

function Intersection<T>(elements1: T[], elements2: T[]): T[] {
  return elements1.filter((el) => elements2.includes(el));
}

function Union<T>(elements1: T[], elements2: T[]): T[] {
  return [...new Set([...elements1, ...elements2])];
}
