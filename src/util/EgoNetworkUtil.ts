import type { EgoNetNode } from "../model/egonet";
import type { Graph, GraphEdge, GraphVertex } from "../model/graph";
import { Queue } from "../model/queue";

/**
 * Creates an ego network of a selected node in a given graph. (Uses BFS for creation)
 * @param graph The given graph
 * @param selectedNode The selected vertex/node from where the ego net should be created
 * @param depth The maximum depth that should be looked at
 * @returns The ego network in tree representation
 */
export function CreateEgoNetworkFromGraphWithoutDistance(graph: Graph, selectedNode: GraphVertex, depth: number): EgoNetNode {
  const visited: Set<string> = new Set();
  const queue: Queue<{ node: GraphVertex; parent: EgoNetNode | null; depth: number }> = new Queue();

  const root: EgoNetNode = {
    parent: null,
    children: [],
    name: selectedNode.name,
  };

  visited.add(selectedNode.name);
  queue.enqueue({ node: selectedNode, parent: root, depth: 0 });

  while (!queue.isEmpty()) {
    const {
      node,
      parent,
      depth: currentDepth,
    } = queue.dequeue() as {
      node: GraphVertex;
      parent: EgoNetNode;
      depth: number;
    };

    for (const neighbourName of node.neighbours) {
      if (!visited.has(neighbourName) && currentDepth < depth) {
        const neighbour = graph.vertices.find((v) => v.name === neighbourName);

        if (neighbour) {
          const childNode: EgoNetNode = {
            parent,
            children: [],
            name: neighbour.name,
          };

          parent.children.push(childNode);
          visited.add(neighbour.name);
          queue.enqueue({ node: neighbour, parent: childNode, depth: currentDepth + 1 });
        }
      }
    }
  }

  return root;
}

export function GetTestGraph(): Graph {
  const vertexA: GraphVertex = {
    name: "A",
    sets: [],
    neighbours: ["B", "D", "C", "E"],
  };

  const vertexB: GraphVertex = {
    name: "B",
    sets: [],
    neighbours: ["A", "D"],
  };

  const vertexC: GraphVertex = {
    name: "C",
    sets: [],
    neighbours: ["A", "E", "F"],
  };

  const vertexD: GraphVertex = {
    name: "D",
    sets: [],
    neighbours: ["B", "A", "F"],
  };

  const vertexE: GraphVertex = {
    name: "E",
    sets: [],
    neighbours: ["A", "C"],
  };

  const vertexF: GraphVertex = {
    name: "F",
    sets: [],
    neighbours: ["D", "C"],
  };

  const edgeAB: GraphEdge = {
    source: vertexA,
    target: vertexB,
    distance: 0.7,
    edge: "",
    set: "",
  };

  const edgeAD: GraphEdge = {
    source: vertexA,
    target: vertexD,
    distance: 0.1,
    edge: "",
    set: "",
  };

  const edgeAC: GraphEdge = {
    source: vertexA,
    target: vertexC,
    distance: 0.1,
    edge: "",
    set: "",
  };

  const edgeAE: GraphEdge = {
    source: vertexA,
    target: vertexE,
    distance: 0.3,
    edge: "",
    set: "",
  };

  const edgeBD: GraphEdge = {
    source: vertexB,
    target: vertexD,
    distance: 0.3,
    edge: "",
    set: "",
  };

  const edgeEC: GraphEdge = {
    source: vertexE,
    target: vertexC,
    distance: 1,
    edge: "",
    set: "",
  };

  const edgeCF: GraphEdge = {
    source: vertexC,
    target: vertexF,
    distance: 0.8,
    edge: "",
    set: "",
  };

  const edgeDF: GraphEdge = {
    source: vertexD,
    target: vertexF,
    distance: 0.5,
    edge: "",
    set: "",
  };

  const graph: Graph = {
    name: "Test",
    vertices: [vertexA, vertexB, vertexC, vertexD, vertexE, vertexF],
    edges: [edgeAB, edgeAC, edgeAD, edgeAE, edgeBD, edgeCF, edgeDF, edgeEC],
    sets: [],
  };

  return graph;
}
