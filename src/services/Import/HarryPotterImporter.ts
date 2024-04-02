import type { Graph, GraphEdge, GraphVertex } from "../../model/graph";
import type { IImport } from "./IImport";

export class HPImporter implements IImport {
  importData(data: Map<string, string>): Promise<Graph> {
    const graph: Graph = {
      name: "Harry-Potter-Graph",
      vertices: [],
      edges: [],
      sets: [],
    };

    const vertexMap = new Map<string, GraphVertex>();
    const edgeSet = new Set<string>(); // Using a Set to uniquely identify an edge by its vertices

    data.forEach((data, fileName) =>
      this.importBook(data, fileName, graph, vertexMap, edgeSet),
    );

    console.log(graph);

    return Promise.resolve(graph);
  }

  private importBook(
    data: string,
    fileName: string,
    graph: Graph,
    vertexMap: Map<string, GraphVertex>,
    edgeSet: Set<string>,
  ) {
    const set: Graph = {
      name: this.constructName(fileName),
      vertices: [],
      edges: [],
      sets: [],
    };

    const maxWeight = this.getMaxWeightForSet(data);

    data
      .split("\n")
      .slice(1)
      .forEach((line) => {
        const [source, target, weightStr] = line.split(",");
        const weight = Number(weightStr);
        if (
          source === undefined ||
          target === undefined ||
          source === "" ||
          target === ""
        )
          return;
        if (source === target || weight < 0) return;

        const edgeIdentifier = `${source}-${target}`;
        if (edgeSet.has(edgeIdentifier)) return;
        edgeSet.add(edgeIdentifier);

        const sourceVert = this.getOrCreateVertex(
          source,
          set,
          vertexMap,
          graph,
        );
        const targetVert = this.getOrCreateVertex(
          target,
          set,
          vertexMap,
          graph,
        );

        sourceVert.neighbours.push(target);
        targetVert.neighbours.push(source);

        const edge: GraphEdge = {
          source: sourceVert,
          target: targetVert,
          edge: "",
          distance: weight / maxWeight,
          set: set.name,
        };

        set.edges.push(edge);
        graph.edges.push(edge);
      });

    graph.sets.push(set);
  }

  private getOrCreateVertex(
    name: string,
    set: Graph,
    vertexMap: Map<string, GraphVertex>,
    graph: Graph,
  ): GraphVertex {
    let vertex = vertexMap.get(name);
    if (!vertex) {
      vertex = {
        name,
        sets: [set.name],
        neighbours: [],
      };
      vertexMap.set(name, vertex);
      graph.vertices.push(vertex);
      set.vertices.push(vertex);
    } else {
      if (!vertex.sets.includes(set.name)) {
        vertex.sets.push(set.name);
        set.vertices.push(vertex);
      }
    }
    return vertex;
  }

  private constructName(fileName: string): string {
    return fileName.split("_")[1];
  }

  private getMaxWeightForSet(data: string): number {
    return data
      .split("\n")
      .slice(1)
      .reduce((max, line) => {
        const weight = Number(line.split(",")[2]);
        return weight > max ? weight : max;
      }, 0);
  }
}
