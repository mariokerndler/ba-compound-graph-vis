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
  vertices: [],
  edges: [],
  sets: [
    {
      name: "Set1",
      vertices: [vertexA, vertexB],
      edges: [],
      sets: [],
    },
    {
      name: "Set2",
      vertices: [vertexC],
      edges: [],
      sets: [],
    },
    {
      name: "Set3",
      vertices: [vertexA, vertexC],
      edges: [],
      sets: [],
    },
  ],
};

test("Should return an empty feature matrix for a graph with no sets", () => {
  const emptyGraph: Graph = {
    name: "Empty Graph",
    vertices: [],
    edges: [],
    sets: [],
  };
  const featureMatrix = CreateSetSimilariyFeatureMatrix(emptyGraph);
  expect(featureMatrix.matrix).toEqual([]);
  expect(featureMatrix.descriptor).toEqual([]);
});

test("Should return a feature matrix with the correct dimensions", () => {
  const featureMatrix = CreateSetSimilariyFeatureMatrix(mockGraph);
  // The feature matrix should be a square matrix with the number of sets as its dimensions
  expect(featureMatrix.matrix.length).toBe(mockGraph.sets.length);
  expect(featureMatrix.matrix[0].length).toBe(mockGraph.sets.length);
  expect(featureMatrix.descriptor).toEqual(["Set1", "Set2", "Set3"]);
});

test("Should return a feature matrix with Jaccard distances between set vertices", () => {
  const featureMatrix = CreateSetSimilariyFeatureMatrix(mockGraph);

  const expectedMatrix = [
    [0, 0, 0.33],
    [0, 0, 0.5],
    [0.33, 0.5, 0],
  ];

  const desc = ["Set1", "Set2", "Set3"];

  for (let i = 0; i < mockGraph.sets.length; i++) {
    expect(featureMatrix.descriptor[i]).toBe(desc[i]);
    for (let j = 0; j < mockGraph.sets.length; j++) {
      expect(featureMatrix.matrix[i][j]).toBeCloseTo(expectedMatrix[i][j]);
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
        vertices: [],
        edges: [],
        sets: [],
      },
    ],
  };
  const featureMatrix = CreateSetSimilariyFeatureMatrix(graphWithEmptySet);
  // Jaccard distance between Set2 and Set3 should be 0 (both have no vertices)
  expect(featureMatrix.matrix[1][3]).toBe(0);
});
