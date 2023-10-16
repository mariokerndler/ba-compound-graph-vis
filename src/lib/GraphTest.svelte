<script lang="ts">
import { Graph } from "../data/Graph";

const graph = new Graph<number>();

const vertex1 = graph.addVertex(1);
const vertex2 = graph.addVertex(2);
const vertex3 = graph.addVertex(3);
const vertex4 = graph.addVertex(4);

graph.addEdge(vertex1, vertex2);
graph.addEdge(vertex3, vertex4);
graph.addEdge(vertex1, vertex4);

const set1 = graph.addSet("Set 1");
const set2 = graph.addSet("Set 2");
const set3 = graph.addSet("Set 3");

set1.addElement(vertex1);
set1.addElement(vertex2);

set2.addElement(vertex3);
set2.addElement(vertex4);

set3.addElement(vertex1);
set3.addElement(vertex2);

console.log(graph.getVertices());
console.log(graph.getEdges());
console.log(graph.getSets());

console.log(`Jaccard between Set 1 and Set 2: ${graph.calculateJaccardSimilarity(set1, set2)}`);
console.log(`Jaccard between Set 1 and Set 3: ${graph.calculateJaccardSimilarity(set1, set3)}`);
console.log(`Jaccard between Set 2 and Set 3: ${graph.calculateJaccardSimilarity(set2, set3)}`);

console.log(`Overlap between Set 1 and Set 2: ${graph.calculateOverlapSimilarity(set1, set2)}`);
console.log(`Overlap between Set 1 and Set 3: ${graph.calculateOverlapSimilarity(set1, set3)}`);
console.log(`Overlap between Set 2 and Set 3: ${graph.calculateOverlapSimilarity(set2, set3)}`);

console.log(`Sorensen between Set 1 and Set 2: ${graph.calculateSorensenSimilarity(set1, set2)}`);
console.log(`Sorensen between Set 1 and Set 3: ${graph.calculateSorensenSimilarity(set1, set3)}`);
console.log(`Sorensen between Set 2 and Set 3: ${graph.calculateSorensenSimilarity(set2, set3)}`);

console.log(`Tversky between Set 1 and Set 2: ${graph.calculateTverskySimilarity(0.5, 0.5, set1, set2)}`);
console.log(`Tversky between Set 1 and Set 3: ${graph.calculateTverskySimilarity(0.5, 0.5, set1, set3)}`);
console.log(`Tversky between Set 2 and Set 3: ${graph.calculateTverskySimilarity(0.5, 0.5, set2, set3)}`);

</script>
