<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import type { Unsubscriber } from 'svelte/store';
  import type { Graph } from '../../model/graph';
  import { colorStore, graphObjectStore, vertexHoverStore } from '../../store/GraphStore';
  import { createBipartiteGraphRenderer, type BipartiteGraphRenderer } from '../../visualizations/bipartiteGraph';


export let width: number;
export let height: number;
export let setPositions: Map<string, number>;
export let vertexPositions: Map<string, number>;

let graph: Graph;
let graphUnsub: Unsubscriber = () => {};

let colors: Map<string, string>;
let colorUnsub: Unsubscriber = () => {};

let hoveredVertices: string[];
let vertexHoverUnsub: Unsubscriber = () => {};

let svgElement: SVGSVGElement;
let renderer: BipartiteGraphRenderer;

onMount(() => {
    renderer = createBipartiteGraphRenderer(svgElement);
    renderGraph();

    graphUnsub = graphObjectStore.subscribe($graph => {
        graph = $graph;
        renderGraph();
    });

    colorUnsub = colorStore.subscribe($colors => {
        colors = $colors;
        renderGraph();
    });

    vertexHoverUnsub = vertexHoverStore.subscribe($vertices => {
        hoveredVertices = $vertices;
        renderGraph();
    });
})

onDestroy(() => {
    renderer?.destroy();
    graphUnsub();
    colorUnsub();
    vertexHoverUnsub();
})

function renderGraph() {
    if (!renderer || !graph || !colors) return;

    renderer.render({
        graph,
        colors,
        hoveredVertices,
        setPositions,
        vertexPositions,
        width,
        height,
    });
}

$: setPositions, vertexPositions, width, height, renderGraph();
</script>

<div>
    <h2>Connection Graph</h2>
    <svg class="bipartite-graph" bind:this={svgElement}></svg>
</div>

<style>
    svg {
        margin-top: 5px;
        border-top: 1px solid var(--darkblue);
        border-bottom: 1px solid var(--darkblue);
        width: 100%;
        height: 500px;
        display: block;
    }
</style>
