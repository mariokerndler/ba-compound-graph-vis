import * as d3 from "d3";
import {
  type Graph,
  type GraphEdge,
  type GraphVertex,
} from "../../model/graph";

const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

export class CSVImport {
  async import(edgeList: Map<string, string>): Promise<Graph> {
    const graph: Graph = this.parseGraph(edgeList);

    return new Promise((resolve) => {
      resolve(graph);
    });
  }

  private parseGraph(edgeList: Map<string, string>): Graph {
    const graphVertices: GraphVertex[] = [];
    const graphEdges: GraphEdge[] = [];
    const graphSets: Graph[] = [];

    // Create a map: key = vertex name, value = vertex
    const vertexMap: Map<string, GraphVertex> = new Map();

    // Go over each set in edge list
    edgeList.forEach((edgeList, setName) => {
      // Parse the edge list to 'Edge' datastructure
      const edges: Edge[] = this.parseEdgeList(edgeList);

      const setVertices: GraphVertex[] = [];
      const setEdges: GraphEdge[] = [];

      // Go over each edge in edge list
      edges.forEach((ed) => {
        // Check if the vertexA already exists, if not create a new one
        let vertexA = vertexMap.get(ed.vertexA);
        if (vertexA === undefined) {
          vertexA = {
            id: ed.vertexA,
            sets: [setName],
          };
          vertexMap.set(ed.vertexA, vertexA);
        }

        // Add set to vertexA sets list
        if (!vertexA.sets.includes(setName)) vertexA.sets.push(setName);

        // Check if the vertexB already exists, if not create a new one
        let vertexB = vertexMap.get(ed.vertexB);
        if (vertexB === undefined) {
          vertexB = {
            id: ed.vertexB,
            sets: [setName],
          };
          vertexMap.set(ed.vertexB, vertexA);
        }

        // Add set to vertexB sets list
        if (!vertexB.sets.includes(setName)) vertexB.sets.push(setName);

        const edge: GraphEdge = {
          source: vertexA,
          target: vertexB,
          edge: ed.edge,
          set: setName,
        };

        // Add vertices and edge to set
        if (!setVertices.includes(vertexA)) setVertices.push(vertexA);
        if (!setVertices.includes(vertexB)) setVertices.push(vertexB);
        if (!setEdges.includes(edge)) setEdges.push(edge);

        // Add vertices and edge to global graph
        if (!graphVertices.includes(vertexA)) graphVertices.push(vertexA);
        if (!graphVertices.includes(vertexB)) graphVertices.push(vertexB);
        if (!graphEdges.includes(edge)) graphEdges.push(edge);
      });

      // Create set
      const set: Graph = {
        name: setName,
        color: colorScale(setName),
        vertices: setVertices,
        edges: setEdges,
        sets: [],
      };

      // Make sure the set actually has vertices
      if (set.vertices.length > 0) {
        // Add set to global graph
        graphSets.push(set);
      }
    });

    return {
      name: "Graph",
      color: "black",
      vertices: graphVertices,
      edges: graphEdges,
      sets: graphSets,
    };
  }

  private parseEdgeList(edgeList: string): Edge[] {
    const edges: Edge[] = [];

    const lines = edgeList.split("\n");
    const headers = lines[0].split(",");

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].split(",");

      if (line.length < headers.length) {
        // TODO: Add proper error handling
        // console.error('Skipping incomplete row:', line);
        continue;
      }

      const edge: Edge = {
        vertexA: line[0],
        vertexB: line[1],
        edge: line[2],
      };

      edges.push(edge);
    }

    return edges;
  }
}

interface Edge {
  vertexA: string;
  vertexB: string;
  edge: string;
}
