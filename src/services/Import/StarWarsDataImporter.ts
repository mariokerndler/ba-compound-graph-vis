import type { Graph, GraphEdge, GraphVertex } from "../../model/graph";
import type { IImport } from "./IImport";

export class StarWarsDataImporter implements IImport {
  importData(data: Map<string, string>): Promise<Graph> {
    const episodeList: EpisodeInteraction[] = [];
    data.forEach((data, name) =>
      episodeList.push(this.importEpisode(data, name)),
    );

    let vertices: GraphVertex[] = [];
    const sets: Graph[] = [];
    const edges: GraphEdge[] = [];

    episodeList.forEach((e) => {
      const sVertices = this.parseVertices(e.nodes, vertices, e.name);
      // Add vertiices to existing
      sVertices.forEach((v) => {
        if (!vertices.find((e) => e.name === v.name)) {
          vertices.push(v);
        }
      });

      const maxLinkValue = this.getMaxLinkValue(e);

      const sEdges = this.parseEdges(
        e.links,
        e.nodes,
        vertices,
        e.name,
        maxLinkValue,
      );
      sEdges.forEach((e) => edges.push(e));

      const set: Graph = {
        name: e.name,
        vertices: sVertices,
        edges: sEdges,
        sets: [],
      };
      sets.push(set);
    });

    const graph: Graph = {
      name: "Starwars-Episodes-Graph",
      vertices: vertices,
      edges: edges,
      sets: sets,
    };

    return new Promise((resolve) => {
      resolve(graph);
    });
  }

  private importEpisode(data: string, name: string): EpisodeInteraction {
    const ep: EpisodeInteraction = JSON.parse(data);

    ep.name = this.constructName(name);

    ep.nodes.forEach((e, i) => (e.id = i));

    return ep;
  }

  private constructName(name: string): string {
    const splitName = name.split("-");

    return `${splitName[0]}-${splitName[1]}-${splitName[2]}`;
  }

  private parseVertices(
    nodes: SWNode[],
    existingVertices: GraphVertex[],
    setName: string,
  ): GraphVertex[] {
    const vertices: GraphVertex[] = [];

    nodes.forEach((n) => {
      let vert = existingVertices.find((e) => e.name === n.name);
      if (vert) {
        vert.sets.push(setName);
      } else {
        vert = {
          name: n.name,
          sets: [setName],
          neighbours: [],
        };
      }
      vertices.push(vert);
    });

    return vertices;
  }

  private parseEdges(
    links: SWLink[],
    nodes: SWNode[],
    vertices: GraphVertex[],
    setName: string,
    maxLinkValue: number,
  ): GraphEdge[] {
    const edges: GraphEdge[] = [];

    links.forEach((l) => {
      const sNode = nodes.find((n) => n.id === l.source);
      if (!sNode) return;
      const source = vertices.find((v) => v.name === sNode.name);
      if (!source) return;

      const tNode = nodes.find((n) => n.id === l.target);
      if (!tNode) return;
      const target = vertices.find((v) => v.name === tNode.name);
      if (!target) return;

      if (!source.neighbours.includes(target.name)) {
        source.neighbours.push(target.name);
      }

      if (!target.neighbours.includes(source.name)) {
        target.neighbours.push(source.name);
      }

      const newEdge: GraphEdge = {
        source: source,
        target: target,
        edge: "",
        distance: l.value / maxLinkValue,
        set: setName,
      };

      edges.push(newEdge);
    });

    return edges;
  }

  private getMaxLinkValue(episodeInteraction: EpisodeInteraction): number {
    let max = 0;
    episodeInteraction.links.forEach((link) => {
      if (link.value > max) {
        max = link.value;
      }
    });
    return max;
  }
}

interface EpisodeInteraction {
  name: string;
  nodes: SWNode[];
  links: SWLink[];
}

interface SWNode {
  id: number;
  name: string;
  value: number;
  colour: string;
}

interface SWLink {
  source: number;
  target: number;
  value: number;
}
