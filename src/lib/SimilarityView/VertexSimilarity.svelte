<script lang="ts">
import { faArrowDownAZ, faArrowUpAZ, faLayerGroup, faShuffle, faXmark } from '@fortawesome/free-solid-svg-icons';
import * as d3 from 'd3';
import { createEventDispatcher, onMount } from 'svelte';
import Fa from 'svelte-fa';
import type { SimilarityContainer } from '../../model/similarity';
import { SortAscendingSimilarityContainer, SortClusteringSimilarityContainer, SortDescendingSimilarityContainer, SortRandomSimilarityContainer } from '../../services/MatrixReordering';
import { vertexHoverStore } from '../../store/GraphStore';
import { MapValueToColor } from '../../util/Util';

export let data: SimilarityContainer;
export let width: number;
export let height: number;

let svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>;

let connectionPositions: Map<string, number> = new Map<string, number>();
let originalConnectionPositions: Map<string, number>;
const dispatch = createEventDispatcher();

let zoomlevel: number = 0;
let zoom: d3.ZoomBehavior<SVGGElement, unknown>;

let originalData: SimilarityContainer;

interface FilterData {
    value: number;
    row: number;
    col: number;
    vertices: [string, string];
}

function setupSVG() {
    svg = d3.select(".matrix-vertex-similarity")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("id", "matrix-vertex-similarity-container");
        
    d3.select(".matrix-vertex-similarity")
        .call(initializeZoom as any);
}

function drawMatrix(d: SimilarityContainer) {
    if (svg === undefined) setupSVG();
    
    if (d === undefined) return; 
    
    const similarityContainer = structuredClone(d);

    const similarityMatrix: number[][] = similarityContainer.matrix;

    const similarityMatrixLength: number = similarityMatrix.length;

    const filteredData = filterData(similarityContainer);
    
    const tooltip = d3.select(".matrix-vertex-similarity-tooltip");
    
    d3.selectAll(".matrix-vertex-similarity g > *").remove();

    const squares = svg.selectAll("rect")
        .data(filteredData)
        .enter()
        .append("rect")
        .attr("x", d => getRectPosition(d, similarityMatrixLength, true))
        .attr("y", d => getRectPosition(d, similarityMatrixLength, false))
        .attr("width", d => getRectSize(d, similarityMatrixLength, true))
        .attr("height", d => getRectSize(d, similarityMatrixLength, false))
        .attr("fill", d => MapValueToColor(d.value))
        .on("mouseover", (_, i) => onMouseOver(i, tooltip))
        .on("mousemove", d => tooltip.style("top", (d.clientY + window.scrollY - 30)+"px").style("left",(d.clientX)+"px"))
        .on("mouseout", () => onMouseOut(tooltip));
        
    for (let i = 0; i < similarityMatrixLength; i++) {        
        connectionPositions.set(d.descriptor[i], i * (height / similarityMatrixLength) + (height / similarityMatrixLength) / 2)
    }
    
    if (connectionPositions.size > 0) {
        originalConnectionPositions = new Map<string, number>(connectionPositions);
        dispatch('connectionPositions', connectionPositions);
    }
}

function getRectSize(data: FilterData, n: number, isWidth: boolean): number {
    let v: number = (isWidth ? width : height) / n;
    return v;
}

function getRectPosition(data: FilterData, n: number, isWidth: boolean): number {
    let v: number = 0;
    if (isWidth) v = data.col * (width / n);
    else         v = data.row * (height / n);

    return v;
}

function onMouseOver(data: FilterData, tooltip: d3.Selection<d3.BaseType, unknown, HTMLElement, any>) {
    if(zoomlevel > 3) {
        tooltip.style("visibility", "visible").text(`Row: ${data.vertices[0]} ,Col: ${data.vertices[1]}`);
        
        vertexHoverStore.set([data.vertices[0], data.vertices[1]]);
    } else {
        tooltip.style("visibility", "hidden")
    }
}

