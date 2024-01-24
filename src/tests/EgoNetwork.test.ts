import { test } from "vitest";
import type { Graph, GraphEdge, GraphVertex } from "../model/graph";
import { CreateEgoNetworkFromGraph } from "../util/EgoNetworkUtil";

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
  name: "e",
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

test("Conver graph to egonet", () => {
  const result = CreateEgoNetworkFromGraph(graph, vertexA, 5);

  console.log(result);
});
