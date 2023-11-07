<script lang="ts">
  import { onMount } from "svelte";
  import type { GraphVertex, Graph } from "../model/graph";
  import { CreateSetSimilariyFeatureMatrix, CreateVertexAdjacenyFeatureMatrix } from "../util/GraphUtil";
    import { RunSimulation, type SimulationOptions } from "../services/tSNE/tSNESimulation";
    import * as d3 from 'd3';
    import { graphObjectStore } from "../store/GraphStore";
    import { tsnejs } from "../services/tSNE/tsne";
  
  export let width: number;
  export let height: number;
  export let padding: number;
  
  enum SimilarityType { Set, Vertex };
  
  let graph: Graph;
  
  let tsne: any;
  
  let simulationRunning: boolean = false;
  let stepCount: number = 0;
  let plotContainer;
  let circles: d3.Selection<SVGCircleElement, number[], SVGGElement, unknown>;
  
  onMount(() => {
      const opt = {
          epsilon: 10,
          perplexity: 30,
          dim: 2,
      };
      
      tsne = new tsnejs.tSNE(opt);
  
      const unsub = graphObjectStore.subscribe(($graph) => {
          graph = $graph;
          
          const featureMatrix: number[][] = CreateSetSimilariyFeatureMatrix(graph);
          initPlot(featureMatrix);
          tsne.initDataDist(featureMatrix);
      });
  
      return unsub;
  });
  
  function startSimulation() {
      simulationRunning = true;
      setInterval(stepSimulation, 100);
  }
  
  function endSimulation() {
      simulationRunning = false;
  }
  
  function stepSimulation() {
      if (simulationRunning) {
          let cost = tsne.step();
          stepCount = tsne.iter;
          updatePlot();
      }
  }
  
  function initPlot(data: number[][]) {
      const svg = d3.select(".plot")
          .attr("width", width + padding * 2)
          .attr("height", height + padding * 2);
          
      // Clear svg
      d3.selectAll(".plot > *").remove();
      
      plotContainer = svg.append("g").attr("id", "plot-container");
      
      circles = plotContainer.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("r", 4)
        .attr("fill", (d, i) => graph.sets[i].color);
  }
  
  function updatePlot() {
      const solution: number[][] = tsne.getSolution();
  
      const xScale = d3.scaleLinear()
          .range([padding, width + padding]);
      
      const yScale = d3.scaleLinear()
          .range([height + padding, padding]);  
      
      circles
        .attr("cx", (d, i) => {
          const x = xScale(solution[i][0]);
          return x;
        })
        .attr("cy", (d, i) => {
          const y = yScale(solution[i][1]);
          return y;
        })
  }
  
  function drawScatterplot(data: number[][]) {
      const svg = d3.select(".plot")
          .attr("width", width + padding * 2)
          .attr("height", height + padding * 2);
          
      // Clear svg
      d3.selectAll(".plot > *").remove();
          
      const xScale = d3.scaleLinear()
          .domain([d3.min(data, d => d[0])!, d3.max(data, d => d[0])!]).nice()
          .range([padding, width + padding]);
      
      const yScale = d3.scaleLinear()
          .domain([d3.min(data, d => d[1])!, d3.max(data, d => d[1])!]).nice()
          .range([height + padding, padding]);  
      
      const plotContainer = svg.append("g").attr("id", "plot-container");
      
      const circles = plotContainer.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => xScale(d[0]))
        .attr("cy", d => yScale(d[1]))
        .attr("r", 4)
        .attr("fill", (d, i) => graph.sets[i].color)
        .on("mouseover", mouseover)
        .on("mousemove", (d, i) => mousemove(d, i))
        .on("mouseleave", mouseleave);
        
      const tooltip = d3.select(".plot-container")
          .append("div")
          .style("opacity", 0)
          .style("background-color", "white")
          .style("border", "solid")
          .style("border-width", "1px")
          .style("border-radius", "5px")
          .style("padding", "10px")
          .style("position", "fixed");
          
      function mouseover(event: any) {
          tooltip.style("opacity", 1);
      }
      
      function mousemove(event: any, item: number[]) {
          tooltip
              .text("Test")
              .style("left", (event.x + 10) + "px")
              .style("top", (event.y - 50) + "px");
      }
      
      function mouseleave(event: any) {
          tooltip
              .transition()
              .duration(200)
              .style("opacity", 0);
      }
  }
  
  </script>
  
  <div class="plot-container">
      <h2>Global Topology View</h2>
      <button on:click={() => startSimulation()}>Run</button>
      <button on:click={() => endSimulation()}>End</button>
      Step: {stepCount}
      <svg class="plot"></svg>
  </div>
  
  <style>
  .plot {
      max-width: 100%;
      height: auto;
  }
  </style>