function onMouseOut(tooltip: d3.Selection<d3.BaseType, unknown, HTMLElement, any>) {
    tooltip.style("visibility", "hidden");
    
    vertexHoverStore.set([]);
}   

function getDescFromRowCol(d: SimilarityContainer, row: number, col: number): [string, string] {
    const rowDesc = d.descriptor[row];
    const colDesc = d.descriptor[col];
    
    return [rowDesc, colDesc];
}

function filterData(d: SimilarityContainer): FilterData[] {
    let filteredData: FilterData[];
    
    filteredData = d.matrix.flatMap((row, i) =>
        row.map((value, j) => {
          return {
            value: value,
            row: i,
            col: j,
            vertices: getDescFromRowCol(d, i, j)
          }  
        })
    );
    
    filteredData = filteredData.filter(item => item.value > 0);
    
    return filteredData;
}

function initializeZoom(container: d3.Selection<SVGGElement, unknown, HTMLElement, any>) {
    zoom = d3.zoom<SVGGElement, unknown>()
        .scaleExtent([1, Math.min(width / 10, height / 10)]) 
        .translateExtent([[0, 0], [width, height]])
        .on("zoom", zoomed);

    container.call(zoom);
}

function zoomed(event: d3.D3ZoomEvent<SVGGElement, unknown>) {
    if (event.transform.k > 1) {
        svg.attr("transform", event.transform as any);
        
        zoomlevel = event.transform.k;
        
        // Update the connectionPositions based on the current scale and transform
        connectionPositions.forEach((value, key) => {
            const originalPosition = originalConnectionPositions.get(key) || 0;
            const newPosition = originalPosition * event.transform.k + event.transform.y;
            connectionPositions.set(key, newPosition);
        });
        dispatch('connectionPositions', connectionPositions);
    } else {
        svg.attr("transform", d3.zoomIdentity as any);
        
        zoomlevel = d3.zoomIdentity.k;
        
        connectionPositions = new Map<string, number>(originalConnectionPositions);
        dispatch('connectionPositions', connectionPositions);
    }
}

function revertOrder() {
    drawMatrix(data);
}

function randomOrder() {
    const randomOrder = SortRandomSimilarityContainer(data);
    drawMatrix(randomOrder);
}

function ascendingOrder() {
    const ascendingOrder = SortAscendingSimilarityContainer(data);
    drawMatrix(ascendingOrder);
}

function descendingOrder() {
    const descendingOrder = SortDescendingSimilarityContainer(data);
    drawMatrix(descendingOrder);
}

function clusterOrder() {
    const clusterOrder = SortClusteringSimilarityContainer(data);
    drawMatrix(clusterOrder);
}

onMount(() => {
    originalData = data;

    setupSVG();
})

$: drawMatrix(data)

</script>

<div>
    <div class="header-container">
        <h2>Vertex-Similarity</h2>
        <div class="matrix-buttons">
            <button class="button" title="Default order" on:click={() => revertOrder()}>
                <Fa icon={faXmark}/>
            </button>
        
            <button class="button" title="Random order" on:click={() => randomOrder()}>
                <Fa icon={faShuffle}/>
            </button>
            
            <button class="button" title="Order by id ascending" on:click={() => ascendingOrder()}>
                <Fa icon={faArrowDownAZ}/>
            </button>
            
            <button class="button" title="Order by id descending" on:click={() => descendingOrder()}>
                <Fa icon={faArrowUpAZ}/>
            </button>
            
            <button class="button" title="Order by id descending" on:click={() => clusterOrder()}>
                <Fa icon={faLayerGroup}/>
            </button>
        </div>
    </div>
    
    <svg class="matrix-vertex-similarity"></svg>
    <div class="matrix-vertex-similarity-tooltip tooltip"></div>
</div>

<style>
svg {
    border: 1px solid var(--darkblue);
    margin-top: 5px;
}
</style>