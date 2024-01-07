<script lang="ts">
import * as d3 from 'd3';
import { onMount } from "svelte";
import type { Unsubscriber } from 'svelte/store';
import type { EgoNetNode } from '../../model/egonet';
import type { Graph, GraphVertex } from '../../model/graph';
import { egonetSelectedVertexStore, graphObjectStore, vertexHoverStore } from '../../store/GraphStore';
import { CreateEgoNetworkFromGraphWithoutDistance } from '../../util/EgoNetworkUtil';
import { maxEgoNetDepth } from '../../util/Globals';

export let width: number;
export let height: number;

let svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;

let depth = 2;

let graph: Graph;
let graphStoreUnsub: Unsubscriber;

let selectedVertex: GraphVertex;
let selectedVertexUnsub: Unsubscriber;

function setupSVG() {
    const componentWidth = document.querySelector(".egonetview-container")?.clientWidth;

    if (componentWidth !== undefined) width = componentWidth;
    
    svg = d3.select(".egonet-svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height]);
}

function drawTree(selectedVertex: GraphVertex) {
    if (!svg) setupSVG();
    
    if (!graph) return;
    
    if (!selectedVertex) return;
    
    d3.selectAll(".egonet-svg > *").remove();
    
    const data = CreateEgoNetworkFromGraphWithoutDistance(graph, selectedVertex, depth);
    
    const root = d3.hierarchy(data);
    const dx = 20;
    const dy = width / (root.height + 1);

    // Create a tree layout.
    const tree = d3.tree<EgoNetNode>().nodeSize([dx, dy]);

    // Sort the tree and apply the layout.
    root.sort((a, b) => d3.ascending(a.data.name, b.data.name));
    tree(root);
    
    // Compute the extent of the tree. Note that x and y are swapped here
    // because in the tree layout, x is the breadth, but when displayed, the
    // tree extends right rather than down.
    let x0 = Infinity;
    let x1 = -x0;
    tree(root).each((d: d3.HierarchyPointNode<EgoNetNode>) => {
        if (d.x > x1) x1 = d.x;
        if (d.x < x0) x0 = d.x;
    });
    
    // Compute the adjusted height of the tree.
    const height = x1 - x0 + dx * 2;
    
    svg = d3.select(".egonet-svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-dy / 3, x0 - dx, width, height])
      .attr("style", "max-width: 100%; height: auto; font: 15px sans-serif;");
      
    const link = svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5)
        .selectAll()
        .data(root.links())
        .join("path")
        .attr("d", (d) => {
            const linkGenerator = d3
                .linkHorizontal<d3.HierarchyPointLink<EgoNetNode>, [number, number]>()
                .source((d) => [d.source.y, d.source.x])
                .target((d) => [d.target.y, d.target.x]);
            return linkGenerator(d as d3.HierarchyPointLink<EgoNetNode>);
        });
  
    const node = svg.append("g")
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 3)
        .selectAll()
        .data(tree(root).descendants())
        .join("g")
        .attr("transform", d => `translate(${d.y},${d.x})`)
        .on("mouseover", (_, i) => onMouseOver(i.data.name))
        .on("mouseout", () => onMouseOut());

    node.append("circle")
        .attr("fill", d => d.children ? "#555" : "#999")
        .attr("r", 5);

    node.append("text")
        .attr("dy", "0.31em")
        .attr("x", d => d.children ? -10 : 10)
        .attr("text-anchor", d => d.children ? "end" : "start")
        .text(d => d.data.name)
        .clone(true).lower()
        .attr("stroke", "white");
}

function onMouseOver(vertexName: string) {
    vertexHoverStore.set([vertexName]);
}

function onMouseOut() {
    vertexHoverStore.set([]);
}

function onDepthChange() {
    drawTree(selectedVertex);
}

onMount(() => {
    setupSVG();
    
    graphStoreUnsub = graphObjectStore.subscribe($graph => {
        graph = $graph;
    });
    
    selectedVertexUnsub = egonetSelectedVertexStore.subscribe($vertex => {
        selectedVertex = $vertex;
        
        drawTree(selectedVertex);
    });
})

</script>

<div class="egonetview-container">
    <div class="header-container">
        <h2>Node Relative View</h2>
        <div class="egonetview-button-container">
            <div class="egonetview-depth">
                <b>Depth:</b> {depth}
            </div>
            <input type="range" min="1" max={maxEgoNetDepth} bind:value={depth} on:change={onDepthChange}>
        </div>
    </div>
    <svg class="egonet-svg"></svg>
</div>

<style>
svg {
    border: 1px solid var(--darkblue);
    margin-top: 5px;
}

.egonetview-button-container {
    justify-content: center;
    align-items: center;
    margin-right: 10px;
}

</style>