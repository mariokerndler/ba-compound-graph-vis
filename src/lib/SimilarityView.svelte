<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { Unsubscriber } from "svelte/store";
  import { graphObjectStore } from "../store/GraphStore";
  import { CreateSetSimilariyFeatureMatrix, CreateVertexAdjacenyFeatureMatrix } from "../util/GraphUtil";
  import MatrixView from "./MatrixView.svelte";

let graphStore: Unsubscriber;

let setSimilarityMatrix: number[][];
let vertexSimilarityMatrix: number[][];

onMount(() => {
    graphStore = graphObjectStore.subscribe(($graph) => {
        setSimilarityMatrix = CreateSetSimilariyFeatureMatrix($graph);
        vertexSimilarityMatrix = CreateVertexAdjacenyFeatureMatrix($graph);
    });
})

onDestroy(() => {
    graphStore();
})

</script>

<div class="similarity-view">
    <div class="set-similarity-matrix-view">
        <MatrixView data={setSimilarityMatrix} name={"Set-Similarity"} width={500} height={500} margin={10}/>
    </div>
    <div class="bipartite-graph">
    
    </div>
    <div class="element-similarity-matrix-view">
        <MatrixView data={vertexSimilarityMatrix} name={"Vertex-Similarity"} width={500} height={500} margin={10}/>
    </div>
</div>

<style>
.similarity-view {
    display: flex;
    justify-content: space-evenly;
}
</style>