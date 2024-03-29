<script lang="ts">
  import * as d3 from 'd3';
  import { onDestroy, onMount } from 'svelte';
  import type { Unsubscriber } from 'svelte/motion';
  import type { Graph } from '../../model/graph';
  import { HypervertexType, type Hyperedge, type Hypergraph } from '../../model/hypergraph.';
  import { colorStore, graphObjectStore, hoverStore } from '../../store/GraphStore';
  import { GenerateHypergraphFromGraph } from '../../util/GraphUtil';
  import { GetColor, GetEdgeOpacity, GetSize, GetStroke, OnGlobalNodeClick, OnGlobalNodeMouseEnter, OnGlobalNodeMouseExit } from '../../util/Util';
  
  export let width: number;
  export let height: number;
  
  let graph: Graph;
  let hypergraph: Hypergraph;
  let graphStoreUnsub: Unsubscriber;
  
  let colors: Map<string, string>;
  let colorStoreUnsub: Unsubscriber;
  
  let hover: string[] = [];
  let hoverStoreUnsub: Unsubscriber;
  
  let svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;
  
  onMount(() => {
      setupSVG();
      
      graphStoreUnsub = graphObjectStore.subscribe(($graph) => {
          graph = $graph;
      
          hypergraph = GenerateHypergraphFromGraph(graph);
  
          if (hypergraph.vertices.length <= 0) return;
  
          hypergraph = structuredClone(hypergraph);
          drawCircleView(hypergraph);
      });
      
      colorStoreUnsub = colorStore.subscribe(($colors) => {
          colors = $colors;
          
          drawCircleView(hypergraph);
      });
      
      hoverStoreUnsub = hoverStore.subscribe(($hover) => {
          hover = $hover;
          
          drawCircleView(hypergraph);
      });
  })
  
  onDestroy(() => {
      graphStoreUnsub();
      colorStoreUnsub();
      hoverStoreUnsub();
  })
  
  function drawCircleView(g: Hypergraph) {
      if (g === undefined) return;
  
      d3.selectAll(".global-circle-graph > *").remove();

      const padding = 10;
      
      // Calculate circle radius based on SVG size
      const svgSize = Math.min(width, height);
      const circleRadius = svgSize / 2 - (padding * 2);
      
      const setVertices = g.vertices.filter(v => v.type === HypervertexType.SET);
  
      // Create a scale for positioning nodes in a circle
      const setScale = d3.scaleLinear()
        .domain([0, setVertices.length])
        .range([0, 2 * Math.PI]);
        
      const graphContainer = svg.append("g").attr("id", "graph-circle-container");
      const tooltip = d3.select(".global-circle-graph-tooltip");
      
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
        .attr('r', d => GetSize(d))
        .attr('fill', d => GetColor(g, colors, d, hover))
        .style("stroke", d => GetStroke(hover, d))
        .style("stroke-width", 2)
        .on("mouseover", d => {
          tooltip.style("top", (d.clientY + window.scrollY - 30)+"px").style("left",(d.clientX)+"px");
          OnGlobalNodeMouseEnter(d.target.__data__.name, tooltip)
        })
        .on("mouseout", () => OnGlobalNodeMouseExit(tooltip))
        .on("mousedown", (_, i) => OnGlobalNodeClick(graph, i));
      
      // Recalculate intersect vertice positions.
      g = calculatePositionForIntersectNodes(g, width / 2, height / 2, circleRadius / 3);
      const intersectVertices = g.vertices.filter(v => v.type === HypervertexType.VERTEX);
      
      const intersectNodes = graphContainer
          .selectAll('.vertex-node')
          .data(intersectVertices)
          .enter()
          .append('rect')
          .attr('class', '.vertex-node')
          .attr('x', d => (d.x || 0) - (GetSize(d) / 2))
          .attr('y', d => (d.y || 0) - (GetSize(d) / 2))
          .attr('width', d => GetSize(d))
          .attr('height', d => GetSize(d))
          .attr('fill', d => GetColor(g, colors, d, hover))
          .on("mouseover", d => {
            tooltip.style("top", (d.clientY + window.scrollY - 30)+"px").style("left",(d.clientX)+"px");
            OnGlobalNodeMouseEnter(d.target.__data__.name, tooltip, true)
          })
          .on("mouseout", () => OnGlobalNodeMouseExit(tooltip, true));
    
      const edges = graphContainer
          .selectAll('path')
          .data(g.edges)
          .enter()
          .append('path')
          .attr("d", d => drawCurve(d))
          .attr("fill", "none")
          .attr("stroke", "#999")
          .attr("stroke-opacity", d => GetEdgeOpacity(hover, d));
          
      // Draw outer circle
      graphContainer.append('circle')
        .attr('r', circleRadius)
        .attr('cx', width / 2)
        .attr('cy', height / 2)
        .attr('fill', 'none')
        .attr("stroke", "steelblue")
        .attr("stroke-opacity", 0.2);
        
      // Draw inner circle
      graphContainer.append('circle')
        .attr('r', circleRadius / 3)
        .attr('cx', width / 2)
        .attr('cy', height / 2)
        .attr('fill', 'none')
        .attr("stroke", "red")
        .attr("stroke-opacity", 0.2);
      
      setNodes.raise();
      intersectNodes.raise();
  }
  
  function drawCurve(d: Hyperedge): string {
      const x1 = d.source.x === undefined ? 0 : d.source.x;
      const y1 = d.source.y === undefined ? 0 : d.source.y;
      const x2 = d.target.x === undefined ? 0 : d.target.x;
      const y2 = d.target.y === undefined ? 0 : d.target.y;
  
      const center = [width / 2, height / 2];
      const midpoint = [(x1 + x2) / 2, (y1 + y2) / 2];
      const centerMidpoint = [(midpoint[0] + center[0]) / 2, (midpoint[1] + center[1]) / 2];
  
      let path: d3.Path = d3.path();
      path.moveTo(x1, y1);
      if (d.target.type === HypervertexType.SET && d.source.type === HypervertexType.SET) {
        path.quadraticCurveTo(centerMidpoint[0], centerMidpoint[1], x2, y2);
      } else {
          path.lineTo(x2, y2);
      }
      
      return path.toString();
  }
  
  function calculatePositionForIntersectNodes(g: Hypergraph, cx: number, cy: number, radius: number): Hypergraph {
      const intersectNodes = g.vertices.filter(e => e.type === HypervertexType.VERTEX);
      
      intersectNodes.forEach(sourceNode => {
          const edges = g.edges.filter(e => e.source === sourceNode);
          const targetNodes = edges.map(e => e.target);
          const targetNodeX = targetNodes.map(e => e.x || 0);
          const targetNodeY = targetNodes.map(e => e.y || 0);
          const [sourceNodeX, sourceNodeY] = calculateInnerPoint(targetNodeX, targetNodeY);
          const d = Math.sqrt(Math.pow((sourceNodeX - cx), 2) + Math.pow((sourceNodeY - cy), 2));
          const constrainedX = cx + ((sourceNodeX - cx)/ (d === 0 ? 1 : d)) * radius;
          const constrainedY = cy + ((sourceNodeY - cy)/ (d === 0 ? 1 : d)) * radius;
          sourceNode.x = constrainedX;
          sourceNode.y = constrainedY;
      });
      
      return g;
  }
  
  function calculateInnerPoint(x: number[], y: number[]): [number, number] {
      const newX = x.reduce((a, b) => a + b, 0);
      const newY = y.reduce((a, b) => a + b, 0);
      
      return [newX / x.length, newY / y.length];
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