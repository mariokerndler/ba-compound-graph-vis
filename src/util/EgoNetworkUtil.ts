import type { EgoNetNode } from "../model/egonet";
import type { Graph, GraphVertex } from "../model/graph";
import { Queue } from "../model/queue";

/**
 * Creates an ego network of a selected node in a given graph. (Uses BFS for creation)
 * @param graph The given graph
 * @param selectedNode The selected vertex/node from where the ego net should be created
 * @param depth The maximum depth that should be looked at
 * @returns The ego network in tree representation
 */
export function CreateEgoNetworkFromGraph(
  graph: Graph,
  selectedNode: GraphVertex,
  depth: number,
): EgoNetNode {
  const visited: Set<string> = new Set();
  const queue: Queue<{
    node: GraphVertex;
    parent: EgoNetNode | null;
    depth: number;
  }> = new Queue();

  const root: EgoNetNode = {
    parent: null,
    children: [],
    name: selectedNode.name,
    distanceToParent: 0,
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
          const distance = GetEdgeDistance(graph, node, neighbour);

          const childNode: EgoNetNode = {
            parent,
            children: [],
            name: neighbour.name,
            distanceToParent: distance,
          };

          parent.children.push(childNode);
          visited.add(neighbour.name);
          queue.enqueue({
            node: neighbour,
            parent: childNode,
            depth: currentDepth + 1,
          });
        }
      }
    }
  }

  return root;
}

export function GetMaxDepth(node: EgoNetNode | null): number {
  if (node === null) {
    return 0;
  }

  if (node.children.length === 0) {
    return 1;
  }

  let maxDepth = 0;
  for (const child of node.children) {
    const childDepth = GetMaxDepth(child);
    maxDepth = Math.max(maxDepth, childDepth);
  }

  return maxDepth + 1;
}

export function SortNodesByTotalDistance(node: EgoNetNode): void {
  if (!node.children) {
    return;
  }

  // Sort children based on the sum of distanceToParent recursively
  node.children.sort((a, b) => getTotalDistance(a) - getTotalDistance(b));
  node.children.forEach(SortNodesByTotalDistance);
}

function getTotalDistance(node: EgoNetNode, total: number = 0): number {
  if (!node.parent) {
    return total;
  }
  return getTotalDistance(node.parent, total + (1 - node.distanceToParent));
}

function GetEdgeDistance(g: Graph, n1: GraphVertex, n2: GraphVertex): number {
  const edge = g.edges.find(
    (e) =>
      (e.source.name === n1.name || e.source.name === n2.name) &&
      (e.target.name === n1.name || e.target.name === n2.name),
  );

  return edge?.distance ?? 0;
}
