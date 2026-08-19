import * as d3 from "d3";
import type { Graph, GraphEdge, GraphVertex } from "../model/graph";
import { InterpolateColor } from "../util/Util";

export interface SetColorAssoc {
  setname: string;
  color: string;
}

interface SetRelativeTopologyRendererProps {
  graph: Graph;
  colors: SetColorAssoc[];
  hoveredVertices: string[];
  width: number;
  height: number;
  onNodeClick: (vertex: GraphVertex) => void;
  onNodeMouseEnter: (name: string) => void;
  onNodeMouseExit: () => void;
}

export interface SetRelativeTopologyRenderer {
  updateStyles: (hoveredVertices: string[]) => void;
  destroy: () => void;
}

export function renderSetRelativeTopology(
  svgElement: SVGSVGElement,
  tooltipElement: HTMLElement,
  props: SetRelativeTopologyRendererProps,
): SetRelativeTopologyRenderer {
  let hoveredVertices = props.hoveredVertices;

  const svg = d3
    .select(svgElement)
    .attr("width", props.width)
    .attr("height", props.height)
    .attr("viewBox", [0, 0, props.width, props.height]);
  const tooltip = d3.select(tooltipElement);

  svg.selectAll("*").remove();

  const simulation = d3
    .forceSimulation(props.graph.vertices)
    .force(
      "link",
      d3.forceLink(props.graph.edges).id((d) => {
        const n = d as GraphVertex;
        return n.name;
      }),
    )
    .force("charge", d3.forceManyBody().strength(-20))
    .force("collide", d3.forceCollide().radius(5 + 2).iterations(3))
    .force("x", d3.forceX().x(props.width / 2))
    .force("y", d3.forceY().y(props.height / 2))
    .on("tick", ticked);

  const graphContainer = svg
    .append("g")
    .attr("id", "set-relative-graph-container");
  const drag = d3
    .drag<SVGCircleElement, GraphVertex, GraphVertex>()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);

  const links = graphContainer
    .selectAll("line")
    .data(props.graph.edges)
    .enter()
    .append("line")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6);

  const nodes = graphContainer
    .selectAll("circle")
    .data(props.graph.vertices)
    .enter()
    .append("circle")
    .attr("r", 5)
    .style("fill", (d) => getNodeColor(d, props.colors, hoveredVertices))
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
    .on("mousedown", (_, vertex) => props.onNodeClick(vertex))
    .call(drag as any);

  const zoom = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.5, 5])
    .on("zoom", (event) => {
      graphContainer.attr("transform", event.transform);
    });

  svg.call(zoom);

  function updateStyles(nextHoveredVertices: string[]) {
    hoveredVertices = nextHoveredVertices;
    nodes.style("fill", (d) =>
      getNodeColor(d, props.colors, hoveredVertices),
    );
  }

  function ticked() {
    links
      .attr("x1", (d) => (d.source.x === undefined ? 0 : d.source.x))
      .attr("y1", (d) => (d.source.y === undefined ? 0 : d.source.y))
      .attr("x2", (d) => (d.target.x === undefined ? 0 : d.target.x))
      .attr("y2", (d) => (d.target.y === undefined ? 0 : d.target.y));

    nodes
      .attr("cx", (d) => (d.x === undefined ? 0 : d.x))
      .attr("cy", (d) => (d.y === undefined ? 0 : d.y));
  }

  function dragstarted(
    event: d3.D3DragEvent<SVGCircleElement, GraphVertex, GraphVertex>,
  ) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(
    event: d3.D3DragEvent<SVGCircleElement, GraphVertex, GraphVertex>,
  ) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(
    event: d3.D3DragEvent<SVGCircleElement, GraphVertex, GraphVertex>,
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

function getNodeColor(
  node: GraphVertex,
  setcolorAssoc: SetColorAssoc[],
  hoveredVertices: string[],
): string {
  const setnames = setcolorAssoc.map((x) => x.setname);
  const filteredSets = node.sets.filter((set) => setnames.includes(set));

  if (filteredSets.length > 1) {
    if (hoveredVertices === undefined || hoveredVertices.length <= 0) {
      return "#000";
    }

    return isHovered(node.name, hoveredVertices)
      ? "#000"
      : InterpolateColor("#000", 0.4);
  }

  const color =
    setcolorAssoc.filter((x) => x.setname === filteredSets[0])[0]?.color ??
    "black";
  if (hoveredVertices === undefined || hoveredVertices.length <= 0) {
    return color;
  }

  return isHovered(node.name, hoveredVertices)
    ? color
    : InterpolateColor(color, 0.4);
}

function isHovered(name: string, hoveredVertices: string[]): boolean {
  if (hoveredVertices === undefined || hoveredVertices.length <= 0) {
    return false;
  }

  return hoveredVertices.find((e) => e === name) !== undefined;
}

function positionTooltip(
  tooltip: d3.Selection<HTMLElement, unknown, null, undefined>,
  event: MouseEvent,
) {
  tooltip
    .style("top", `${event.clientY + window.scrollY - 30}px`)
    .style("left", `${event.clientX}px`);
}
