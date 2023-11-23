<script lang="ts">
import * as d3 from 'd3';
import { onDestroy, onMount } from "svelte";
import type { Unsubscriber } from "svelte/store";
import { defineGraphWithDefaults, type Graph, type GraphEdge, type GraphVertex } from '../../model/graph';
import { colorStore, localTopologyViewStore, vertexHoverStore } from '../../store/GraphStore';
import { CombineGraphs } from '../../util/GraphUtil';
import { InterpolateColor } from '../../util/Util';

let graphs: Graph[];
let colors: Map<string, string>;
let hoveredVertex: string;
let localTopologyViewStoreUnsub: Unsubscriber;
let colorStoreUnsub: Unsubscriber;
let vertexHoverUnsub: Unsubscriber;

let svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;
let simulation: d3.Simulation<GraphVertex, undefined>;
let nodes: d3.Selection<SVGCircleElement, GraphVertex, SVGGElement, unknown>;
let links: d3.Selection<SVGLineElement, GraphEdge, SVGGElement, unknown>;

let colorAssoc: SetColorAssoc[];

export let width: number;
export let height: number;

interface SetColorAssoc {
    setname: string;
    color: string;
}

onMount(() => {
    setupSVG();

    colorStoreUnsub = colorStore.subscribe(($colors) => {
        colors = $colors;
    });

    localTopologyViewStoreUnsub = localTopologyViewStore.subscribe(($graphs) => {
        graphs = $graphs;
        
        if (graphs !== undefined && graphs.length == 0) {
            d3.selectAll(".set-relative-graph > *").remove();
            return;
        }
        if (graphs === undefined || graphs.length <= 0) return;
        
        if (colors === undefined) return;
        
        const [g, cAssoc] = combineAllCurrentGraphs(graphs);
        colorAssoc = cAssoc;
        createSimulation(g, cAssoc);
    });
    
    vertexHoverUnsub = vertexHoverStore.subscribe(vertex => {
        hoveredVertex = vertex;
        updateGraph(colorAssoc);
    })
});

onDestroy(() => {
    localTopologyViewStoreUnsub();
    colorStoreUnsub();
})

function setupSVG() {
    const componentWidth = document.querySelector(".global-topology-container")?.clientWidth;

    if (componentWidth !== undefined) width = componentWidth;

    svg = d3.select(".set-relative-graph")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height]);
        
    // Zoom
    const zoom = d3.zoom()
    .scaleExtent([0.5, 5])
    .on("zoom", (event) => {
        const zoomState = event.transform;
        d3.select("#set-relative-graph-container")
            .attr("transform", zoomState);
    })as any;
        
    svg.call(zoom);
}

function combineAllCurrentGraphs(graphs: Graph[]): [Graph, SetColorAssoc[]] {
    let combGraph: Graph = defineGraphWithDefaults();
    const setcolorAssoc: SetColorAssoc[] = [];
    graphs.forEach(g => {
        combGraph = CombineGraphs(combGraph, g);
    
        const color = colors.get(g.name);

        setcolorAssoc.push({
            setname: g.name,
            color: color || "black"
        });
    });
    
    return [combGraph, setcolorAssoc];
}

function getNodeColor(node: GraphVertex, setcolorAssoc: SetColorAssoc[]): string {
    const setnames = setcolorAssoc.map(x => x.setname);
    const filteredSets = node.sets.filter(set => setnames.includes(set));
    if (filteredSets.length > 1) {
        if (hoveredVertex === undefined || hoveredVertex.length <= 0) return "#000";
        return (node.name === hoveredVertex) ? "#000" : InterpolateColor("#000", 0.4);
    } else {
        const color = setcolorAssoc.filter(x => x.setname === filteredSets[0])[0].color;
        if (hoveredVertex === undefined || hoveredVertex.length <= 0) return color;
        return (node.name === hoveredVertex) ? color : InterpolateColor(color, 0.4);
    }
}

function getStroke(node: GraphVertex): string {
    return (node.name === hoveredVertex) ? "#2c3e50" : "none";
}

function onMouseEnter(name: string, tooltip: d3.Selection<d3.BaseType, unknown, HTMLElement, any>) {
    tooltip.style("visibility", "visible").text(name);
    vertexHoverStore.set(name);
}

function onMouseExit(tooltip: d3.Selection<d3.BaseType, unknown, HTMLElement, any>) {
    tooltip.style("visibility", "hidden");
    vertexHoverStore.set("");
}

function createSimulation(g: Graph, setcolorAssoc: SetColorAssoc[]) {
    // Clear svg
    d3.selectAll(".set-relative-graph > *").remove();

    simulation = d3.forceSimulation(g.vertices)
      .force("link", d3.forceLink(g.edges).id(d => {
        const n = d as GraphVertex;
        return n.name;
      }))
      .force("charge", d3.forceManyBody().strength(-20))
      .force("collide", d3.forceCollide().radius(5 + 2).iterations(3))
      .force("x", d3.forceX().x(width / 2))
      .force("y", d3.forceY().y(height / 2))
      .on("tick", ticked);
    
    const graphContainer = svg.append("g").attr("id", "set-relative-graph-container");
    const tooltip = d3.select(".set-relative-tooltip");
    const drag = d3.drag<SVGCircleElement, any, any>()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);     
      
    links = graphContainer.selectAll("line")
        .data(g.edges)
        .enter()
        .append("line")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6);
  
    nodes = graphContainer.selectAll("circle")
        .data(g.vertices)
        .enter()
        .append("circle")
        .attr("r", 5)
        .style("fill", d => getNodeColor(d, setcolorAssoc))
        .on("mouseover", d => onMouseEnter(d.target.__data__.name, tooltip))
        .on("mousemove", d => tooltip.style("top", (d.clientY + window.scrollY - 30)+"px").style("left",(d.clientX)+"px"))
        .on("mouseout", () => onMouseExit(tooltip))
        .call(drag);
    
    // Add legend
    const legend = svg.append('g')
        .attr("class", "legend")
        .attr("transform", `translate(${width - 150}, 20)`);
        
    legend.selectAll('rect')
        .data(setcolorAssoc)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (d, i) => i * 20)
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', (d, i) => d.color);
        
    legend.selectAll('text')
      .data(setcolorAssoc)
      .enter()
      .append('text')
      .attr('x', 20)
      .attr('y', (d, i) => i * 20 + 10)
      .text((d, i) => d.setname);
}

function updateGraph(setcolorAssoc: SetColorAssoc[]) {
    if (nodes !== undefined) {
        nodes
            .style("fill", d => getNodeColor(d, setcolorAssoc));
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
    
    if (nodes !== undefined) {
        nodes
             .attr("cx", d => d.x === undefined ? 0 : d.x)
             .attr("cy", d => d.y === undefined ? 0 : d.y);
    }
}
    
function dragstarted(event: any) {
    if (!event.active && simulation !== undefined) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
}

function dragged(event: any) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
}

function dragended(event: any) {
    if (!event.active && simulation !== undefined) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
}

</script>

<div class="set-relative-topology-container">
    <h2>Set-Relative Topology View</h2>
    <svg class="set-relative-graph"></svg>
    <div class="set-relative-tooltip tooltip"></div>
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