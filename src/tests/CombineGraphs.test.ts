import { type Graph } from "../model/graph";
import { CombineGraphs } from "../util/GraphUtil";
import { expect, test } from "vitest";

test("Combines two empty graphs", () => {
  const g1: Graph = {
    name: "Graph 1",
    color: "red",
    vertices: [],
    edges: [],
    sets: [],
  };

  const g2: Graph = {
    name: "Graph 2",
    color: "blue",
    vertices: [],
    edges: [],
    sets: [],
  };

  const result = CombineGraphs(g1, g2);

  expect(result.name).toBe("Graph 1 + Graph 2");
  expect(result.color).toBe("black");
  expect(result.vertices).toEqual([]);
  expect(result.edges).toEqual([]);
  expect(result.sets).toEqual([]);
});

test("Combines two non-empty graphs without duplicate vertices or edges", () => {
  const g1: Graph = {
    name: "Graph 1",
    color: "red",
    vertices: [
      { id: "1", sets: [], neighbours: [] },
      { id: "2", sets: [], neighbours: [] },
    ],
    edges: [
      {
        source: { id: "1", sets: [], neighbours: [] },
        target: { id: "2", sets: [], neighbours: [] },
        edge: "A",
        set: "1",
      },
    ],
    sets: [],
  };

  const g2: Graph = {
    name: "Graph 2",
    color: "blue",
    vertices: [{ id: "3", sets: [], neighbours: [] }],
    edges: [
      {
        source: { id: "2", sets: [], neighbours: [] },
        target: { id: "3", sets: [], neighbours: [] },
        edge: "B",
        set: "2",
      },
    ],
    sets: [],
  };

  const result = CombineGraphs(g1, g2);

  expect(result.name).toBe("Graph 1 + Graph 2");
  expect(result.color).toBe("black");
  expect(result.vertices).toEqual([
    { id: "1", sets: [], neighbours: [] },
    { id: "2", sets: [], neighbours: [] },
    { id: "3", sets: [], neighbours: [] },
  ]);
  expect(result.edges).toEqual([
    {
      source: { id: "1", sets: [], neighbours: [] },
      target: { id: "2", sets: [], neighbours: [] },
      edge: "A",
      set: "1",
    },
    {
      source: { id: "2", sets: [], neighbours: [] },
      target: { id: "3", sets: [], neighbours: [] },
      edge: "B",
      set: "2",
    },
  ]);
  expect(result.sets).toEqual([]);
});

test("Combines two graphs with duplicate vertices and edges", () => {
  const g1: Graph = {
    name: "Graph 1",
    color: "red",
    vertices: [
      { id: "1", sets: [], neighbours: [] },
      { id: "2", sets: [], neighbours: [] },
    ],
    edges: [
      {
        source: { id: "1", sets: [], neighbours: [] },
        target: { id: "2", sets: [], neighbours: [] },
        edge: "A",
        set: "1",
      },
    ],
    sets: [],
  };

  const g2: Graph = {
    name: "Graph 2",
    color: "blue",
    vertices: [
      { id: "1", sets: [], neighbours: [] },
      { id: "2", sets: [], neighbours: [] },
    ],
    edges: [
      {
        source: { id: "1", sets: [], neighbours: [] },
        target: { id: "2", sets: [], neighbours: [] },
        edge: "A",
        set: "1",
      },
    ],
    sets: [],
  };

  const result = CombineGraphs(g1, g2);

  expect(result.name).toBe("Graph 1 + Graph 2");
  expect(result.color).toBe("black");
  expect(result.vertices).toEqual([
    { id: "1", sets: [], neighbours: [] },
    { id: "2", sets: [], neighbours: [] },
  ]);
  expect(result.edges).toEqual([
    {
      source: { id: "1", sets: [], neighbours: [] },
      target: { id: "2", sets: [], neighbours: [] },
      edge: "A",
      set: "1",
    },
  ]);
  expect(result.sets).toEqual([]);
});
