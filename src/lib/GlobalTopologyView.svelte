<script lang="ts">
import * as d3 from 'd3';
import { onDestroy, onMount } from "svelte";
import type { Unsubscriber } from "svelte/store";
import type { Graph } from "../model/graph";
import { HypernodeType, type Hypergraph, type Hypervertex } from "../model/hypergraph.";
import { colorStore, graphObjectStore } from "../store/GraphStore";
import { GenerateHypergraphFromGraph } from "../util/GraphUtil";

export let width: number;
export let height: number;

let graph: Graph;
let colors: Map<string, string>;
let hypergraph: Hypergraph;

let graphStoreUnsub: Unsubscriber;
let colorStoreUnsub: Unsubscriber;

let svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;

onMount(() => {
    setupSVG();

    graphStoreUnsub = graphObjectStore.subscribe(($graph) => {
        graph = $graph;
    
        hypergraph = GenerateHypergraphFromGraph(graph);

        drawGraph(hypergraph);
    });
    
    colorStoreUnsub = colorStore.subscribe(($colors) => {
        colors = $colors;
        
        drawGraph(hypergraph);
    });
});

onDestroy(() => {
    graphStoreUnsub();
})

function setupSVG() {
    const componentWidth = document.querySelector(".global-topology-container")?.clientWidth;

    if (componentWidth !== undefined) width = componentWidth;

    svg = d3.select(".global-graph")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height]);
}

function getColor(vertex: Hypervertex): string {
    const color = colors.get(vertex.name);
    
    if (color !== undefined) {
        return color;
    } else {
        return "grey";
    }
}

function getSize(vertex: Hypervertex): number {
    let size: number = 4;

    if (vertex.type == HypernodeType.SET) {
        size = vertex.size / 2;
    } 
    
    if (size < 4) size = 4;
    
    // Scale according to vertex amount
    if (graph.vertices.length > 100) {
        if (size > 30) size = 30;
    } else {
        if (size > 50) size = 50;
    }
    
    return size;
}

function drawGraph(g: Hypergraph) {
    let graphCopy = structuredClone(g);
    
    const simulation = d3.forceSimulation(graphCopy.vertices)
      .force("link", d3.forceLink(graphCopy.edges).id(d => {
        const n = d as Hypervertex;
        return n.name;
      }))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(d => {
        const n = d as Hypervertex;
        return getSize(n) + 5
      }).iterations(3))
      .force("charge", d3.forceManyBody().strength(-30))
      .on("tick", ticked);
                
    // Clear svg
    d3.selectAll(".global-graph > *").remove();
    
    const graphContainer = svg.append("g").attr("id", "graph-container");
      
    const link = graphContainer.selectAll("line")
        .data(graphCopy.edges)
        .enter()
        .append("line")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", 2);
  
    // Tooltip
    const tooltip = d3.select(".global-graph-tooltip");
  
    const node = graphContainer.selectAll("circle")
        .data(graphCopy.vertices)
        .enter()
        .append("circle")
        .attr("r", d => getSize(d))
        .style("fill", d => getColor(d))
        .on("mouseover", d => tooltip.style("visibility", "visible").text(d.target.__data__.name))
        .on("mousemove", d => tooltip.style("top", (d.clientY - 30)+"px").style("left",(d.clientX)+"px"))
        .on("mouseout", () => tooltip.style("visibility", "hidden"));
        
    const drag = d3.drag<SVGCircleElement, any, any>()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);        

    // Add a drag behavior.
    node.call(drag);
    
    // Zoom
    const zoom = d3.zoom()
    .scaleExtent([0.5, 20])
    .on("zoom", (event) => {
        const zoomState = event.transform;
        d3.select("#graph-container")
            .attr("transform", zoomState);
    })as any;
        
    svg.call(zoom);
        
    function ticked() {
        link
            .attr("x1", d => d.source.x === undefined ? 0 : d.source.x )
            .attr("y1", d => d.source.y === undefined ? 0 : d.source.y )
            .attr("x2", d => d.target.x === undefined ? 0 : d.target.x )
            .attr("y2", d => d.target.y === undefined ? 0 : d.target.y );
    
        node
             .attr("cx", d => d.x === undefined ? 0 : d.x)
             .attr("cy", d => d.y === undefined ? 0 : d.y);
    }
    
    // Reheat the simulation when drag starts, and fix the subject position.
    function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }
    
    // Update the subject (dragged node) position during drag.
    function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }
    
    // Restore the target alpha so the simulation cools after dragging ends.
    // Unfix the subject position now that it’s no longer being dragged.
    function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }
}

</script>

<div class="global-topology-container">
    <h2>Global Topology View</h2>
    <svg class="global-graph"></svg>
    <div class="global-graph-tooltip"></div>
</div>

<style>
.global-graph {
    max-width: 100%;
    height: auto;
    border: 1px solid #2c3e50;
    margin-top: 5px;
}

.global-graph-tooltip {
    position: absolute;
    visibility: hidden;
    padding: 3px;
    border: 1px solid #2c3e50;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.7);
}

.global-topology-container {
    width: 100%;
}

h2 {
    color: #2c3e50;
}
</style>