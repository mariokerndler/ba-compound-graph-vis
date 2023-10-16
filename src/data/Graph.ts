export class Vertex<T> {
  constructor(public data: T) { }
}

export class Edge<T> {
  constructor(
    public source: Vertex<T>,
    public destination: Vertex<T>,
  ) { }
}

export enum Similarity {
  JACCARD,
  OVERLAP,
  TVERSKY,
  SORENSEN,
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

  calculateJaccardSimilarity(set1: GSet<T>, set2: GSet<T>): number {
    const elements1 = set1.getElements();
    const elements2 = set2.getElements();

    const intersection = this.intersection(elements1, elements2);

    const union = this.union(elements1, elements2);

    return intersection.length / union.length;
  }

  calculateOverlapSimilarity(set1: GSet<T>, set2: GSet<T>): number {
    const elements1 = set1.getElements();
    const elements2 = set2.getElements();

    const intersection = this.intersection(elements1, elements2);

    const smallerSize =
      elements1.length > elements2.length ? elements2.length : elements1.length;

    return intersection.length / smallerSize;
  }

  calculateSorensenSimilarity(set1: GSet<T>, set2: GSet<T>): number {
    const elements1 = set1.getElements();
    const elements2 = set2.getElements();

    const intersection = this.intersection(elements1, elements2);

    return (2 * intersection.length) / (elements1.length + elements2.length);
  }

  calculateTverskySimilarity(
    alpha: number,
    beta: number,
    set1: GSet<T>,
    set2: GSet<T>,
  ): number {
    const elements1 = set1.getElements();
    const elements2 = set2.getElements();

    const intersection = this.intersection(elements1, elements2);

    const size1Without2 = this.difference(elements1, elements2).length;
    const size2Without1 = this.difference(elements2, elements1).length;

    const numerator = intersection.length;
    const denominator =
      intersection.length + alpha * size1Without2 + beta * size2Without1;

    if (denominator === 0) {
      return 0; // Handle division by zero
    }

    return numerator / denominator;
  }

  generateAdjacencyMatrix(): number[][] {
    const nodeIndexMap = new Map<Vertex<T>, number>();
    this.vertices.forEach((node, index) => {
      nodeIndexMap.set(node, index);
    });

    const matrixSize = this.vertices.length;
    const adjacencyMatrix: number[][] = new Array(matrixSize)
      .fill(0)
      .map(() => new Array(matrixSize).fill(0));

    this.edges.forEach((edge) => {
      const source = edge.source;
      const destination = edge.destination;

      const sourceIndex = nodeIndexMap.get(source);
      const destinationIndex = nodeIndexMap.get(destination);

      if (sourceIndex != undefined && destinationIndex != undefined) {
        adjacencyMatrix[sourceIndex][destinationIndex] = 1;
        adjacencyMatrix[destinationIndex][sourceIndex] = 1;
      }
    });

    return adjacencyMatrix;
  }

  private intersection(
    elements1: Vertex<T>[],
    elements2: Vertex<T>[],
  ): Vertex<T>[] {
    return elements1.filter((el) => elements2.includes(el));
  }

  private union(elements1: Vertex<T>[], elements2: Vertex<T>[]): Vertex<T>[] {
    return Array.from(new Set([...elements1, ...elements2]));
  }

  private difference(
    elements1: Vertex<T>[],
    elements2: Vertex<T>[],
  ): Vertex<T>[] {
    return elements1.filter((element) => !elements2.includes(element));
  }
}
