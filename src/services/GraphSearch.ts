import type { Graph, GraphVertex } from "../model/graph";

export const VertexPrefix: string = "v:";
export const SetPrefix: string = "s:";
export const AllPostfix: string = "*";
export const QuerySeperator: string = ",";

export function GraphSearch(
  query: string,
  graph: Graph,
): [GraphVertex[] | undefined, Graph[] | undefined] {
  if (query === undefined || query.length <= 0) return [undefined, undefined];

  const hasAllPostfix: boolean = query.endsWith(AllPostfix);

  // Check if query has postfix
  if (hasAllPostfix) {
    query = query.substring(0, query.length - AllPostfix.length);
  }

  if (query.startsWith(VertexPrefix)) {
    // Vertex search
    const newQuery: string = query.substring(VertexPrefix.length, query.length);
    return [searchVertex(newQuery, graph.vertices, hasAllPostfix), undefined];
  } else if (query.startsWith(SetPrefix)) {
    // Set search
    const newQuery: string = query.substring(SetPrefix.length, query.length);
    return [undefined, searchSets(newQuery, graph.sets, hasAllPostfix)];
  } else {
    // All search
    return [
      searchVertex(query, graph.vertices, hasAllPostfix),
      searchSets(query, graph.sets, hasAllPostfix),
    ];
  }
}

function getQueryObjs(query: string): string[] {
  return query.includes(QuerySeperator) ? query.split(QuerySeperator) : [query];
}

function searchVertex(
  query: string,
  vertices: GraphVertex[],
  hasAllPostfix: boolean,
): GraphVertex[] | undefined {
  if (vertices === undefined || vertices.length <= 0) return undefined;

  const foundVertices: GraphVertex[] = [];
  const queryObj: string[] = getQueryObjs(query);

  vertices.forEach((vertex) => {
    if (hasAllPostfix) {
      queryObj.forEach((q) => {
        if (vertex.name.startsWith(q)) {
          foundVertices.push(vertex);
        }
      });
    } else {
      queryObj.forEach((q) => {
        if (vertex.name === q) {
          foundVertices.push(vertex);
        }
      });
    }
  });

  return foundVertices.length > 0 ? foundVertices : undefined;
}

function searchSets(
  query: string,
  sets: Graph[],
  hasAllPostfix: boolean,
): Graph[] | undefined {
  if (sets === undefined || sets.length <= 0) return undefined;

  const foundSets: Graph[] = [];
  const queryObj: string[] = getQueryObjs(query);

  sets.forEach((set) => {
    if (hasAllPostfix) {
      queryObj.forEach((q) => {
        if (set.name.startsWith(q)) {
          foundSets.push(set);
        }
      });
    } else {
      queryObj.forEach((q) => {
        if (set.name === q) {
          foundSets.push(set);
        }
      });
    }
  });

  return foundSets.length > 0 ? foundSets : undefined;
}
