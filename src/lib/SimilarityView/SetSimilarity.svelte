<script lang="ts">
import { faArrowDownAZ, faArrowUpAZ, faLayerGroup, faShuffle, faXmark } from '@fortawesome/free-solid-svg-icons';
import * as d3 from 'd3';
import { createEventDispatcher, onDestroy, onMount } from 'svelte';
import Fa from 'svelte-fa';
import type { Unsubscriber } from 'svelte/store';
import type { SimilarityContainer } from '../../model/similarity';
import { SortAscendingSimilarityContainer, SortClusteringSimilarityContainer, SortDescendingSimilarityContainer, SortRandomSimilarityContainer } from '../../services/MatrixReordering';
import { colorStore, hoverStore } from '../../store/GraphStore';
import { MapValueToColor } from '../../util/Util';

export let data: SimilarityContainer;
export let strokeWidth: number = 3;
export let width: number;
export let height: number;

let svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>;

let colors: Map<string, string>;
let colorUnsub: Unsubscriber;

let connectionPositions: Map<string, number> = new Map<string, number>();
let originalConnectionPositions: Map<string, number>;
const dispatch = createEventDispatcher();

interface FilterData {
    value: number;
    row: number;
    col: number;
    sets: [string, string];
}

function setupSVG() {
    svg = d3.select(".matrix-set-similarity")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("id", "matrix-set-similarity-container");
}

function drawMatrix(d: SimilarityContainer) {
    if (svg === undefined) setupSVG();
    
    if (d === undefined) return; 
    
    const similarityContainer = structuredClone(d);

    const similarityMatrix: number[][] = similarityContainer.matrix;

    const similarityMatrixLength: number = similarityMatrix.length;

    const filteredData = filterData(similarityContainer);
    
    const tooltip = d3.select(".matrix-set-similarity-tooltip");
    
    d3.selectAll(".matrix-set-similarity g > *").remove();

    const squares = svg.selectAll("rect")
        .data(filteredData)
        .enter()
        .append("rect")
        .attr("x", d => getRectPosition(d, similarityMatrixLength, true))
        .attr("y", d => getRectPosition(d, similarityMatrixLength, false))
        .attr("width", d => getRectSize(d, similarityMatrixLength, true))
        .attr("height", d => getRectSize(d, similarityMatrixLength, false))
        .attr("fill", d => MapValueToColor(d.value));
        
    squares
        .attr("stroke", d => getStroke(d))
        .attr("stroke-width", strokeWidth)
        .attr("shape-rendering", "crispEdges")
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

function getStroke(data: FilterData): string {
    return isSelected(data) ? "#2c3e50" : "none";
}

function getRectSize(data: FilterData, n: number, isWidth: boolean): number {
    let v: number = (isWidth ? width : height) / n;
    
    if (isSelected(data)) {
        v = v - 2 * strokeWidth;
    }
    
    return v;
}

function getRectPosition(data: FilterData, n: number, isWidth: boolean): number {
    let v: number = 0;
    if (isWidth) v = data.col * (width / n);
    else         v = data.row * (height / n);

    if (isSelected(data)) {
        v = v + strokeWidth;
    }
    
    return v;
}

function isSelected(data: FilterData): boolean {
    if (colors === undefined || colors.size <= 0) return false;
    
    const selectedRow = colors.get(data.sets[0]);
    const selectedCol = colors.get(data.sets[1]);
    
    if (selectedRow === undefined || selectedCol === undefined) return false;
    if (selectedRow === selectedCol) return false;
    
    return true;
}

function onMouseOver(data: FilterData, tooltip: d3.Selection<d3.BaseType, unknown, HTMLElement, any>) {
    tooltip.style("visibility", "visible").text(`Row: ${data.sets[0]}, Col: ${data.sets[1]}`);

    hoverStore.set([data.sets[0], data.sets[1]]);
}

function onMouseOut(tooltip: d3.Selection<d3.BaseType, unknown, HTMLElement, any>) {
    tooltip.style("visibility", "hidden");
    hoverStore.set([]);
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
            sets: getDescFromRowCol(d, i, j)
          }  
        })
    );
    
    return filteredData;
}

function getGuideTargetPosition(data: FilterData, n: number, isWidth: boolean): number{
    let len: number = (isWidth ? width : height) / n;

    let v: number = 0;
    if (isWidth) v = data.col * (width / n) + (len / 2);
    else         v = data.row * (height / n) + (len / 2);

    return v;
}

function getGuideColor(data: FilterData, isRow: Boolean): string {
    if (isRow) {
        return colors.get(data.sets[0]) || "black";
    } else {
        return colors.get(data.sets[1]) || "black";
    }
}

function drawColorGuides(d: SimilarityContainer) {
    if (!d || d === undefined) return;
    if (!colors || colors === undefined || colors.size <= 0) return;
    if (svg === undefined) return;
    
    const similarityContainer = structuredClone(d);
    const similarityMatrixLength: number = similarityContainer.matrix.length;
    const filteredData: FilterData[] = filterData(similarityContainer);
    const guideContainer = svg.append("g").attr("id", "guide-container");
    const selectedData = filteredData.filter(data => isSelected(data));

    guideContainer.selectAll("lines")
                .data(selectedData)
                .enter()
                .append("line")
                .attr("x1", d => getGuideTargetPosition(d, similarityMatrixLength, true))
                .attr("y1", 0)
                .attr("x2", d => getGuideTargetPosition(d, similarityMatrixLength, true))
                .attr("y2", d => getGuideTargetPosition(d, similarityMatrixLength, false))
                .style("stroke", d => getGuideColor(d, false))
                .style("stroke-width", 3);
                
    guideContainer.selectAll("lines")
                .data(selectedData)
                .enter()
                .append("line")
                .attr("x1", 0)
                .attr("y1", d => getGuideTargetPosition(d, similarityMatrixLength, false))
                .attr("x2", d => getGuideTargetPosition(d, similarityMatrixLength, true))
                .attr("y2", d => getGuideTargetPosition(d, similarityMatrixLength, false))
                .style("stroke", d => getGuideColor(d, true))
                .style("stroke-width", 3);
    
    guideContainer.raise();
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
    setupSVG();
    
    colorUnsub = colorStore.subscribe($colors => {
        colors = $colors;
        
        drawMatrix(data);
        
        drawColorGuides(data);
    });
})

onDestroy(() => {
    colorUnsub();
})

$: drawMatrix(data)

</script>

<div>
    <div class="matrix-set-header">
        <h2>Set-Similarity</h2>
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
    
    <svg class="matrix-set-similarity"></svg>
    <div class="matrix-set-similarity-tooltip tooltip"></div>
</div>

<style>
svg {
    border: 1px solid var(--darkblue);
    margin-top: 5px;
}

.matrix-set-header {
    display: flex;
    justify-content: space-between;
}
</style>