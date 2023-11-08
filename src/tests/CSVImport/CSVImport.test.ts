import { expect, test } from "vitest";
import type { Graph, GraphEdge, GraphVertex } from "../../model/graph";
import { CSVImport } from "../../services/Import/CSVImport";

const edgeListSet1: string = "vertex_a,vertex_b,edge\nA,B,1";
const edgeListSet2: string = "vertex_a,vertex_b,edge\nC,B,2";
const edgeListSet3: string = "vertex_a,vertex_b,edge\nA,C,3";

const vertexA: GraphVertex = {
  id: "A",
  sets: ["Set1", "Set3"],
  neighbours: ["B", "C"],
};

const vertexB: GraphVertex = {
  id: "B",
  sets: ["Set1", "Set2"],
  neighbours: ["A", "C"],
};

const vertexC: GraphVertex = {
  id: "C",
  sets: ["Set2", "Set3"],
  neighbours: ["B", "A"],
};

const edgeA: GraphEdge = {
  source: vertexA,
  target: vertexB,
  set: "Set1",
  edge: "1",
};

const edgeB: GraphEdge = {
  source: vertexC,
  target: vertexB,
  set: "Set2",
  edge: "2",
};

const edgeC: GraphEdge = {
  source: vertexA,
  target: vertexC,
  set: "Set3",
  edge: "3",
};

const mockGraph: Graph = {
  name: "Graph",
  vertices: [vertexA, vertexB, vertexC],
  edges: [edgeA, edgeB, edgeC],
  sets: [
    {
      name: "Set1",
      vertices: [vertexA, vertexB],
      edges: [edgeA],
      sets: [],
    },
    {
      name: "Set2",
      vertices: [vertexC, vertexB],
      edges: [edgeB],
      sets: [],
    },
    {
      name: "Set3",
      vertices: [vertexA, vertexC],
      edges: [edgeC],
      sets: [],
    },
  ],
};

test("Should import a simple edge list", async () => {
  const csvImport = new CSVImport();
  const edgeList = new Map<string, string>();

  // Set edge lists for each set
  edgeList.set("Set1", edgeListSet1);
  edgeList.set("Set2", edgeListSet2);
  edgeList.set("Set3", edgeListSet3);

  const result: Graph = await csvImport.import(edgeList);

  // Basic result testing
  expect(result.name).toBe("Graph");

  expect(result.vertices.length).toBe(3);
  expect(result.edges.length).toBe(3);
  expect(result.sets.length).toBe(3);

  expect(result).toStrictEqual(mockGraph);
});
