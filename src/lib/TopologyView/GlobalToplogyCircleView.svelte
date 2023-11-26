<script lang="ts">
import * as d3 from 'd3';
import { onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/motion';
import type { Graph } from '../../model/graph';
import { HypernodeType, type Hyperedge, type Hypergraph } from '../../model/hypergraph.';
import { colorStore, graphObjectStore } from '../../store/GraphStore';
import { GenerateHypergraphFromGraph } from '../../util/GraphUtil';
import { GetColor, GetSize } from '../../util/Util';

export let width: number;
export let height: number;

let graph: Graph;
let hypergraph: Hypergraph;
let graphStoreUnsub: Unsubscriber;

let colors: Map<string, string>;
let colorStoreUnsub: Unsubscriber;

let svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;

onMount(() => {
    setupSVG();
    
    graphStoreUnsub = graphObjectStore.subscribe(($graph) => {
        graph = $graph;
    
        hypergraph = GenerateHypergraphFromGraph(graph);

        if (hypergraph.vertices.length <= 0) return;

        let graphCopy = structuredClone(hypergraph);
        drawCircleView(graphCopy);
    });
    
    colorStoreUnsub = colorStore.subscribe(($colors) => {
        colors = $colors;
        
        drawCircleView(hypergraph);
    });
})

onDestroy(() => {
    graphStoreUnsub();
    colorStoreUnsub();
})

function drawCircleView(g: Hypergraph) {
    d3.selectAll(".global-circle-graph > *").remove();

    const padding = 20;
    
    // Calculate circle radius based on SVG size
    const svgSize = Math.min(width, height);
    const circleRadius = svgSize / 2 - (padding * 2);
    
    const setVertices = g.vertices.filter(v => v.type === HypernodeType.SET);
    const vertexVertices = g.vertices.filter(v => v.type === HypernodeType.VERTEX);

    // Create a scale for positioning nodes in a circle
    const setScale = d3.scaleLinear()
      .domain([0, setVertices.length])
      .range([0, 2 * Math.PI]);
      
    const vertexScale = d3.scaleLinear()
      .domain([0, vertexVertices.length])
      .range([0, 2 * Math.PI]);
    
    const graphContainer = svg.append("g").attr("id", "graph-container");
    
    const setNodes = graphContainer
      .selectAll('.set-node')
      .data(setVertices)
      .enter()
      .append('circle')
      .attr('class', '.set-node')
      .attr('cx', (d, i) => {
        d.x = (width / 2) + circleRadius * Math.cos(setScale(i));
        return d.x;
      })
      .attr('cy', (d, i) => {
        d.y = (height / 2) + circleRadius * Math.sin(setScale(i));
        return d.y;
      })
      .attr('r', d => GetSize(graph, d))
      .attr('fill', d => GetColor(g, colors, d));
      
    const vertexNodes = graphContainer
      .selectAll('.vertex-node')
      .data(vertexVertices)
      .enter()
      .append('circle')
      .attr('class', '.vertex-node')
      .attr('cx', (d, i) => {
        d.x = (width / 2) + (circleRadius / 2) * Math.cos(vertexScale(i));
        return d.x;
      })
      .attr('cy', (d, i) => {
        d.y = (height / 2) + (circleRadius / 2) * Math.sin(vertexScale(i));
        return d.y;
      })
      .attr('r', d => d.size)
      .attr('fill', d => GetColor(g, colors, d));
          
    const edges = graphContainer
        .selectAll('path')
        .data(g.edges)
        .enter()
        .append('path')
        .attr("d", d => drawCurve(d))
        .attr("fill", "none")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6);
    
       
    vertexNodes.raise();
    setNodes.raise();
}

function drawCurve(d: Hyperedge){
    const sourceX = d.source.x === undefined ? 0 : d.source.x;
    const sourceY = d.source.y === undefined ? 0 : d.source.y;
    const targetX = d.target.x === undefined ? 0 : d.target.x;
    const targetY = d.target.y === undefined ? 0 : d.target.y;

    let path: d3.Path = d3.path();
    path.moveTo(sourceX, sourceY);
    path.lineTo(targetX, targetY);
    return path.toString();
}

function setupSVG() {
    const componentWidth = document.querySelector(".global-topology-container")?.clientWidth;

    if (componentWidth !== undefined) width = componentWidth;

    svg = d3.select(".global-circle-graph")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height]);
}
</script>

<div class="global-topology-circle-container">
    <svg class="global-circle-graph"></svg>
    <div class="global-circle-graph-tooltip tooltip"></div>
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