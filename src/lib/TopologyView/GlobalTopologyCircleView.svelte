<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import type { Unsubscriber } from 'svelte/store';
  import type { Graph } from '../../model/graph';
  import type { Hypergraph } from '../../model/hypergraph';
  import {
    colorStore,
    graphObjectStore,
    hoverStore,
    vertexHoverStore,
  } from '../../store/GraphStore';
  import { GenerateHypergraphFromGraph } from '../../util/GraphUtil';
  import { OnGlobalNodeClick } from '../../util/Util';
  import { renderGlobalCircle } from '../../visualizations/globalCircle';

  export let width: number;
  export let height: number;

  let graph: Graph;
  let hypergraph: Hypergraph;
  let graphStoreUnsub: Unsubscriber = () => {};

  let colors: Map<string, string> = new Map();
  let colorStoreUnsub: Unsubscriber = () => {};

  let hover: string[] = [];
  let hoverStoreUnsub: Unsubscriber = () => {};

  let svgElement: SVGSVGElement;
  let tooltipElement: HTMLDivElement;
  let cleanupRender: () => void = () => {};

  onMount(() => {
    setupSVG();

    graphStoreUnsub = graphObjectStore.subscribe(($graph) => {
      graph = $graph;

      hypergraph = GenerateHypergraphFromGraph(graph);

      if (hypergraph.vertices.length <= 0) return;

      renderView();
    });

    colorStoreUnsub = colorStore.subscribe(($colors) => {
      colors = $colors;

      renderView();
    });

    hoverStoreUnsub = hoverStore.subscribe(($hover) => {
      hover = $hover;

      renderView();
    });
  });

  onDestroy(() => {
    cleanupRender();
    graphStoreUnsub();
    colorStoreUnsub();
    hoverStoreUnsub();
  });

  function renderView() {
    if (
      !graph ||
      !hypergraph ||
      hypergraph.vertices.length <= 0 ||
      !svgElement ||
      !tooltipElement
    ) return;

    cleanupRender();
    cleanupRender = renderGlobalCircle(svgElement, tooltipElement, {
      hypergraph: structuredClone(hypergraph),
      colors,
      hover,
      width,
      height,
      onNodeClick: (vertex) => OnGlobalNodeClick(graph, vertex),
      onNodeMouseEnter: (name, isVertex = false) => {
        if (isVertex) vertexHoverStore.set([name]);
        hoverStore.set([name]);
      },
      onNodeMouseExit: (isVertex = false) => {
        if (isVertex) vertexHoverStore.set([]);
        hoverStore.set([]);
      },
    });
  }

  function setupSVG() {
    const componentWidth = document.querySelector(".global-topology-container")?.clientWidth;

    if (componentWidth !== undefined) width = componentWidth;

    if (svgElement) {
      svgElement.setAttribute("width", String(width));
      svgElement.setAttribute("height", String(height));
      svgElement.setAttribute("viewBox", `0 0 ${width} ${height}`);
    }
  }
</script>

<div class="global-topology-circle-container">
  <svg bind:this={svgElement} class="global-circle-graph"></svg>
  <div bind:this={tooltipElement} class="global-circle-graph-tooltip tooltip"></div>
</div>

<style>
  .global-circle-graph {
    max-width: 100%;
    height: auto;
    border: 1px solid var(--darkblue);
    margin-top: 5px;
  }

  .global-topology-circle-container {
    width: 100%;
  }
</style>
