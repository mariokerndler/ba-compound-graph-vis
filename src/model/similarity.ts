export interface SimilarityContainer {
  readonly descriptor: string[];
  readonly matrix: number[][];
}

export interface SimilarityConnection {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  color: string;
  name: string;
}
