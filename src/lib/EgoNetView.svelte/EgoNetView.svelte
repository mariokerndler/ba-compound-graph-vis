<script lang="ts">
    import * as d3 from 'd3';
    import { onMount } from "svelte";
    import type { Unsubscriber } from 'svelte/store';
    import type { EgoNetNode } from '../../model/egonet';
    import type { Graph, GraphVertex } from '../../model/graph';
    import { egonetSelectedVertexStore, graphObjectStore, vertexHoverStore } from '../../store/GraphStore';
    import { CreateEgoNetworkFromGraph } from '../../util/EgoNetworkUtil';
    import { maxEgoNetDepth } from '../../util/Globals';
    
    export let width: number;
    export let height: number;
    
    let svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;
    
    let depth = 2;
    
    let graph: Graph;
    let graphStoreUnsub: Unsubscriber;
    
    let selectedVertex: GraphVertex;
    let selectedVertexUnsub: Unsubscriber;
    
    let enableDistance: boolean = true;
    
    const nodeSize = 25;
    const additionalLength = 250;
    
    function setupSVG() {
        const componentWidth = document.querySelector(".egonetview-container")?.clientWidth;
    
        if (componentWidth !== undefined) width = componentWidth;
        
        svg = d3.select(".egonet-svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height]);
    }
    
    function drawTree(selectedVertex: GraphVertex) {
        if (!svg) setupSVG();
        
        if (!graph) return;
        
        if (!selectedVertex) return;
        
        d3.selectAll(".egonet-svg > *").remove();
        
        const data = CreateEgoNetworkFromGraph(graph, selectedVertex, depth);

        const root = d3.hierarchy(data).eachBefore((n, index) => {
            n.data.index = index;
            if (n.depth === 0) {
                n.data.x = 0;
            } else {
                const parent = n.parent;
                if (parent) {
                    const lastX = parent.data.x;
                    if (lastX !== undefined) {  
                        const x1 = lastX;
                        const x2 = lastX + additionalLength;
                        let newX = interpolate(x1, x2, 1 - n.data.distanceToParent);    
                        n.data.x = newX;
                    }
                }
            }
        });
        const nodes = root.descendants();
        const height = (nodes.length + 1) * nodeSize;
    
        svg = d3.select(".egonet-svg")
          .attr("width", width)
          .attr("height", height)
          .attr("viewBox", [-nodeSize / 2, -nodeSize * 3 / 2, width, height])
          .attr("style", "max-width: 100%; height: auto; font: 15px sans-serif;");
          
        const link = svg.append("g")
            .attr("fill", "none")
            .attr("stroke", "#999")
            .selectAll()
            .data(root.links())
            .join("path")
            .attr("d", d => {
                return `
                    M${enableDistance ? (d.source.data.x || 0) : d.source.depth * nodeSize},${(d.source.data.index || 0) * nodeSize}
                    V${(d.target.data.index || 0) * nodeSize}
                    h${enableDistance ? interpolate(0, additionalLength, 1 - d.target.data.distanceToParent) : nodeSize}
                `
            });
      
        const node = svg.append("g")
            .selectAll()
            .data(nodes)
            .join("g")
                .attr("transform", d => `translate(0,${(d.data.index || 0) * nodeSize})`)
            .on("mouseover", (_, i) => onMouseOver(i.data.name))
            .on("mouseout", () => onMouseOut());
    
        node.append("circle")
            .attr("cx", d => GetNodeX(d))
            .attr("fill", d => d.children ? "#555" : "#999")
            .attr("r", 5);
    
        node.append("text")
            .attr("dy", "0.31em")
            .attr("x", d => GetNodeX(d) + 6)
            .text(d => d.data.name)
            .clone(true).lower()
            .attr("stroke", "white");
    }
    
    function onMouseOver(vertexName: string) {
        vertexHoverStore.set([vertexName]);
    }
    
    function onMouseOut() {
        vertexHoverStore.set([]);
    }
    
    function onDepthChange() {
        drawTree(selectedVertex);
    }
    
    function onDistanceChange() {
        drawTree(selectedVertex);
    }
    
    function GetNodeX(d: d3.HierarchyNode<EgoNetNode>): number {
        if (enableDistance) {
            return d.data.x || 0;
        } else {
            return d.depth * nodeSize;
        }
    }
    
    function interpolate(x1: number, x2: number, scale: number): number {
      if (scale < 0 || scale > 1) {
        throw new Error("Scale must be between 0 and 1");
      }
    
      return x1 + (x2 - x1) * scale;
    }
    
    onMount(() => {
        setupSVG();
        
        graphStoreUnsub = graphObjectStore.subscribe($graph => {
            graph = $graph;
        });
        
        selectedVertexUnsub = egonetSelectedVertexStore.subscribe($vertex => {
            selectedVertex = $vertex;
            
            drawTree(selectedVertex);
        });
    })
    
    </script>
    
    <div class="egonetview-container">
        <div class="header-container">
            <h2>Node Relative View</h2>
            
            <div class="egonet-controlls">
                <div class="egotnet-switch-container" title="Enable distance">
                    <label class="switch">
                        <input type="checkbox" bind:checked={enableDistance} on:change={onDistanceChange}>
                        <span class="slider round"></span>
                    </label>
                </div>
        
                <div class="egonetview-button-container">
                    <div class="egonetview-depth">
                        <b>Depth:</b> {depth}
                    </div>
                    <input type="range" min="1" max={maxEgoNetDepth} bind:value={depth} on:change={onDepthChange}>
                </div>
            </div>
    
    
        </div>
        <svg class="egonet-svg"></svg>
    </div>
    
    <style>
    svg {
        border: 1px solid var(--darkblue);
        margin-top: 5px;
    }
    
    .egonetview-button-container {
        align-items: center;
        margin-right: 10px;
        gap: 5px
    }
    
    .egonet-controlls {
        display: flex;
        justify-items: center;
        gap: 20px;
    }
    
    .egotnet-switch-container {
        display: flex;
        align-items: center;
    }
    
    </style>