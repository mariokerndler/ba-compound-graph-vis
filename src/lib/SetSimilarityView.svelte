<script lang="ts">
import * as d3 from 'd3';
import { onMount } from 'svelte';

const similarityMatrix: number[][] = [
    [0.8, 0.2, 0.5],
    [0.4, 0.9, 0.7],
    [0.1, 0.6, 0.3]
  ];
  
  const svgWidth = 300;
  const svgHeight = 300;
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };
  const width = svgWidth - margin.left - margin.right;
  const height = svgHeight - margin.top - margin.bottom;

function getColor(value: number): string {
    return `rgba(0,0,0,${value})`;
}

let circlePositions: { cx: number; cy: number }[] = [];

onMount(() => {
    const svg = d3.select(".similarity-matrix")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create the squares
      const squares = svg.selectAll("rect")
        .data(similarityMatrix)
        .enter()
        .append("g")
        .selectAll("rect")
        .data((d, i) => d.map(value => ({ value, row: i })))
        .enter()
        .append("rect")
        .attr("x", (d, i) => i * (width / similarityMatrix.length))
        .attr("y", d => d.row * (height / similarityMatrix.length))
        .attr("width", width / similarityMatrix.length)
        .attr("height", height / similarityMatrix.length)
        .style("fill", d => getColor(d.value));
        
    // Create circles and save positions
  const circles = svg.selectAll("circle")
    .data(similarityMatrix)
    .enter()
    .append("circle")
    .attr("cx", (d, i) => {
      const cx = width + margin.right;
      const cy = i * (height / similarityMatrix.length) + (height / similarityMatrix.length) / 2;
      circlePositions.push({ cx, cy });
      return cx;
    })
    .attr("cy", (d, i) => i * (height / similarityMatrix.length) + (height / similarityMatrix.length) / 2)
    .attr("r", (height / similarityMatrix.length) / 2)
    .style("fill", "steelblue");
})
</script>

<svg class="similarity-matrix"></svg>