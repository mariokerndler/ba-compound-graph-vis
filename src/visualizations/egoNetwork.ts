import * as d3 from "d3";
import type { EgoNetNode } from "../model/egonet";

interface EgoNetworkRendererProps {
  data: EgoNetNode;
  depth: number;
  enableDistance: boolean;
  width: number;
  nodeSize: number;
  onNodeMouseEnter: (name: string, distanceToParent: number) => void;
  onNodeMouseExit: () => void;
}

export function renderEgoNetwork(
  svgElement: SVGSVGElement,
  tooltipElement: HTMLElement,
  props: EgoNetworkRendererProps,
): () => void {
  const svg = d3.select(svgElement);
  const tooltip = d3.select(tooltipElement);

  svg.selectAll("*").remove();

  const maxDepth = getMaxDepth(props.data) - 1;
  const displayDepth = props.depth >= maxDepth ? maxDepth : props.depth;
  const additionalLength =
    (props.width - 2 * props.nodeSize) / displayDepth;

  const root = d3.hierarchy(props.data).eachBefore((n, index) => {
    n.data.index = index;
    if (n.depth === 0) {
      n.data.x = 0;
      return;
    }

    const parent = n.parent;
    const lastX = parent?.data.x;
    if (lastX !== undefined) {
      const x1 = lastX;
      const x2 = lastX + additionalLength;
      n.data.x = interpolate(x1, x2, 1 - n.data.distanceToParent);
    }
  });
  const nodes = root.descendants();
  const height = (nodes.length + 1) * props.nodeSize;

  svg
    .attr("width", props.width)
    .attr("height", height)
    .attr("viewBox", [
      -props.nodeSize / 2,
      (-props.nodeSize * 3) / 2,
      props.width,
      height,
    ])
    .attr("style", "max-width: 100%; height: auto; font: 15px sans-serif;");

  svg
    .append("g")
    .attr("fill", "none")
    .attr("stroke", "#999")
    .selectAll("path")
    .data(root.links())
    .join("path")
    .attr("d", (d) => {
      return `
        M${props.enableDistance ? d.source.data.x || 0 : d.source.depth * props.nodeSize},${(d.source.data.index || 0) * props.nodeSize}
        V${(d.target.data.index || 0) * props.nodeSize}
        h${props.enableDistance ? interpolate(0, additionalLength, 1 - d.target.data.distanceToParent) : props.nodeSize}
      `;
    });

  const node = svg
    .append("g")
    .selectAll("g")
    .data(nodes)
    .join("g")
    .attr(
      "transform",
      (d) => `translate(0,${(d.data.index || 0) * props.nodeSize})`,
    )
    .on("mouseover", (_, node) => {
      tooltip
        .style("visibility", "visible")
        .text(`Distance to parent: ${node.data.distanceToParent}`);
      props.onNodeMouseEnter(node.data.name, node.data.distanceToParent);
    })
    .on("mouseout", () => {
      tooltip.style("visibility", "hidden");
      props.onNodeMouseExit();
    })
    .on("mousemove", (event) => positionTooltip(tooltip, event));

  node
    .append("circle")
    .attr("cx", (d) => getNodeX(d, props.enableDistance, props.nodeSize))
    .attr("fill", (d) => (d.children ? "#555" : "#999"))
    .attr("r", 5);

  node
    .append("text")
    .attr("dy", "0.31em")
    .attr("x", (d) => getNodeX(d, props.enableDistance, props.nodeSize) + 6)
    .text((d) => d.data.name)
    .clone(true)
    .lower()
    .attr("stroke", "white");

  return () => {
    svg.selectAll("*").remove();
  };
}

function getNodeX(
  d: d3.HierarchyNode<EgoNetNode>,
  enableDistance: boolean,
  nodeSize: number,
): number {
  return enableDistance ? d.data.x || 0 : d.depth * nodeSize;
}

function getMaxDepth(node: EgoNetNode | null): number {
  if (node === null) return 0;
  if (node.children.length === 0) return 1;

  return Math.max(...node.children.map(getMaxDepth)) + 1;
}

function interpolate(x1: number, x2: number, scale: number): number {
  if (scale < 0 || scale > 1) {
    throw new Error("Scale must be between 0 and 1");
  }

  return x1 + (x2 - x1) * scale;
}

function positionTooltip(
  tooltip: d3.Selection<HTMLElement, unknown, null, undefined>,
  event: MouseEvent,
) {
  tooltip
    .style("top", `${event.clientY + window.scrollY - 30}px`)
    .style("left", `${event.clientX}px`);
}
