import { expect, test } from "vitest";
import type { Graph } from "../model/graph";
import { CreateVertexAdjacenyFeatureMatrix } from "../util/GraphUtil";

// Mock data for testing
const mockGraph: Graph = {
  name: "Sample Graph",
  color: "blue",
  vertices: [
    {
      id: "A",
      sets: ["set1"],
      neighbours: ["B", "C"],
    },
    {
      id: "B",
      sets: ["set1"],
      neighbours: ["A", "C"],
    },
    {
      id: "C",
      sets: ["set2"],
      neighbours: ["A", "B"],
    },
  ],
  edges: [],
  sets: [],
};

test("Should return an empty feature matrix for a graph with no vertices", () => {
  const emptyGraph: Graph = {
    name: "Empty Graph",
    color: "red",
    vertices: [],
    edges: [],
    sets: [],
  };
  const featureMatrix = CreateVertexAdjacenyFeatureMatrix(emptyGraph);
  expect(featureMatrix).toEqual([]);
});

test("Should return a feature matrix with the correct dimensions", () => {
  const featureMatrix = CreateVertexAdjacenyFeatureMatrix(mockGraph);
  // The feature matrix should be a square matrix with the number of vertices as its dimensions
  expect(featureMatrix.length).toBe(mockGraph.vertices.length);
  expect(featureMatrix[0].length).toBe(mockGraph.vertices.length);
});

test("Should return a feature matrix with Jaccard distances between vertex neighbors", () => {
  const featureMatrix = CreateVertexAdjacenyFeatureMatrix(mockGraph);
  // In this test case, you can calculate the expected Jaccard distances manually
  // and compare them with the values in the feature matrix.
  const expectedMatrix = [
    [0, 0.33, 0.33],
    [0.33, 0, 0.33],
    [0.33, 0.33, 0],
  ];

  for (let i = 0; i < mockGraph.vertices.length; i++) {
    for (let j = 0; j < mockGraph.vertices.length; j++) {
      expect(featureMatrix[i][j]).toBeCloseTo(expectedMatrix[i][j]);
    }
  }
});

test("should handle empty sets of vertex neighbors", () => {
  // Add a vertex with no neighbors to the graph
  const graphWithEmptyVertex: Graph = {
    ...mockGraph,
    vertices: [
      ...mockGraph.vertices,
      {
        id: "D",
        sets: ["set2"],
        neighbours: [],
      },
    ],
  };
  const featureMatrix = CreateVertexAdjacenyFeatureMatrix(graphWithEmptyVertex);
  // Jaccard distance with an empty set should be 0
  expect(featureMatrix[3][0]).toBe(0);
});
