<script lang="ts">
  import * as d3 from 'd3';
  import { onDestroy, onMount } from 'svelte';
  import type { Unsubscriber } from 'svelte/store';
  import type { Graph } from '../../model/graph';
  import type { SimilarityConnection } from '../../model/similarity';
  import { colorStore, graphObjectStore, vertexHoverStore } from '../../store/GraphStore';
  import { ApplyOpacityToHexColor } from '../../util/Util';


export let width: number;
export let height: number;
export let setPositions: Map<string, number>;
export let vertexPositions: Map<string, number>;

let graphSVG: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;

let graph: Graph;
let graphUnsub: Unsubscriber;

let colors: Map<string, string>;
let colorUnsub: Unsubscriber;

let hoveredVertex: string;
let vertexHoverUnsub: Unsubscriber;

onMount(() => {
    graphUnsub = graphObjectStore.subscribe($graph => {
        graph = $graph;
    });
    
    colorUnsub = colorStore.subscribe($colors => {
        colors = $colors;
        if (setPositions.size > 0 && vertexPositions.size > 0) drawGraph();
    });
    
    vertexHoverUnsub = vertexHoverStore.subscribe($vertex => {
        hoveredVertex = $vertex;
        drawGraph();
    });
})

onDestroy(() => {
    graphUnsub();
    colorUnsub();
    vertexHoverUnsub();
})

function setupGraphSVG(width: number) {
    // Clear svg
    d3.selectAll(".bipartite-graph > *").remove();

    graphSVG = d3.select(".bipartite-graph")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height]);
}

function drawCurve(con: SimilarityConnection){
    let path: d3.Path = d3.path();
    path.moveTo(con.x0, con.y0);
    path.bezierCurveTo(con.x1 / 2, con.y0, con.x1 / 2, con.y1, con.x1, con.y1);
    path.lineTo(con.x1, con.y1);
    return path.toString();
}

function hasHover(): boolean {
    return hoveredVertex !== undefined && hoveredVertex.length > 0;
}

function prepareData(set: Graph, color: string): SimilarityConnection[] {
    const connections: SimilarityConnection[] = [];
    
    const setY = setPositions.get(set.name);
    if (setY === undefined) return connections;
    
    set.vertices.forEach(vertex => {
        const vertexY = vertexPositions.get(vertex.name);
        if (vertexY === undefined) return;
        
        let col = color;
        if (hasHover()) {
            if (vertex.name === hoveredVertex) {
                col = color;
            } else {
                col = ApplyOpacityToHexColor(color, 0.2);
            }
        }
        
        const connection: SimilarityConnection = {
            x0: 0,
            y0: setY,
            x1: width,
            y1: vertexY,
            color: col,
            name: set.name
        };
        
        connections.push(connection);
    });
    
    return connections;
}

function drawGraph() {
    if (graphSVG === undefined) setupGraphSVG(width);
    
    if (colors === undefined) return;
    
    console.log("Activate");
    
    d3.selectAll(".bipartite-graph > *").remove();
    
    const connections: SimilarityConnection[] = [];
    colors.forEach((value, key) => {
        const set = graph.sets.filter(s => s.name === key)[0];
        const conn = prepareData(set, value);
        conn.forEach(c => connections.push(c));
    });
    
    const pathContainer = graphSVG.append("g");
    const checkedConnections: string[] = [];
    
    connections.forEach(connection => {
        pathContainer.append("path")
            .style("stroke", connection.color)
            .style("fill", "none")
            .attr("d", drawCurve(connection));
            
        if (!checkedConnections.includes(connection.name)) {
            pathContainer.append("text")
                .text(connection.name)
                .attr("x", connection.x0 + 10)
                .attr("y", connection.y0 - 10)
                .attr("text-anchor", "start")
                .style("fill", connection.color);
                
            checkedConnections.push(connection.name);
        }
    });
}

$: setupGraphSVG(width);
$: if (setPositions.size > 0 && vertexPositions.size > 0) drawGraph();
$: vertexPositions, drawGraph();
</script>

<div>
    <h2>Connection Graph</h2>
    <svg class="bipartite-graph"></svg>
</div>

<style>
    svg {
        margin-top: 5px;
    }
</style>