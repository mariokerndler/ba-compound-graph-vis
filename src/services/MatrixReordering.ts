import type { SimilarityContainer } from "../model/similarity";

import { agnes } from "ml-hclust";

export function SortAscendingSimilarityContainer(
  container: SimilarityContainer,
): SimilarityContainer {
  const sortedIndices = Array.from(container.descriptor.keys()).sort((a, b) =>
    container.descriptor[a].localeCompare(container.descriptor[b]),
  );

  return sortContainerByIndices(container, sortedIndices);
}

export function SortDescendingSimilarityContainer(
  container: SimilarityContainer,
): SimilarityContainer {
  const sortedIndices = Array.from(container.descriptor.keys()).sort((a, b) =>
    container.descriptor[b].localeCompare(container.descriptor[a]),
  );

  return sortContainerByIndices(container, sortedIndices);
}

export function SortRandomSimilarityContainer(
  container: SimilarityContainer,
): SimilarityContainer {
  const shuffledIndices = shuffleArray(Array.from(container.descriptor.keys()));

  return sortContainerByIndices(container, shuffledIndices);
}

export function SortClusteringSimilarityContainer(
  container: SimilarityContainer,
): SimilarityContainer {
  const hclust = new agnes(container.matrix);

  return sortContainerByIndices(container, hclust.indices());
}

function sortContainerByIndices(
  container: SimilarityContainer,
  indices: number[],
): SimilarityContainer {
  return {
    descriptor: indices.map((index) => container.descriptor[index]),
    matrix: indices.map((i) => indices.map((j) => container.matrix[i][j])),
  };
}

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
