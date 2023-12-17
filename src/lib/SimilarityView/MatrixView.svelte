<script lang="ts">
import * as d3 from 'd3';
import { createEventDispatcher, onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/store';
import type { SimilarityContainer } from '../../model/similarity';
import { colorStore, hoverStore } from '../../store/GraphStore';
import { MapValueToColor } from '../../util/Util';

export let data: SimilarityContainer;
export let renderColorGuides: boolean = false;
export let renderTooltip: boolean = false;
export let highlightSelected: boolean = false;
export let strokeWidth: number = 3;
export let name: string;
export let width: number;
export let height: number;

let svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>;

let colors: Map<string, string>;
let colorUnsub: Unsubscriber;

const connectionPositions: Map<string, number> = new Map<string, number>();
const dispatch = createEventDispatcher();

interface FilterData {
    value: number;
    row: number;
    col: number;
    sets: [string, string];
}

function setupSVG() {
    svg = d3.select(`.matrix-${name}`)
        .attr("width", width)
        .attr("height", height)
        .append("g");
}

function drawMatrix(d: SimilarityContainer) {
    if (svg === undefined) setupSVG();
    
    if (d === undefined) return; 
    
    const similarityContainer = structuredClone(d);

    const similarityMatrix: number[][] = similarityContainer.matrix;

    const similarityMatrixLength: number = similarityMatrix.length;

    const filteredData = filterData(similarityContainer);
    
    d3.selectAll(`.matrix-${name} g > *`).remove();

    const squares = svg.selectAll("rect")
        .data(filteredData)
        .enter()
        .append("rect")
        .attr("x", d => getRectPosition(d, similarityMatrixLength, true))
        .attr("y", d => getRectPosition(d, similarityMatrixLength, false))
        .attr("width", d => getRectSize(d, similarityMatrixLength, true))
        .attr("height", d => getRectSize(d, similarityMatrixLength, false))
        .attr("fill", d => MapValueToColor(d.value));
        
    if (highlightSelected) {
        squares
            .attr("stroke", d => getStroke(d))
            .attr("stroke-width", strokeWidth)
            .attr("shape-rendering", "crispEdges");
    }
        
    if (renderTooltip) {
        const tooltip = d3.select(`.matrix-${name}-tooltip`);
        
        squares
            .on("mouseover", (_, i) => onMouseOver(i, tooltip))
            .on("mousemove", d => tooltip.style("top", (d.clientY + window.scrollY - 30)+"px").style("left",(d.clientX)+"px"))
            .on("mouseout", () => onMouseOut(tooltip));
    }
        
    for (let i = 0; i < similarityMatrixLength; i++) {        
        connectionPositions.set(data.descriptor[i], i * (height / similarityMatrixLength) + (height / similarityMatrixLength) / 2)
    }
    
    if (connectionPositions.size > 0) {
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
    if (!highlightSelected) return false;
    if (colors === undefined || colors.size <= 0) return false;
    
    const selectedRow = colors.get(data.sets[0]);
    const selectedCol = colors.get(data.sets[1]);
    
    if (selectedRow === undefined || selectedCol === undefined) return false;
    if (selectedRow === selectedCol) return false;
    
    return true;
}

function onMouseOver(data: FilterData, tooltip: d3.Selection<d3.BaseType, unknown, HTMLElement, any>) {
    tooltip.style("visibility", "visible").text(`${data.sets[0]} / ${data.sets[1]}`);

    hoverStore.set([data.sets[0], data.sets[1]]);
}

function onMouseOut(tooltip: d3.Selection<d3.BaseType, unknown, HTMLElement, any>) {
    tooltip.style("visibility", "hidden");
    hoverStore.set([]);
}

function getDescFromRowCol(row: number, col: number): [string, string] {
    const rowDesc = data.descriptor[row];
    const colDesc = data.descriptor[col];
    
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
            sets: getDescFromRowCol(i, j)
          }  
        })
    );
    
    if (!renderTooltip) {
        filteredData = filteredData.filter(item => item.value > 0);
    } 
    
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
    if (!data || data === undefined) return;
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

onMount(() => {
    setupSVG();
    
    colorUnsub = colorStore.subscribe($colors => {
        colors = $colors;
        
        drawMatrix(data);
        
        if (renderColorGuides) {
            drawColorGuides(data);
        }
    });
})

onDestroy(() => {
    colorUnsub();
})

$: drawMatrix(data)

</script>

<div>
    <h2>{name}</h2>
    <svg class="matrix-{name}"></svg>
    {#if renderTooltip}
        <div class="matrix-{name}-tooltip tooltip"></div>
    {/if}
</div>

<style>
svg {
    border: 1px solid var(--darkblue);
    margin-top: 5px;
}
</style>