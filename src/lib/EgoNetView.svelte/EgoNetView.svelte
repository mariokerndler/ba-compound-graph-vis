<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { Unsubscriber } from "svelte/store";
  import type { Graph, GraphVertex } from "../../model/graph";
  import {
    egonetSelectedVertexStore,
    graphObjectStore,
    vertexHoverStore,
  } from "../../store/GraphStore";
  import {
    CreateEgoNetworkFromGraph,
    SortNodesByTotalDistance,
  } from "../../util/EgoNetworkUtil";
  import { maxEgoNetDepth } from "../../util/Globals";
  import { renderEgoNetwork } from "../../visualizations/egoNetwork";

  export let width: number;
  export let height: number;

  let depth = 2;
  let graph: Graph;
  let graphStoreUnsub: Unsubscriber = () => {};
  let selectedVertex: GraphVertex;
  let selectedVertexUnsub: Unsubscriber = () => {};
  let enableDistance: boolean = true;

  const nodeSize = 25;

  let svgElement: SVGSVGElement;
  let tooltipElement: HTMLDivElement;
  let cleanupRender: () => void = () => {};

  onMount(() => {
    setupSVG();

    graphStoreUnsub = graphObjectStore.subscribe(($graph) => {
      graph = $graph;
    });

    selectedVertexUnsub = egonetSelectedVertexStore.subscribe(($vertex) => {
      selectedVertex = $vertex;
      drawTree();
    });
  });

  onDestroy(() => {
    cleanupRender();
    graphStoreUnsub();
    selectedVertexUnsub();
  });

  function setupSVG() {
    const componentWidth =
      document.querySelector(".egonetview-container")?.clientWidth;

    if (componentWidth !== undefined) width = componentWidth;

    if (svgElement) {
      svgElement.setAttribute("width", String(width));
      svgElement.setAttribute("height", String(height));
      svgElement.setAttribute("viewBox", `0 0 ${width} ${height}`);
    }
  }

  function drawTree() {
    if (!graph || !selectedVertex || !svgElement || !tooltipElement) return;

    const data = CreateEgoNetworkFromGraph(graph, selectedVertex, depth);
    SortNodesByTotalDistance(data);

    cleanupRender();
    cleanupRender = renderEgoNetwork(svgElement, tooltipElement, {
      data,
      depth,
      enableDistance,
      width,
      nodeSize,
      onNodeMouseEnter: (vertexName) => vertexHoverStore.set([vertexName]),
      onNodeMouseExit: () => vertexHoverStore.set([]),
    });
  }
</script>

<div class="egonetview-container">
  <div class="header-container">
    <h2>Node Relative View</h2>

    <div class="egonet-controlls">
      <div class="egotnet-switch-container" title="Enable distance">
        <label class="switch">
          <input type="checkbox" bind:checked={enableDistance} on:change={drawTree}>
          <span class="slider round"></span>
        </label>
      </div>

      <div class="egonetview-button-container">
        <div class="egonetview-depth">
          <b>Depth:</b> {depth}
        </div>
        <input type="range" min="1" max={maxEgoNetDepth} bind:value={depth} on:change={drawTree}>
      </div>
    </div>
  </div>
  <svg bind:this={svgElement} class="egonet-svg"></svg>
  <div bind:this={tooltipElement} class="node-relative-tooltip tooltip"></div>
</div>

<style>
  svg {
    border: 1px solid var(--darkblue);
    margin-top: 5px;
  }

  .egonetview-button-container {
    align-items: center;
    margin-right: 10px;
    gap: 5px;
  }

  .egonet-controlls {
    display: flex;
    justify-items: center;
    gap: 20px;
  }

  .egotnet-switch-container {
    display: flex;
    align-items: center;
  }
</style>
