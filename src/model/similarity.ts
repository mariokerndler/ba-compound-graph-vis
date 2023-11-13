export interface SimilarityContainer {
  readonly descriptor: string[];
  readonly matrix: number[][];
}

export interface SimilarityConnectionPoint {
  readonly cy: number;
  readonly id: string;
}
