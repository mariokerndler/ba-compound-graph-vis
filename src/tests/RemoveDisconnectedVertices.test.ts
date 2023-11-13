import { expect, test } from "vitest";
import type { Graph, GraphEdge, GraphVertex } from "../model/graph";
import { RemoveDisconnectedVertices } from "../util/GraphUtil";

test("Should remove disconnected vertices from the graph", () => {
  // Create a sample graph
  const vertex1: GraphVertex = { name: "1", sets: [], neighbours: [] };
  const vertex2: GraphVertex = { name: "2", sets: [], neighbours: [] };
  const vertex3: GraphVertex = { name: "3", sets: [], neighbours: [] };
  const vertex4: GraphVertex = { name: "4", sets: [], neighbours: [] };

  const edge1: GraphEdge = {
    source: vertex1,
    target: vertex2,
    edge: "e1",
    set: "s1",
  };
  const edge2: GraphEdge = {
    source: vertex2,
    target: vertex3,
    edge: "e2",
    set: "s1",
  };

  const graph: Graph = {
    name: "Test Graph",
    vertices: [vertex1, vertex2, vertex3, vertex4],
    edges: [edge1, edge2],
    sets: [],
  };

  // Call the function to remove disconnected vertices
  const updatedGraph = RemoveDisconnectedVertices(graph);

  // Expect that only connected vertices are present in the updated graph
  expect(updatedGraph.vertices).toContain(vertex1);
  expect(updatedGraph.vertices).toContain(vertex2);
  expect(updatedGraph.vertices).toContain(vertex3);

  // Ensure that disconnected vertices are removed
  expect(updatedGraph.vertices).toHaveLength(3);
});

test("Should handle a graph with no disconnected vertices", () => {
  // Create a sample graph with no disconnected vertices
  const vertex1: GraphVertex = { name: "1", sets: [], neighbours: [] };
  const vertex2: GraphVertex = { name: "2", sets: [], neighbours: [] };
  const edge1: GraphEdge = {
    source: vertex1,
    target: vertex2,
    edge: "e1",
    set: "s1",
  };
  const graph: Graph = {
    name: "Connected Graph",
    vertices: [vertex1, vertex2],
    edges: [edge1],
    sets: [],
  };

  // Call the function to remove disconnected vertices
  const updatedGraph = RemoveDisconnectedVertices(graph);

  // Expect that all vertices are still present in the updated graph
  expect(updatedGraph.vertices).toContain(vertex1);
  expect(updatedGraph.vertices).toContain(vertex2);

  // Ensure that no vertices are removed
  expect(updatedGraph.vertices).toHaveLength(2);
});

test("Should handle a graph with no vertices", () => {
  // Create an empty graph
  const graph: Graph = {
    name: "Empty Graph",
    vertices: [],
    edges: [],
    sets: [],
  };

  // Call the function to remove disconnected vertices
  const updatedGraph = RemoveDisconnectedVertices(graph);

  // Expect that the graph remains empty with no vertices
  expect(updatedGraph.vertices).toHaveLength(0);
});
