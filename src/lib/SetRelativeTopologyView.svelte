<script lang="ts">
import { defineGraphWithDefaults, type Graph, type GraphVertex } from "../model/graph";
import * as d3 from 'd3';
import { CombineGraphs } from "../util/GraphUtil";
import { onMount } from "svelte";
import { localTopologyViewStore } from "../store/GraphStore";

let graphs: Graph[];

export let width: number;
export let height: number;

interface SetColorAssoc {
    setname: string;
    color: string;
}

onMount(() => {
    const unsub = localTopologyViewStore.subscribe(($graphs) => {
        graphs = $graphs;
        
        if (graphs !== undefined && graphs.length == 0) d3.selectAll("#graph > *").remove();
        if (graphs === undefined || graphs.length <= 0) return;
        
        const t = combineAllCurrentGraphs(graphs);
        drawGraph(t[0], t[1]);
    });
    
    return unsub;
});

function combineAllCurrentGraphs(graphs: Graph[]): [Graph, SetColorAssoc[]] {
    let combGraph: Graph = defineGraphWithDefaults();
    const setcolorAssoc: SetColorAssoc[] = [];
    
    graphs.forEach(g => {
        combGraph = CombineGraphs(combGraph, g);
        
        setcolorAssoc.push({
            setname: g.name,
            color: g.color
        });
    });
    
    return [combGraph, setcolorAssoc];
}

function getNodeColor(node: GraphVertex, setcolorAssoc: SetColorAssoc[]): string {
    const setnames = setcolorAssoc.map(x => x.setname);
    const filteredSets = node.sets.filter(set => setnames.includes(set));
    if (filteredSets.length > 1) {
        return "#000";
    } else {
        const color = setcolorAssoc.filter(x => x.setname === filteredSets[0])[0].color;
        return color;
    }
}

function drawGraph(g: Graph, setcolorAssoc: SetColorAssoc[]) {
    if (g === undefined) {
        return;
    }

    let graphCopy = structuredClone(g);
    
    const simulation = d3.forceSimulation(graphCopy.vertices)
      .force("link", d3.forceLink(graphCopy.edges).id(d => {
        const n = d as GraphVertex;
        return n.id;
      }))
      .force("charge", d3.forceManyBody().strength(-20))
      .force("x", d3.forceX().x(width / 2))
      .force("y", d3.forceY().y(height / 2))
      .on("tick", ticked);
    
    
    const svg = d3.select(".graph")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height]);
                
    // Clear svg
    d3.selectAll(".graph > *").remove();
    
    const graphContainer = svg.append("g").attr("id", "graph-container");
      
    const link = graphContainer.selectAll("line")
        .data(graphCopy.edges)
        .enter()
        .append("line")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6);
  
    const node = graphContainer.selectAll("circle")
        .data(graphCopy.vertices)
        .enter()
        .append("circle")
        .attr("r", 5)
        .style("fill", d => getNodeColor(d, setcolorAssoc));
        
    const drag = d3.drag<SVGCircleElement, any, any>()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);        

    // Add a drag behavior.
    node.call(drag);
    
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
      
    // Zoom
    const zoom = d3.zoom()
    .scaleExtent([0.5, 5])
    .translateExtent([
        [0, 0],
        [width, height]
    ])
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
             .attr("cx", d => d.x === undefined ? 0 : Math.max(5, Math.min(width - 5, d.x)) )
             .attr("cy", d => d.y === undefined ? 0 : Math.max(5, Math.min(height - 5, d.y)) );
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

$: hasGraph = graphs !== undefined && graphs.length > 0

</script>

<div>
    <h2>Set-Relative Topology View</h2>
    {#if !hasGraph}
        <h3>Empty</h3> 
    {/if}
    <svg class="graph {hasGraph ? 'border' : ''}">
    </svg>
</div>

<style>
.graph {
    max-width: 100%;
    height: auto;
    
}

.border {
    border: 1px solid #2c3e50;
}

h2, h3 {
    color: #2c3e50;
}
</style>