import { expect, test } from "vitest";
import { type Graph } from "../model/graph";
import { CombineGraphs } from "../util/GraphUtil";

test("Combines two empty graphs", () => {
  const g1: Graph = {
    name: "Graph 1",
    vertices: [],
    edges: [],
    sets: [],
  };

  const g2: Graph = {
    name: "Graph 2",
    vertices: [],
    edges: [],
    sets: [],
  };

  const result = CombineGraphs(g1, g2);

  expect(result.name).toBe("Graph 1 + Graph 2");
  expect(result.vertices).toEqual([]);
  expect(result.edges).toEqual([]);
  expect(result.sets).toEqual([]);
});

test("Combines two non-empty graphs without duplicate vertices or edges", () => {
  const g1: Graph = {
    name: "Graph 1",
    vertices: [
      { name: "1", sets: [], neighbours: [] },
      { name: "2", sets: [], neighbours: [] },
    ],
    edges: [
      {
        source: { name: "1", sets: [], neighbours: [] },
        target: { name: "2", sets: [], neighbours: [] },
        edge: "A",
        set: "1",
        distance: 1,
      },
    ],
    sets: [],
  };

  const g2: Graph = {
    name: "Graph 2",
    vertices: [{ name: "3", sets: [], neighbours: [] }],
    edges: [
      {
        source: { name: "2", sets: [], neighbours: [] },
        target: { name: "3", sets: [], neighbours: [] },
        edge: "B",
        set: "2",
        distance: 1,
      },
    ],
    sets: [],
  };

  const result = CombineGraphs(g1, g2);

  expect(result.name).toBe("Graph 1 + Graph 2");
  expect(result.vertices).toEqual([
    { name: "1", sets: [], neighbours: [] },
    { name: "2", sets: [], neighbours: [] },
    { name: "3", sets: [], neighbours: [] },
  ]);
  expect(result.edges).toEqual([
    {
      source: { name: "1", sets: [], neighbours: [] },
      target: { name: "2", sets: [], neighbours: [] },
      edge: "A",
      set: "1",
      distance: 1,
    },
    {
      source: { name: "2", sets: [], neighbours: [] },
      target: { name: "3", sets: [], neighbours: [] },
      edge: "B",
      set: "2",
      distance: 1,
    },
  ]);
  expect(result.sets).toEqual([]);
});

test("Combines two graphs with duplicate vertices and edges", () => {
  const g1: Graph = {
    name: "Graph 1",
    vertices: [
      { name: "1", sets: [], neighbours: [] },
      { name: "2", sets: [], neighbours: [] },
    ],
    edges: [
      {
        source: { name: "1", sets: [], neighbours: [] },
        target: { name: "2", sets: [], neighbours: [] },
        edge: "A",
        set: "1",
        distance: 1,
      },
    ],
    sets: [],
  };

  const g2: Graph = {
    name: "Graph 2",
    vertices: [
      { name: "1", sets: [], neighbours: [] },
      { name: "2", sets: [], neighbours: [] },
    ],
    edges: [
      {
        source: { name: "1", sets: [], neighbours: [] },
        target: { name: "2", sets: [], neighbours: [] },
        edge: "A",
        set: "1",
        distance: 1,
      },
    ],
    sets: [],
  };

  const result = CombineGraphs(g1, g2);

  expect(result.name).toBe("Graph 1 + Graph 2");
  expect(result.vertices).toEqual([
    { name: "1", sets: [], neighbours: [] },
    { name: "2", sets: [], neighbours: [] },
  ]);
  expect(result.edges).toEqual([
    {
      source: { name: "1", sets: [], neighbours: [] },
      target: { name: "2", sets: [], neighbours: [] },
      edge: "A",
      set: "1",
      distance: 1,
    },
  ]);
  expect(result.sets).toEqual([]);
});
