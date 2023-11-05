import { expect, test } from "vitest";
import { JaccardDistance } from "../util/GraphUtil";

test("Should calculate Jaccard distance for arrays with numbers", () => {
  const array1 = [1, 2, 3, 4, 5];
  const array2 = [3, 4, 5, 6, 7];

  // The intersection is [3, 4, 5], and the union is [1, 2, 3, 4, 5, 6, 7].
  // Jaccard distance is intersection size / union size = 3 / 7.
  const result = JaccardDistance(array1, array2);
  expect(result).toBeCloseTo(3 / 7, 6); // Use toBeCloseTo for floating-point comparison.
});

test("Should handle arrays with strings", () => {
  const array1 = ["apple", "banana", "cherry"];
  const array2 = ["banana", "cherry", "date"];

  // The intersection is ['banana', 'cherry'], and the union is ['apple', 'banana', 'cherry', 'date'].
  // Jaccard distance is intersection size / union size = 2 / 4.
  const result = JaccardDistance(array1, array2);
  expect(result).toBeCloseTo(0.5, 6);
});

test("Should handle empty arrays", () => {
  const array1: number[] = [];
  const array2: number[] = [];

  // Both arrays are empty, and the Jaccard distance is 0.
  const result = JaccardDistance(array1, array2);
  expect(result).toBe(0);
});

test("Should handle arrays with no common elements", () => {
  const array1 = [1, 2, 3];
  const array2 = [4, 5, 6];

  // The intersection is [], and the union is [1, 2, 3, 4, 5, 6].
  // Jaccard distance is intersection size / union size = 0 / 6.
  const result = JaccardDistance(array1, array2);
  expect(result).toBe(0);
});
