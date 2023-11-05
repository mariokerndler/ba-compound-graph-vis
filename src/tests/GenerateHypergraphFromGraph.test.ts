import { expect, test } from "vitest";
import type { Graph, GraphEdge, GraphVertex } from "../model/graph";
import { type Hypergraph, HypernodeType } from "../model/hypergraph.";
import { GenerateHypergraphFromGraph } from "../util/GraphUtil";

test("Should generate a hypergraph from a given graph with shared vertex", () => {
  const vertex1: GraphVertex = {
    id: "vertex1",
    sets: ["set1"],
    neighbours: [],
  };
  const vertex2: GraphVertex = {
    id: "vertex2",
    sets: ["set1", "set2"],
    neighbours: [],
  };
  const vertex3: GraphVertex = {
    id: "vertex3",
    sets: ["set2"],
    neighbours: [],
  };

  const edge1: GraphEdge = {
    source: vertex1,
    target: vertex2,
    edge: "edge1",
    set: "set1",
  };

  const edge2: GraphEdge = {
    source: vertex2,
    target: vertex3,
    edge: "edge2",
    set: "set1",
  };

  // Create a sample graph
  const graph: Graph = {
    name: "TestGraph",
    color: "blue",
    vertices: [vertex1, vertex2, vertex3],
    edges: [edge1, edge2],
    sets: [
      {
        name: "set1",
        color: "black",
        vertices: [vertex1, vertex2],
        edges: [edge1],
        sets: [],
      },
      {
        name: "set2",
        color: "black",
        vertices: [vertex2, vertex3],
        edges: [edge2],
        sets: [],
      },
    ],
  };

  // Expected hypergraph
  const expectedHypergraph: Hypergraph = {
    name: "TestGraph-Hypergraph",
    vertices: [
      {
        name: "set1",
        type: HypernodeType.SET,
        size: 2,
      },
      {
        name: "set2",
        type: HypernodeType.SET,
        size: 2,
      },
      {
        name: "vertex2",
        type: HypernodeType.VERTEX,
        size: 2,
      },
    ],
    edges: [
      {
        source: {
          name: "vertex2",
          type: HypernodeType.VERTEX,
          size: 2,
        },
        target: {
          name: "set1",
          type: HypernodeType.SET,
          size: 2,
        },
      },
      {
        source: {
          name: "vertex2",
          type: HypernodeType.VERTEX,
          size: 2,
        },
        target: {
          name: "set2",
          type: HypernodeType.SET,
          size: 2,
        },
      },
    ],
  };

  const result = GenerateHypergraphFromGraph(graph);

  expect(result).toEqual(expectedHypergraph);
});

test("Should generate a hypergraph from a given graph without shared vertex", () => {
  const vertex1: GraphVertex = {
    id: "vertex1",
    sets: ["set1"],
    neighbours: [],
  };
  const vertex2: GraphVertex = {
    id: "vertex2",
    sets: ["set1"],
    neighbours: [],
  };
  const vertex3: GraphVertex = {
    id: "vertex3",
    sets: ["set2"],
    neighbours: [],
  };
  const vertex4: GraphVertex = {
    id: "vertex4",
    sets: ["set2"],
    neighbours: [],
  };

  const edge1: GraphEdge = {
    source: vertex1,
    target: vertex2,
    edge: "edge1",
    set: "set1",
  };

  const edge2: GraphEdge = {
    source: vertex3,
    target: vertex4,
    edge: "edge2",
    set: "set2",
  };

  // Create a sample graph
  const graph: Graph = {
    name: "TestGraph",
    color: "blue",
    vertices: [vertex1, vertex2, vertex3, vertex4],
    edges: [edge1, edge2],
    sets: [
      {
        name: "set1",
        color: "black",
        vertices: [vertex1, vertex2],
        edges: [edge1],
        sets: [],
      },
      {
        name: "set2",
        color: "black",
        vertices: [vertex3, vertex4],
        edges: [edge2],
        sets: [],
      },
    ],
  };

  // Expected hypergraph
  const expectedHypergraph: Hypergraph = {
    name: "TestGraph-Hypergraph",
    vertices: [
      {
        name: "set1",
        type: HypernodeType.SET,
        size: 2,
      },
      {
        name: "set2",
        type: HypernodeType.SET,
        size: 2,
      },
    ],
    edges: [],
  };

  const result = GenerateHypergraphFromGraph(graph);

  expect(result).toEqual(expectedHypergraph);
});
