<script lang="ts">
import { onMount } from "svelte";
import { defineGraphWithDefaults, type Graph } from "../model/graph/graph";
import * as d3 from 'd3';
import type { GraphVertex } from "../model/graph/vertex";
import { CombineGraphs, RemoveDisconnectedVertices } from "../util/GraphUtil";

export let graphs: Graph[] = [defineGraphWithDefaults()];
export let showDisconnected: boolean = true;
export let width: number;
export let height: number;

$: {
    const t = combineAllCurrentGraphs(graphs);
    drawGraph(t[0], t[1], showDisconnected);
}


const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

function combineAllCurrentGraphs(graphs: Graph[]): [Graph, string[]] {
    let combGraph: Graph = defineGraphWithDefaults();
    const setNames: string[] = [];
    
    graphs.forEach(g => {
        combGraph = CombineGraphs(combGraph, g);
        
        if (!setNames.includes(g.name)) {
            setNames.push(g.name);
        }
    });
    
    return [combGraph, setNames];
}

function drawGraph(g: Graph, setNames: string[], showDisconnected: boolean) {
    if (g === undefined) {
        return;
    }
    
    let graphCopy = structuredClone(g);
    
    if (!showDisconnected) {
        graphCopy = RemoveDisconnectedVertices(graphCopy);
    }

    const simulation = d3.forceSimulation(graphCopy.vertices)
      .force("link", d3.forceLink(graphCopy.edges).id(d => {
        const n = d as GraphVertex;
        return n.id;
      }))
      .force("charge", d3.forceManyBody().strength(-20))
      .force("x", d3.forceX().x(width / 2))
      .force("y", d3.forceY().y(height / 2))
      .on("tick", ticked);
      
    const svg = d3.select("#graph")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height]);
        
    // Clear svg
    d3.selectAll("line").remove();
    d3.selectAll("circle").remove();
      
    const link = svg.selectAll("line")
        .data(graphCopy.edges)
        .enter()
        .append("line")
        .attr("stroke", d => colorScale(d.set));
  
    const node = svg.selectAll("circle")
        .data(graphCopy.vertices)
        .enter()
        .append("circle")
        .attr("r", 5)
        .style("fill", "#000");
        
    const drag = d3.drag<SVGCircleElement, any, any>()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);        

    // Add a drag behavior.
    node.call(drag);
    
    // Add legend
    const legend = svg.append('g')
        .attr("class", "legend")
        .attr("transform", `translate(${width - 200}, 20)`);
        
    legend.selectAll('rect')
        .data(setNames)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (d, i) => i * 20)
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', (d, i) => colorScale(d));
        
    legend.selectAll('text')
      .data(setNames)
      .enter()
      .append('text')
      .attr('x', 20)
      .attr('y', (d, i) => i * 20 + 10)
      .text((d, i) => d);
        
    function ticked() {
        link
            .attr("x1", d => d.source.x === undefined ? 0 : d.source.x )
            .attr("y1", d => d.source.y === undefined ? 0 : d.source.y )
            .attr("x2", d => d.target.x === undefined ? 0 : d.target.x )
            .attr("y2", d => d.target.y === undefined ? 0 : d.target.y );
    
        node
             .attr("cx", d => d.x === undefined ? 0 : d.x )
             .attr("cy", d => d.y === undefined ? 0 : d.y );
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

<div>
    <svg id="graph"></svg>
</div>

<style>
#graph {
    max-width: 100%;
    height: auto;
}
</style>