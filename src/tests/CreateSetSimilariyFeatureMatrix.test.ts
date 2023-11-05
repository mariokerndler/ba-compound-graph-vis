import { expect, test } from "vitest";
import type { Graph, GraphVertex } from "../model/graph";
import { CreateSetSimilariyFeatureMatrix } from "../util/GraphUtil";

const vertexA: GraphVertex = {
  id: "A",
  sets: ["Set1", "Set3"],
  neighbours: [],
};

const vertexB: GraphVertex = {
  id: "B",
  sets: ["Set1"],
  neighbours: ["A", "C"],
};

const vertexC: GraphVertex = {
  id: "C",
  sets: ["Set2", "Set3"],
  neighbours: [],
};

// Mock data for testing
const mockGraph: Graph = {
  name: "Sample Graph",
  color: "blue",
  vertices: [],
  edges: [],
  sets: [
    {
      name: "Set1",
      color: "orange",
      vertices: [vertexA, vertexB],
      edges: [],
      sets: [],
    },
    {
      name: "Set2",
      color: "blue",
      vertices: [vertexC],
      edges: [],
      sets: [],
    },
    {
      name: "Set3",
      color: "green",
      vertices: [vertexA, vertexC],
      edges: [],
      sets: [],
    },
  ],
};

test("Should return an empty feature matrix for a graph with no sets", () => {
  const emptyGraph: Graph = {
    name: "Empty Graph",
    color: "red",
    vertices: [],
    edges: [],
    sets: [],
  };
  const featureMatrix = CreateSetSimilariyFeatureMatrix(emptyGraph);
  expect(featureMatrix).toEqual([]);
});

test("Should return a feature matrix with the correct dimensions", () => {
  const featureMatrix = CreateSetSimilariyFeatureMatrix(mockGraph);
  // The feature matrix should be a square matrix with the number of sets as its dimensions
  expect(featureMatrix.length).toBe(mockGraph.sets.length);
  expect(featureMatrix[0].length).toBe(mockGraph.sets.length);
});

test("Should return a feature matrix with Jaccard distances between set vertices", () => {
  const featureMatrix = CreateSetSimilariyFeatureMatrix(mockGraph);

  const expectedMatrix = [
    [0, 0, 0.33],
    [0, 0, 0.5],
    [0.33, 0.5, 0],
  ];

  for (let i = 0; i < mockGraph.sets.length; i++) {
    for (let j = 0; j < mockGraph.sets.length; j++) {
      expect(featureMatrix[i][j]).toBeCloseTo(expectedMatrix[i][j]);
    }
  }
});

test("should handle sets with no vertices", () => {
  // Add a set with no vertices to the graph
  const graphWithEmptySet: Graph = {
    ...mockGraph,
    sets: [
      ...mockGraph.sets,
      {
        name: "Set4",
        color: "blue",
        vertices: [],
        edges: [],
        sets: [],
      },
    ],
  };
  const featureMatrix = CreateSetSimilariyFeatureMatrix(graphWithEmptySet);
  // Jaccard distance between Set2 and Set3 should be 0 (both have no vertices)
  expect(featureMatrix[1][3]).toBe(0);
});
