import type { Graph, GraphEdge, GraphVertex } from "../../model/graph";
import type { IImport } from "./IImport";

export class LotrImporter implements IImport {
  importData(data: Map<string, string>): Promise<Graph> {
    const vertices: GraphVertex[] = [];
    const edges: GraphEdge[] = [];
    const sets: Graph[] = [];

    const nodeList = data.get("nodes");
    if (nodeList) {
      this.importNodeList(nodeList, vertices, sets);
    }

    const edgeList = data.get("weightededges");
    if (edgeList) {
      const maxWeight = this.getMaxWeight(edgeList);
      this.importEdges(edgeList, maxWeight, vertices, edges, sets);
    }

    const graph: Graph = {
      name: "Lotr-Graph",
      vertices: vertices,
      edges: edges,
      sets: sets,
    };

    console.log(graph);

    return new Promise((resolve) => {
      resolve(graph);
    });
  }

  private importNodeList(nodelist: string, vertices: GraphVertex[], sets: Graph[]) {
    const lines = nodelist.split("\n");
    const headers = lines[0].split(",");

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].split(",");

      if (line.length < headers.length) {
        Error("Skipping incomplete row: " + line);
        continue;
      }

      const character = line[1];
      const race = line[2];

      if (character.length <= 0 || race.length <= 0) {
        Error("Line entry is empty");
        continue;
      }

      // Check if the set exists, if not create it
      let set = sets.find((s) => s.name === race);
      if (!set) {
        set = {
          name: race,
          vertices: [],
          edges: [],
          sets: [],
        };
        sets.push(set);
      }

      let vertex = vertices.find((v) => v.name === character);
      if (!vertex) {
        vertex = {
          name: character,
          sets: [race],
          neighbours: [],
        };
        vertices.push(vertex);
      }

      set.vertices.push(vertex);
    }
  }

  private importEdges(edgeList: string, maxWeight: number, vertices: GraphVertex[], edges: GraphEdge[], sets: Graph[]) {
    const lines = edgeList.split("\n");
    const headers = lines[0].split(",");

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].split(",");

      if (line.length < headers.length) {
        Error("Skipping incomplete row: " + line);
        continue;
      }

      const from = line[0];
      const to = line[1];
      const weight = Number(line[2]);

      if (from === to) continue;

      if (from.length <= 0 || to.length <= 0 || weight === undefined) {
        Error("Line entry is empty");
        continue;
      }

      const fromVert = vertices.find((v) => v.name === from);
      const toVert = vertices.find((v) => v.name === to);

      if (!fromVert || !toVert) {
        continue;
      }

      // Create edge if it does not exist
      let edge = this.getEdge(fromVert, toVert, edges);
      if (!edge) {
        edge = {
          source: fromVert,
          target: toVert,
          edge: "",
          distance: weight / maxWeight,
          set: fromVert.sets[0],
        };
        edges.push(edge);
      }

      // Add edge to existing sets
      const fromSet = fromVert.sets[0];
      sets.find((s) => s.name === fromSet)?.edges.push(edge);

      const toSet = toVert.sets[0];
      sets.find((s) => s.name === toSet)?.edges.push(edge);

      // Add neighbours
      toVert.neighbours.push(fromVert.name);
      fromVert.neighbours.push(toVert.name);
    }
  }

  private getEdge(from: GraphVertex, to: GraphVertex, edges: GraphEdge[]): GraphEdge | undefined {
    return edges.find((e) => (e.source.name === from.name && e.target.name === to.name) || (e.source.name === to.name && e.target.name === from.name));
  }

  private getMaxWeight(edgeList: string): number {
    const lines = edgeList.split("\n");
    const headers = lines[0].split(",");
    let max = 1;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].split(",");

      if (line.length < headers.length) {
        Error("Skipping incomplete row: " + line);
        continue;
      }

      const weight = Number(line[2]);
      max = weight > max ? weight : max;
    }

    return max;
  }
}
