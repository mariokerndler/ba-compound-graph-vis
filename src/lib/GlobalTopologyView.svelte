<script lang="ts">
import { onMount } from "svelte";
import type { Graph } from "../model/graph";
import { graphObjectStore } from "../store/GraphStore";

let graph: Graph;

onMount(() => {
    const unsub = graphObjectStore.subscribe(($graph) => {
        graph = $graph;
        console.log(graph);
    });

    return unsub;
});

</script>

<div>
    <h2>Global Topology View</h2>

    <svg class="graph"></svg>
</div>

<style>
.graph {
    max-width: 100%;
    height: auto;
}

h2 {
    color: #2c3e50;
}
</style>