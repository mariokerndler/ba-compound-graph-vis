import { tsnejs } from "./tsne";

export interface SimulationOptions {
  learningRate: number;
  perplexity: number;
  iterations: number;
}

export function RunSimulation(
  featureMatrix: number[][],
  options?: SimulationOptions,
): number[][] {
  const learningRate = options?.learningRate || 10;
  const perplexity = options?.perplexity || 30;
  const iterations = options?.perplexity || 500;

  const opt = {
    epsilon: learningRate,
    perplexity: perplexity,
    dim: 2,
  };

  const tsne = new tsnejs.tSNE(opt);
  tsne.initDataRaw(featureMatrix);

  for (let i = 0; i < iterations; i++) {
    tsne.step();
  }
  
  return tsne.getSolution();
}
