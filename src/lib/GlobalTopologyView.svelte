<script lang="ts">
import * as d3 from 'd3';
import { onDestroy, onMount } from "svelte";
import type { Unsubscriber } from "svelte/store";
import type { Graph } from "../model/graph";
import { HypernodeType, type Hyperedge, type Hypergraph, type Hypervertex } from "../model/hypergraph.";
import { colorStore, graphObjectStore, hoverStore } from "../store/GraphStore";
import { GenerateHypergraphFromGraph } from "../util/GraphUtil";
import { Interpolate, MapValueToColor } from '../util/Util';

export let width: number;
export let height: number;

let graph: Graph;
let hypergraph: Hypergraph;
let graphStoreUnsub: Unsubscriber;

let colors: Map<string, string>;
let colorStoreUnsub: Unsubscriber;

let hover: string[] = [];
let hoverStoreUnsub: Unsubscriber;

let svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;

let simulation: d3.Simulation<Hypervertex, undefined>;

let links: d3.Selection<SVGLineElement, Hyperedge, SVGGElement, unknown>;
let nodes: d3.Selection<SVGCircleElement, Hypervertex, SVGGElement, unknown>;

onMount(() => {
    setupSVG();

    graphStoreUnsub = graphObjectStore.subscribe(($graph) => {
        graph = $graph;
    
        hypergraph = GenerateHypergraphFromGraph(graph);

        if (hypergraph.vertices.length <= 0) return;

        let graphCopy = structuredClone(hypergraph);
        createSimulation(graphCopy);

    });
    
    colorStoreUnsub = colorStore.subscribe(($colors) => {
        colors = $colors;
        
        if (colors.size > 0) {
            updateGraph(hypergraph);
        }
    });
    
    hoverStoreUnsub = hoverStore.subscribe(($hover) => {
        hover = $hover;
        
        updateGraph(hypergraph);
    });
});

onDestroy(() => {
    graphStoreUnsub();
    colorStoreUnsub();
    hoverStoreUnsub();
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
    switch (vertex.type) {
        case HypernodeType.SET:
            const color = colors.get(vertex.name);
            
            if (color !== undefined) {
                return color;
            } else {
                return "grey";
            }
        case HypernodeType.VERTEX:
            const graphSize = hypergraph.vertices.filter((vert) => vert.type === HypernodeType.SET).length;
            
            const value = Interpolate(vertex.size, graphSize, 1);

            return MapValueToColor(value);
    }
}

function getStroke(vertex: Hypervertex): string {
    return hover.includes(vertex.name) ? "#2c3e50" : "none";
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

function onMouseEnter(name: string, tooltip: d3.Selection<d3.BaseType, unknown, HTMLElement, any>) {
    tooltip.style("visibility", "visible").text(name)
    
    hoverStore.set([name]);
}

function onMouseExit(tooltip: d3.Selection<d3.BaseType, unknown, HTMLElement, any>) {
    tooltip.style("visibility", "hidden")

    hoverStore.set([]);
}

function createSimulation(g: Hypergraph) {
    d3.selectAll(".global-graph > *").remove();

    simulation = d3.forceSimulation(g.vertices)
      .force("link", d3.forceLink(g.edges).id(d => {
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
      
    const graphContainer = svg.append("g").attr("id", "graph-container");
      
    links = graphContainer.selectAll("line")
          .data(g.edges)
          .enter()
          .append("line")
          .attr("stroke", "#999")
          .attr("stroke-opacity", 0.6)
          .attr("stroke-width", (d) => d.thickness);
    
    // Tooltip
    const tooltip = d3.select(".global-graph-tooltip");
    
    nodes = graphContainer.selectAll("circle")
        .data(g.vertices)
        .enter()
        .append("circle")
        .attr("r", d => getSize(d))
        .style("fill", d => getColor(d))
        .style("stroke", d => getStroke(d))
        .style("stroke-width", 2)
        .on("mouseover", d => onMouseEnter(d.target.__data__.name, tooltip))
        .on("mousemove", d => tooltip.style("top", (d.clientY + window.scrollY - 30)+"px").style("left",(d.clientX)+"px"))
        .on("mouseout", () => onMouseExit(tooltip));
          
    const drag = d3.drag<SVGCircleElement, any, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);        
  
    // Add a drag behavior.
    nodes.call(drag);
      
    // Zoom
    const zoom = d3.zoom()
        .scaleExtent([0.5, 20])
        .on("zoom", (event) => {
            const zoomState = event.transform;
            d3.select("#graph-container")
                .attr("transform", zoomState);
    })as any;
          
    svg.call(zoom);
}

function updateSimulation(g: Hypergraph) {
    simulation.nodes(g.vertices);
    simulation.force("link", d3.forceLink(g.edges).id(d => {
        const n = d as Hypervertex;
        return n.name;
    }));
    simulation.alpha(1).restart();
}

function updateGraph(g: Hypergraph) {
    nodes
        .attr("r", d => getSize(d))
        .style("fill", d => getColor(d))
        .style("stroke", d => getStroke(d));
}

function ticked() {
    if (links !== undefined) {
        links
            .attr("x1", d => d.source.x === undefined ? 0 : d.source.x )
            .attr("y1", d => d.source.y === undefined ? 0 : d.source.y )
            .attr("x2", d => d.target.x === undefined ? 0 : d.target.x )
            .attr("y2", d => d.target.y === undefined ? 0 : d.target.y );
    }
    
    if (nodes !== undefined) {
        nodes
         .attr("cx", d => d.x === undefined ? 0 : d.x)
         .attr("cy", d => d.y === undefined ? 0 : d.y);
    }   
}

function dragstarted(event: any) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
}

function dragged(event: any) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
}

function dragended(event: any) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
}

</script>

<div class="global-topology-container">
    <h2>Global Topology View</h2>
    <svg class="global-graph"></svg>
    <div class="global-graph-tooltip tooltip"></div>
</div>

<style>
.global-graph {
    max-width: 100%;
    height: auto;
    border: 1px solid var(--darkblue);
    margin-top: 5px;
}

.global-topology-container {
    width: 100%;
}
</style>