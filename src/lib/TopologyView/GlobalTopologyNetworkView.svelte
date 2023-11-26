<script lang="ts">
import * as d3 from 'd3';
import { onDestroy, onMount } from "svelte";
import type { Unsubscriber } from "svelte/store";
import type { Graph } from '../../model/graph';
import { HypernodeType, type Hyperedge, type Hypergraph, type Hypervertex } from '../../model/hypergraph.';
import { colorStore, graphObjectStore, hoverStore } from '../../store/GraphStore';
import { GenerateHypergraphFromGraph } from '../../util/GraphUtil';
import { AddSetToLocalTopologyViewStore, LocalTopologyViewStoreHasSet, RemoveSetFromLocalTopologyViewStore } from '../../util/StoreUtil';
import { GetColor, GetSize } from '../../util/Util';

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
let vertNodes: d3.Selection<SVGRectElement, Hypervertex, SVGGElement, unknown> | undefined;
let setNodes: d3.Selection<SVGCircleElement, Hypervertex, SVGGElement, unknown> | undefined;

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

    svg = d3.select(".global-network-graph")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height]);
}

function getStroke(vertex: Hypervertex): string {
    return hover.includes(vertex.name) ? "#2c3e50" : "none";
}

function onMouseEnter(name: string, tooltip: d3.Selection<d3.BaseType, unknown, HTMLElement, any>) {
    tooltip.style("visibility", "visible").text(name)
    
    hoverStore.set([name]);
}

function onMouseExit(tooltip: d3.Selection<d3.BaseType, unknown, HTMLElement, any>) {
    tooltip.style("visibility", "hidden")

    hoverStore.set([]);
}

function onClick(vertex: Hypervertex) {
    const set: Graph = graph.sets.filter(s => s.name === vertex.name)[0];
    
    if (LocalTopologyViewStoreHasSet(set)) {
        RemoveSetFromLocalTopologyViewStore(set);
    } else {
        AddSetToLocalTopologyViewStore(set);
    }
}

function createSimulation(g: Hypergraph) {
    d3.selectAll(".global-network-graph > *").remove();

    simulation = d3.forceSimulation(g.vertices)
      .force("link", d3.forceLink(g.edges).id(d => {
        const n = d as Hypervertex;
        return n.name;
      }))
      .force("x", d3.forceX().x(width / 2))
      .force("y", d3.forceY().y(height / 2))
      .force("collide", d3.forceCollide().radius(d => {
        const n = d as Hypervertex;
        return GetSize(graph, n) + 5
      }).iterations(3))
      .force("charge", d3.forceManyBody().strength(-30))
      .on("tick", ticked);
      
    const graphContainer = svg.append("g").attr("id", "graph-container");
    const tooltip = d3.select(".global-network-graph-tooltip");
    const drag = d3.drag<any, any, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);      
        
    links = graphContainer.selectAll("line")
          .data(g.edges)
          .enter()
          .append("line")
          .attr("stroke", "#999")
          .attr("stroke-opacity", 0.6)
          .attr("stroke-width", (d) => d.thickness);
    
    setNodes = graphContainer.selectAll("circle")
        .data(g.vertices)
        .enter()
        .filter(d => d.type == HypernodeType.SET)
        .append("circle")
        .attr("r", d => GetSize(graph, d))
        .style("fill", d => GetColor(g, colors, d))
        .style("stroke", d => getStroke(d))
        .style("stroke-width", 2)
        .on("mouseover", d => onMouseEnter(d.target.__data__.name, tooltip))
        .on("mousemove", d => tooltip.style("top", (d.clientY + window.scrollY - 30)+"px").style("left",(d.clientX)+"px"))
        .on("mouseout", () => onMouseExit(tooltip))
        .on("click", (_, i) => onClick(i))
        .call(drag)
        
    vertNodes = graphContainer.selectAll("rect")
        .data(g.vertices)
        .enter()
        .filter(d => d.type == HypernodeType.VERTEX)
        .append("rect")
        .attr("width", d => GetSize(graph, d))
        .attr("height", d => GetSize(graph, d))
        .style("fill", d => GetColor(g, colors, d))
        .style("stroke", d => getStroke(d))
        .style("stroke-width", 2)
        .on("mouseover", d => onMouseEnter(d.target.__data__.name, tooltip))
        .on("mousemove", d => tooltip.style("top", (d.clientY + window.scrollY - 30)+"px").style("left",(d.clientX)+"px"))
        .on("mouseout", () => onMouseExit(tooltip))
        .call(drag);
          
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

function updateGraph(g: Hypergraph) {
    if (setNodes !== undefined) {
        setNodes
            .attr("r", d => GetSize(graph, d))
            .style("fill", d => GetColor(g, colors, d))
            .style("stroke", d => getStroke(d));
    }
    
    if (vertNodes !== undefined) {
        vertNodes
            .attr("width", d => GetSize(graph, d))
            .attr("height", d => GetSize(graph, d))
            .style("fill", d => GetColor(g, colors, d))
            .style("stroke", d => getStroke(d));
    }
}

function ticked() {
    if (links !== undefined) {
        links
            .attr("x1", d => d.source.x === undefined ? 0 : d.source.x )
            .attr("y1", d => d.source.y === undefined ? 0 : d.source.y )
            .attr("x2", d => d.target.x === undefined ? 0 : d.target.x )
            .attr("y2", d => d.target.y === undefined ? 0 : d.target.y );
    }
    
    if (setNodes !== undefined) {
        setNodes
         .attr("cx", d => d.x === undefined ? 0 : d.x)
         .attr("cy", d => d.y === undefined ? 0 : d.y);
    }   
    
    if (vertNodes !== undefined) {
        vertNodes
         .attr("x", d => d.x === undefined ? 0 : d.x - d.size / 2)
         .attr("y", d => d.y === undefined ? 0 : d.y - d.size / 2);
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

<div class="global-topology-network-container">
    <svg class="global-network-graph"></svg>
    <div class="global-network-graph-tooltip tooltip"></div>
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