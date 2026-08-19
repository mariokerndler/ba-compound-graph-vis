import * as d3 from "d3";
import {
  HypervertexType,
  type Hyperedge,
  type Hypergraph,
  type Hypervertex,
} from "../model/hypergraph";
import {
  GetColor,
  GetEdgeOpacity,
  GetSize,
  GetStroke,
} from "../util/Util";

interface GlobalNetworkRendererProps {
  hypergraph: Hypergraph;
  colors: Map<string, string>;
  hover: string[];
  width: number;
  height: number;
  onNodeClick: (vertex: Hypervertex) => void;
  onNodeMouseEnter: (name: string) => void;
  onNodeMouseExit: () => void;
}

export interface GlobalNetworkRenderer {
  updateStyles: (colors: Map<string, string>, hover: string[]) => void;
  destroy: () => void;
}

export function renderGlobalNetwork(
  svgElement: SVGSVGElement,
  tooltipElement: HTMLElement,
  props: GlobalNetworkRendererProps,
): GlobalNetworkRenderer {
  let colors = props.colors;
  let hover = props.hover;

  const svg = d3
    .select(svgElement)
    .attr("width", props.width)
    .attr("height", props.height)
    .attr("viewBox", [0, 0, props.width, props.height]);
  const tooltip = d3.select(tooltipElement);

  svg.selectAll("*").remove();

  const simulation = d3
    .forceSimulation(props.hypergraph.vertices)
    .force(
      "link",
      d3.forceLink(props.hypergraph.edges).id((d) => {
        const n = d as Hypervertex;
        return n.name;
      }),
    )
    .force("x", d3.forceX().x(props.width / 2))
    .force("y", d3.forceY().y(props.height / 2))
    .force(
      "collide",
      d3
        .forceCollide()
        .radius((d) => {
          const n = d as Hypervertex;
          return GetSize(n) + 5;
        })
        .iterations(3),
    )
    .force("charge", d3.forceManyBody().strength(-30))
    .on("tick", ticked);

  const graphContainer = svg.append("g").attr("id", "graph-container");
  const drag = d3
    .drag<SVGElement, Hypervertex, Hypervertex>()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);

  const links = graphContainer
    .selectAll("line")
    .data(props.hypergraph.edges)
    .enter()
    .append("line")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .attr("stroke-width", (d) => d.thickness)
    .attr("stroke-opacity", (d) => GetEdgeOpacity(hover, d));

  const setNodes = graphContainer
    .selectAll("circle")
    .data(props.hypergraph.vertices)
    .enter()
    .filter((d) => d.type == HypervertexType.SET)
    .append("circle")
    .attr("r", (d) => GetSize(d))
    .style("fill", (d) => GetColor(props.hypergraph, colors, d, hover))
    .style("stroke", (d) => GetStroke(hover, d))
    .style("stroke-width", 2)
    .on("mouseover", (event) => {
      const name = event.target.__data__.name;
      tooltip.style("visibility", "visible").text(name);
      props.onNodeMouseEnter(name);
    })
    .on("mousemove", (event) => positionTooltip(tooltip, event))
    .on("mouseout", () => {
      tooltip.style("visibility", "hidden");
      props.onNodeMouseExit();
    })
    .on("click", (_, vertex) => props.onNodeClick(vertex))
    .call(drag as any);

  const vertNodes = graphContainer
    .selectAll("rect")
    .data(props.hypergraph.vertices)
    .enter()
    .filter((d) => d.type == HypervertexType.VERTEX)
    .append("rect")
    .attr("width", (d) => GetSize(d))
    .attr("height", (d) => GetSize(d))
    .style("fill", (d) => GetColor(props.hypergraph, colors, d, hover))
    .style("stroke", (d) => GetStroke(hover, d))
    .style("stroke-width", 2)
    .on("mouseover", (event) => {
      const name = event.target.__data__.name;
      tooltip.style("visibility", "visible").text(name);
      props.onNodeMouseEnter(name);
    })
    .on("mousemove", (event) => positionTooltip(tooltip, event))
    .on("mouseout", () => {
      tooltip.style("visibility", "hidden");
      props.onNodeMouseExit();
    })
    .call(drag as any);

  const zoom = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.5, 20])
    .on("zoom", (event) => {
      graphContainer.attr("transform", event.transform);
    });

  svg.call(zoom);

  function updateStyles(nextColors: Map<string, string>, nextHover: string[]) {
    colors = nextColors;
    hover = nextHover;

    setNodes
      .attr("r", (d) => GetSize(d))
      .style("fill", (d) => GetColor(props.hypergraph, colors, d, hover))
      .style("stroke", (d) => GetStroke(hover, d));

    vertNodes
      .attr("width", (d) => GetSize(d))
      .attr("height", (d) => GetSize(d))
      .style("fill", (d) => GetColor(props.hypergraph, colors, d, hover))
      .style("stroke", (d) => GetStroke(hover, d));

    links.attr("stroke-opacity", (d) => GetEdgeOpacity(hover, d));
  }

  function ticked() {
    links
      .attr("x1", (d) => (d.source.x === undefined ? 0 : d.source.x))
      .attr("y1", (d) => (d.source.y === undefined ? 0 : d.source.y))
      .attr("x2", (d) => (d.target.x === undefined ? 0 : d.target.x))
      .attr("y2", (d) => (d.target.y === undefined ? 0 : d.target.y));

    setNodes
      .attr("cx", (d) => (d.x === undefined ? 0 : d.x))
      .attr("cy", (d) => (d.y === undefined ? 0 : d.y));

    vertNodes
      .attr("x", (d) => (d.x === undefined ? 0 : d.x - GetSize(d) / 2))
      .attr("y", (d) => (d.y === undefined ? 0 : d.y - GetSize(d) / 2));
  }

  function dragstarted(
    event: d3.D3DragEvent<SVGElement, Hypervertex, Hypervertex>,
  ) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(
    event: d3.D3DragEvent<SVGElement, Hypervertex, Hypervertex>,
  ) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(
    event: d3.D3DragEvent<SVGElement, Hypervertex, Hypervertex>,
  ) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  return {
    updateStyles,
    destroy: () => {
      simulation.stop();
      svg.on(".zoom", null);
      svg.selectAll("*").remove();
    },
  };
}

function positionTooltip(
  tooltip: d3.Selection<HTMLElement, unknown, null, undefined>,
  event: MouseEvent,
) {
  tooltip
    .style("top", `${event.clientY + window.scrollY - 30}px`)
    .style("left", `${event.clientX}px`);
}
