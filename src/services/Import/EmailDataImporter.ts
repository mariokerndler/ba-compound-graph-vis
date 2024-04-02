import type { Graph, GraphEdge, GraphVertex } from "../../model/graph";
import type { IImport } from "./IImport";

export class EmailImporter implements IImport {
  private verticesMap = new Map<string, GraphVertex>();
  private edgesMap = new Map<string, GraphEdge>();

  importData(data: Map<string, string>): Promise<Graph> {
    this.verticesMap.clear();
    this.edgesMap.clear();

    const sets: Graph[] = [];

    const setdata = data.get("emailSets");
    if (setdata) {
      this.importSets(setdata, sets);
    }

    const edgeList = data.get("emailEdges");
    if (edgeList) {
      this.importEdges(edgeList, sets);
    }

    const vertices = Array.from(this.verticesMap.values());
    const edges = Array.from(this.edgesMap.values());

    const graph: Graph = {
      name: "Email-Graph",
      vertices: vertices,
      edges: edges,
      sets: sets,
    };

    console.log(graph);
    const reducedGraph = this.reduceGraph(graph, 1, 10);
    console.log(reducedGraph);

    return Promise.resolve(reducedGraph);
  }

  private importSets(setList: string, sets: Graph[]) {
    const lines = setList.split("\n");

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].length <= 0) continue;

      const line = lines[i].split(" ");
      const vertexName = line[0];
      const setName = line[1];

      if (vertexName.length <= 0 || setName.length <= 0) continue;

      let set = sets.find((s) => s.name === setName);
      if (!set) {
        set = {
          name: setName,
          vertices: [],
          edges: [],
          sets: [],
        };
        sets.push(set);
      }

      let vertex = this.verticesMap.get(vertexName);
      if (!vertex) {
        vertex = {
          name: vertexName,
          sets: [setName],
          neighbours: [],
        };
        this.verticesMap.set(vertexName, vertex);
      }

      set.vertices.push(vertex);
    }
  }

  private importEdges(edgeList: string, sets: Graph[]) {
    const lines = edgeList.split("\n");

    for (let i = 0; i < 15000; i++) {
      if (lines[i].length <= 0) continue;

      const line = lines[i].split(" ");
      const from = line[0];
      const to = line[1];

      if (from === to) continue;

      if (from.length <= 0 || to.length <= 0) {
        Error("Line entry is empty");
        continue;
      }

      const fromVert = this.verticesMap.get(from);
      const toVert = this.verticesMap.get(to);

      if (!fromVert || !toVert) {
        continue;
      }

      // Create edge if it does not exist
      const edgeId = [from, to].sort().join("-");
      let edge = this.edgesMap.get(edgeId);
      if (!edge) {
        edge = {
          source: fromVert,
          target: toVert,
          edge: "",
          distance: Math.random(),
          set: fromVert.sets[0],
        };
        this.edgesMap.set(edgeId, edge);
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

  private reduceGraph(graph: Graph, from: Number, to: Number): Graph {
    const sets: Graph[] = [];

    graph.sets.forEach((s) => {
      const nName = Number(s.name) as Number;
      if (nName >= from && nName <= to) {
        sets.push(s);
      }
    });

    const vertices = this.removeDuplicateVertices(
      sets.flatMap((s) => s.vertices),
    );
    const edges = this.removeDuplicateEdges(sets.flatMap((s) => s.edges));

    return {
      name: "Harry-Potter-Graph-Subset" + "-" + from + "to" + to,
      vertices: vertices,
      edges: edges,
      sets: sets,
    };
  }

  private removeDuplicateVertices(vertices: GraphVertex[]): GraphVertex[] {
    const uniqueNames = new Set<string>();
    const uniqueVertices: GraphVertex[] = [];

    vertices.forEach((vertex) => {
      if (!uniqueNames.has(vertex.name)) {
        uniqueNames.add(vertex.name);
        uniqueVertices.push(vertex);
      }
    });

    return uniqueVertices;
  }

  private removeDuplicateEdges(edges: GraphEdge[]): GraphEdge[] {
    const uniqueEdgeIds = new Set<string>();
    const uniqueEdges: GraphEdge[] = [];

    edges.forEach((edge) => {
      const edgeId = [edge.source.name, edge.target.name].sort().join("-");

      if (!uniqueEdgeIds.has(edgeId)) {
        uniqueEdgeIds.add(edgeId);
        uniqueEdges.push(edge);
      }
    });

    return uniqueEdges;
  }
}
