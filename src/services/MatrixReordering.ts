import type { SimilarityContainer } from "../model/similarity";

import { agnes } from "ml-hclust";

export function SortAscendingSimilarityContainer(container: SimilarityContainer): SimilarityContainer {
  // Create an array of indices representing the original order
  const originalOrder: number[] = Array.from(container.descriptor.keys());

  // Sort the indices based on the corresponding descriptor values
  const sortedIndices: number[] = originalOrder.sort((a, b) => container.descriptor[a].localeCompare(container.descriptor[b]));

  // Create a new sorted descriptor array and matrix
  const sortedDescriptor: string[] = sortedIndices.map((index) => container.descriptor[index]);
  const sortedMatrix: number[][] = sortedIndices.map((i) => sortedIndices.map((j) => container.matrix[i][j]));

  // Create and return a new SimilarityContainer with sorted values
  const sortedContainer: SimilarityContainer = {
    descriptor: sortedDescriptor,
    matrix: sortedMatrix,
  };

  return sortedContainer;
}

export function SortDescendingSimilarityContainer(container: SimilarityContainer): SimilarityContainer {
  // Create an array of indices representing the original order
  const originalOrder: number[] = Array.from(container.descriptor.keys());

  // Sort the indices based on the corresponding descriptor values in descending order
  const sortedIndices: number[] = originalOrder.sort((a, b) => container.descriptor[b].localeCompare(container.descriptor[a]));

  // Create a new sorted descriptor array and matrix
  const sortedDescriptor: string[] = sortedIndices.map((index) => container.descriptor[index]);
  const sortedMatrix: number[][] = sortedIndices.map((i) => sortedIndices.map((j) => container.matrix[i][j]));

  // Create and return a new SimilarityContainer with sorted values
  const sortedContainer: SimilarityContainer = {
    descriptor: sortedDescriptor,
    matrix: sortedMatrix,
  };

  return sortedContainer;
}

export function SortRandomSimilarityContainer(container: SimilarityContainer): SimilarityContainer {
  // Create an array of indices representing the original order
  const originalOrder: number[] = Array.from(container.descriptor.keys());

  // Shuffle the indices array randomly
  const shuffledIndices: number[] = shuffleArray(originalOrder);

  // Create a new sorted descriptor array and matrix
  const sortedDescriptor: string[] = shuffledIndices.map((index) => container.descriptor[index]);
  const sortedMatrix: number[][] = shuffledIndices.map((i) => shuffledIndices.map((j) => container.matrix[i][j]));

  // Create and return a new SimilarityContainer with sorted values
  const sortedContainer: SimilarityContainer = {
    descriptor: sortedDescriptor,
    matrix: sortedMatrix,
  };

  return sortedContainer;
}

export function SortClusteringSimilarityContainer(container: SimilarityContainer): SimilarityContainer {
  const hclust = new agnes(container.matrix);

  // Sort the indices based on the corresponding descriptor values
  const clusterdIndices: number[] = hclust.indices();

  // Create a new sorted descriptor array and matrix
  const sortedDescriptor: string[] = clusterdIndices.map((index) => container.descriptor[index]);
  const sortedMatrix: number[][] = clusterdIndices.map((i) => clusterdIndices.map((j) => container.matrix[i][j]));

  // Create and return a new SimilarityContainer with sorted values
  const sortedContainer: SimilarityContainer = {
    descriptor: sortedDescriptor,
    matrix: sortedMatrix,
  };

  return sortedContainer;
}

// Helper function to shuffle an array randomly
function shuffleArray(array: any[]): any[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
