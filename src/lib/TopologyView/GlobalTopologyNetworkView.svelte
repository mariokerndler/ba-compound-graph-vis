<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { Unsubscriber } from "svelte/store";
  import type { Graph } from "../../model/graph";
  import type { Hypergraph } from "../../model/hypergraph";
  import {
    colorStore,
    graphObjectStore,
    hoverStore,
  } from "../../store/GraphStore";
  import { GenerateHypergraphFromGraph } from "../../util/GraphUtil";
  import { OnGlobalNodeClick } from "../../util/Util";
  import {
    renderGlobalNetwork,
    type GlobalNetworkRenderer,
  } from "../../visualizations/globalNetwork";

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
  let renderer: GlobalNetworkRenderer | undefined;

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
      updateStyles();
    });

    hoverStoreUnsub = hoverStore.subscribe(($hover) => {
      hover = $hover;
      updateStyles();
    });
  });

  onDestroy(() => {
    renderer?.destroy();
    graphStoreUnsub();
    colorStoreUnsub();
    hoverStoreUnsub();
  });

  function setupSVG() {
    const componentWidth = document.querySelector(
      ".global-topology-container",
    )?.clientWidth;

    if (componentWidth !== undefined) width = componentWidth;
  }

  function renderView() {
    if (
      !graph ||
      !hypergraph ||
      hypergraph.vertices.length <= 0 ||
      !svgElement ||
      !tooltipElement
    )
      return;

    renderer?.destroy();
    renderer = renderGlobalNetwork(svgElement, tooltipElement, {
      hypergraph: structuredClone(hypergraph),
      colors,
      hover,
      width,
      height,
      onNodeClick: (vertex) => OnGlobalNodeClick(graph, vertex),
      onNodeMouseEnter: (name) => {
        tooltipElement.style.visibility = "visible";
        tooltipElement.textContent = name;
        hoverStore.set([name]);
      },
      onNodeMouseExit: () => {
        tooltipElement.style.visibility = "hidden";
        hoverStore.set([]);
      },
    });
  }

  function updateStyles() {
    renderer?.updateStyles(colors, hover);
  }
</script>

<div class="global-topology-network-container">
  <svg bind:this={svgElement} class="global-network-graph"></svg>
  <div bind:this={tooltipElement} class="global-network-graph-tooltip tooltip"></div>
</div>

<style>
  .global-network-graph {
    max-width: 100%;
    height: auto;
    border: 1px solid var(--darkblue);
    margin-top: 5px;
  }

  .global-topology-network-container {
    width: 100%;
  }
</style>
