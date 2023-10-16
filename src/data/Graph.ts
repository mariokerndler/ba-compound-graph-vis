export class Vertex<T> {
  constructor(public data: T) { }
}

export class Edge<T> {
  constructor(
    public source: Vertex<T>,
    public destination: Vertex<T>,
  ) { }
}

export class GSet<T> {
  private elements: Set<Vertex<T>> = new Set();

  constructor(public name: string) { }

  addElement(element: Vertex<T>) {
    this.elements.add(element);
  }

  removeElement(element: Vertex<T>) {
    this.elements.delete(element);
  }

  getElements(): Vertex<T>[] {
    return Array.from(this.elements);
  }
}

export class Graph<T> {
  private vertices: Vertex<T>[] = [];
  private edges: Edge<T>[] = [];
  private sets: GSet<T>[] = [];

  addVertex(data: T): Vertex<T> {
    const vertex = new Vertex(data);
    this.vertices.push(vertex);
    return vertex;
  }

  addEdge(source: Vertex<T>, destination: Vertex<T>): Edge<T> {
    const edge = new Edge(source, destination);
    this.edges.push(edge);
    return edge;
  }

  addSet(name: string): GSet<T> {
    const set = new GSet<T>(name);
    this.sets.push(set);
    return set;
  }

  getVertices(): Vertex<T>[] {
    return this.vertices;
  }

  getEdges(): Edge<T>[] {
    return this.edges;
  }

  getSets(): GSet<T>[] {
    return this.sets;
  }
}
