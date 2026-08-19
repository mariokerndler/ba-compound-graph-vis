import * as d3 from "d3";
import {
  HypervertexType,
  type Hyperedge,
  type Hypergraph,
  type Hypervertex,
} from "../model/hypergraph";
import { GetColor, GetEdgeOpacity, GetSize, GetStroke } from "../util/Util";

interface GlobalCircleRendererProps {
  hypergraph: Hypergraph;
  colors: Map<string, string>;
  hover: string[];
  width: number;
  height: number;
  onNodeClick: (vertex: Hypervertex) => void;
  onNodeMouseEnter: (name: string, isVertex?: boolean) => void;
  onNodeMouseExit: (isVertex?: boolean) => void;
}

export function renderGlobalCircle(
  svgElement: SVGSVGElement,
  tooltipElement: HTMLElement,
  props: GlobalCircleRendererProps,
): () => void {
  const { hypergraph, width, height } = props;
  if (hypergraph === undefined) return () => {};

  const svg = d3
    .select(svgElement)
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height]);
  const tooltip = d3.select(tooltipElement);

  svg.selectAll("*").remove();

  const padding = 10;
  const svgSize = Math.min(width, height);
  const circleRadius = svgSize / 2 - padding * 2;
  const setVertices = hypergraph.vertices.filter(
    (v) => v.type === HypervertexType.SET,
  );
  const setScale = d3
    .scaleLinear()
    .domain([0, setVertices.length])
    .range([0, 2 * Math.PI]);
  const graphContainer = svg.append("g").attr("id", "graph-circle-container");

  const setNodes = graphContainer
    .selectAll(".set-node")
    .data(setVertices)
    .enter()
    .append("circle")
    .attr("class", "set-node")
    .attr("cx", (d, i) => {
      d.x = width / 2 + circleRadius * Math.cos(setScale(i));
      return d.x;
    })
    .attr("cy", (d, i) => {
      d.y = height / 2 + circleRadius * Math.sin(setScale(i));
      return d.y;
    })
    .attr("r", (d) => GetSize(d))
    .attr("fill", (d) => GetColor(hypergraph, props.colors, d, props.hover))
    .style("stroke", (d) => GetStroke(props.hover, d))
    .style("stroke-width", 2)
    .on("mouseover", (event) => {
      const name = event.target.__data__.name;
      positionTooltip(tooltip, event);
      tooltip.style("visibility", "visible").text(name);
      props.onNodeMouseEnter(name);
    })
    .on("mouseout", () => {
      tooltip.style("visibility", "hidden");
      props.onNodeMouseExit();
    })
    .on("mousedown", (_, vertex) => props.onNodeClick(vertex));

  calculatePositionForIntersectNodes(
    hypergraph,
    width / 2,
    height / 2,
    circleRadius / 3,
  );
  const intersectVertices = hypergraph.vertices.filter(
    (v) => v.type === HypervertexType.VERTEX,
  );

  const intersectNodes = graphContainer
    .selectAll(".vertex-node")
    .data(intersectVertices)
    .enter()
    .append("rect")
    .attr("class", "vertex-node")
    .attr("x", (d) => (d.x || 0) - GetSize(d) / 2)
    .attr("y", (d) => (d.y || 0) - GetSize(d) / 2)
    .attr("width", (d) => GetSize(d))
    .attr("height", (d) => GetSize(d))
    .attr("fill", (d) => GetColor(hypergraph, props.colors, d, props.hover))
    .on("mouseover", (event) => {
      const name = event.target.__data__.name;
      positionTooltip(tooltip, event);
      tooltip.style("visibility", "visible").text(name);
      props.onNodeMouseEnter(name, true);
    })
    .on("mouseout", () => {
      tooltip.style("visibility", "hidden");
      props.onNodeMouseExit(true);
    });

  graphContainer
    .selectAll("path")
    .data(hypergraph.edges)
    .enter()
    .append("path")
    .attr("d", (d) => drawCurve(d, width, height))
    .attr("fill", "none")
    .attr("stroke", "#999")
    .attr("stroke-opacity", (d) => GetEdgeOpacity(props.hover, d));

  graphContainer
    .append("circle")
    .attr("r", circleRadius)
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-opacity", 0.2);

  graphContainer
    .append("circle")
    .attr("r", circleRadius / 3)
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-opacity", 0.2);

  setNodes.raise();
  intersectNodes.raise();

  return () => {
    svg.selectAll("*").remove();
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

function drawCurve(d: Hyperedge, width: number, height: number): string {
  const x1 = d.source.x === undefined ? 0 : d.source.x;
  const y1 = d.source.y === undefined ? 0 : d.source.y;
  const x2 = d.target.x === undefined ? 0 : d.target.x;
  const y2 = d.target.y === undefined ? 0 : d.target.y;

  const center = [width / 2, height / 2];
  const midpoint = [(x1 + x2) / 2, (y1 + y2) / 2];
  const centerMidpoint = [
    (midpoint[0] + center[0]) / 2,
    (midpoint[1] + center[1]) / 2,
  ];

  const path: d3.Path = d3.path();
  path.moveTo(x1, y1);
  if (
    d.target.type === HypervertexType.SET &&
    d.source.type === HypervertexType.SET
  ) {
    path.quadraticCurveTo(centerMidpoint[0], centerMidpoint[1], x2, y2);
  } else {
    path.lineTo(x2, y2);
  }

  return path.toString();
}

function calculatePositionForIntersectNodes(
  g: Hypergraph,
  cx: number,
  cy: number,
  radius: number,
): Hypergraph {
  const intersectNodes = g.vertices.filter(
    (e) => e.type === HypervertexType.VERTEX,
  );

  intersectNodes.forEach((sourceNode) => {
    const edges = g.edges.filter((e) => e.source === sourceNode);
    const targetNodes = edges.map((e) => e.target);
    const targetNodeX = targetNodes.map((e) => e.x || 0);
    const targetNodeY = targetNodes.map((e) => e.y || 0);
    const [sourceNodeX, sourceNodeY] = calculateInnerPoint(
      targetNodeX,
      targetNodeY,
    );
    const d = Math.sqrt(
      Math.pow(sourceNodeX - cx, 2) + Math.pow(sourceNodeY - cy, 2),
    );
    const constrainedX = cx + ((sourceNodeX - cx) / (d === 0 ? 1 : d)) * radius;
    const constrainedY = cy + ((sourceNodeY - cy) / (d === 0 ? 1 : d)) * radius;
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
