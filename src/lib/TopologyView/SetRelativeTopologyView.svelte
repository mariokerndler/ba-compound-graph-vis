<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { Unsubscriber } from "svelte/store";
  import {
    defineGraphWithDefaults,
    type Graph,
    type GraphEdge,
  } from "../../model/graph";
  import {
    colorStore,
    egonetSelectedVertexStore,
    localTopologyViewStore,
    vertexHoverStore,
  } from "../../store/GraphStore";
  import { CombineGraphs } from "../../util/GraphUtil";
  import {
    renderSetRelativeTopology,
    type SetColorAssoc,
    type SetRelativeTopologyRenderer,
  } from "../../visualizations/setRelativeTopology";

  export let width: number;
  export let height: number;

  let graphs: Graph[] = [];
  let colors: Map<string, string> = new Map();
  let hoveredVertices: string[] = [];

  let localTopologyViewStoreUnsub: Unsubscriber = () => {};
  let colorStoreUnsub: Unsubscriber = () => {};
  let vertexHoverUnsub: Unsubscriber = () => {};

  let svgElement: SVGSVGElement;
  let tooltipElement: HTMLDivElement;
  let renderer: SetRelativeTopologyRenderer | undefined;

  onMount(() => {
    setupSVG();

    colorStoreUnsub = colorStore.subscribe(($colors) => {
      colors = $colors;
      renderView();
    });

    localTopologyViewStoreUnsub = localTopologyViewStore.subscribe(($graphs) => {
      graphs = $graphs;
      renderView();
    });

    vertexHoverUnsub = vertexHoverStore.subscribe((vertex) => {
      hoveredVertices = vertex;
      renderer?.updateStyles(hoveredVertices);
    });
  });

  onDestroy(() => {
    renderer?.destroy();
    localTopologyViewStoreUnsub();
    colorStoreUnsub();
    vertexHoverUnsub();
  });

  function setupSVG() {
    const componentWidth = document.querySelector(
      ".set-relative-topology-container",
    )?.clientWidth;

    if (componentWidth !== undefined) width = componentWidth;

    if (svgElement) {
      svgElement.setAttribute("width", String(width));
      svgElement.setAttribute("height", String(height));
      svgElement.setAttribute("viewBox", `0 0 ${width} ${height}`);
    }
  }

  function renderView() {
    if (!svgElement || !tooltipElement) return;

    if (graphs.length <= 0) {
      renderer?.destroy();
      renderer = undefined;
      return;
    }

    const [graph, colorAssoc] = combineAllCurrentGraphs(graphs);

    renderer?.destroy();
    renderer = renderSetRelativeTopology(svgElement, tooltipElement, {
      graph,
      colors: colorAssoc,
      hoveredVertices,
      width,
      height,
      onNodeClick: (vertex) => egonetSelectedVertexStore.set(vertex),
      onNodeMouseEnter: (name) => vertexHoverStore.set([name]),
      onNodeMouseExit: () => vertexHoverStore.set([]),
    });
  }

  function combineAllCurrentGraphs(graphs: Graph[]): [Graph, SetColorAssoc[]] {
    let combGraph: Graph = defineGraphWithDefaults();
    const setcolorAssoc: SetColorAssoc[] = [];

    graphs.forEach((g) => {
      combGraph = CombineGraphs(combGraph, g);

      setcolorAssoc.push({
        setname: g.name,
        color: colors.get(g.name) || "black",
      });
    });

    const edges = combGraph.edges.filter((edge) => includeEdge(graphs, edge));

    return [
      {
        name: combGraph.name,
        edges,
        sets: combGraph.sets,
        vertices: combGraph.vertices,
      },
      setcolorAssoc,
    ];
  }

  function includeEdge(sets: Graph[], edge: GraphEdge): boolean {
    const currentSets = sets.map((s) => s.name);
    const sourceInclude = edge.source.sets.some((s) => currentSets.includes(s));
    const targetInclude = edge.target.sets.some((s) => currentSets.includes(s));

    return sourceInclude && targetInclude;
  }
</script>

<div class="set-relative-topology-container">
  <h2>Set-Relative Topology View</h2>
  <svg bind:this={svgElement} class="set-relative-graph"></svg>
  <div bind:this={tooltipElement} class="set-relative-tooltip tooltip"></div>
</div>

<style>
  .set-relative-graph {
    max-width: 100%;
    height: auto;
    border: 1px solid var(--darkblue);
    margin-top: 5px;
  }

  .set-relative-topology-container {
    width: 100%;
  }
</style>
