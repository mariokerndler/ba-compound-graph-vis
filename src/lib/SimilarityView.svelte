<script lang="ts">

  import { onDestroy, onMount } from "svelte";
  import type { Unsubscriber } from "svelte/store";
  import type { SimilarityContainer } from '../model/similarity';
  import { graphObjectStore } from "../store/GraphStore";
  import { CreateSetSimilariyFeatureMatrix, CreateVertexAdjacenyFeatureMatrix } from "../util/GraphUtil";
  import BipartiteGraphView from "./BipartiteGraphView.svelte";
  import MatrixView from "./MatrixView.svelte";

let graphStore: Unsubscriber;

let setSimilarityMatrix: SimilarityContainer;
let vertexSimilarityMatrix: SimilarityContainer;

let setSimilarityConnectionPos: Map<string, number> = new Map<string, number>;
let vertexSimilarityConnectionPos: Map<string, number> = new Map<string, number>;

let graphWidth: number = 500;

onMount(() => {
    graphStore = graphObjectStore.subscribe(($graph) => {
        setSimilarityMatrix = CreateSetSimilariyFeatureMatrix($graph);
        vertexSimilarityMatrix = CreateVertexAdjacenyFeatureMatrix($graph);
    });
    
    const componentWidth = document.querySelector(".bipartite-graph-view")?.clientWidth;
    
    if (componentWidth !== undefined) graphWidth = componentWidth;
})

onDestroy(() => {
    graphStore();
})

function handleConnectionPositions(event: { detail: Map<string, number>; }, isSet: boolean) {
    if (isSet) setSimilarityConnectionPos = event.detail;
    else vertexSimilarityConnectionPos = event.detail;
}

</script>

<div class="similarity-view">
    <div class="set-similarity-matrix-view">
        <MatrixView data={setSimilarityMatrix} name={"Set-Similarity"} width={500} height={500} renderTooltip={true} highlightSelected={true} on:connectionPositions={(d) => handleConnectionPositions(d, true)}/>
    </div>
    <div class="bipartite-graph-view">
        <BipartiteGraphView width={graphWidth} height={500} setPositions={setSimilarityConnectionPos} vertexPositions={vertexSimilarityConnectionPos}/>
    </div>
    <div class="element-similarity-matrix-view">
        <MatrixView data={vertexSimilarityMatrix} name={"Vertex-Similarity"} width={500} height={500} on:connectionPositions={(d) => handleConnectionPositions(d, false)}/>
    </div>
</div>

<style>
.similarity-view {
    display: flex;
    justify-content: space-between;
}

.bipartite-graph-view {
    width: 100%;
}
</style>