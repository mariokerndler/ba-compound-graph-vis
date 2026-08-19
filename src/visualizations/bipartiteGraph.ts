import * as d3 from "d3";
import type { Graph } from "../model/graph";
import type { SimilarityConnection } from "../model/similarity";
import { ApplyOpacityToHexColor } from "../util/Util";

interface BipartiteGraphRendererProps {
  graph: Graph;
  colors: Map<string, string>;
  hoveredVertices: string[];
  setPositions: Map<string, number>;
  vertexPositions: Map<string, number>;
  width: number;
  height: number;
}

export interface BipartiteGraphRenderer {
  render: (props: BipartiteGraphRendererProps) => void;
  destroy: () => void;
}

export function createBipartiteGraphRenderer(
  svgElement: SVGSVGElement,
): BipartiteGraphRenderer {
  const svg = d3.select(svgElement);

  function render(props: BipartiteGraphRendererProps) {
    svg
      .attr("width", props.width)
      .attr("height", props.height)
      .attr("viewBox", [0, 0, props.width, props.height]);

    svg.selectAll("*").remove();

    if (!props.graph || props.colors.size <= 0) return;

    const connections = prepareConnections(props);
    const pathContainer = svg.append("g");
    const labeledSets = new Set<string>();

    connections.forEach((connection) => {
      pathContainer
        .append("path")
        .style("stroke", connection.color)
        .style("fill", "none")
        .attr("d", drawCurve(connection));

      if (labeledSets.has(connection.name)) return;

      pathContainer
        .append("text")
        .text(connection.name)
        .attr("x", connection.x0 + 10)
        .attr("y", connection.y0 - 10)
        .attr("text-anchor", "start")
        .style("fill", connection.color);

      labeledSets.add(connection.name);
    });
  }

  return {
    render,
    destroy: () => svg.selectAll("*").remove(),
  };
}

function drawCurve(connection: SimilarityConnection): string {
  const path = d3.path();
  path.moveTo(connection.x0, connection.y0);
  path.bezierCurveTo(
    connection.x1 / 2,
    connection.y0,
    connection.x1 / 2,
    connection.y1,
    connection.x1,
    connection.y1,
  );
  path.lineTo(connection.x1, connection.y1);
  return path.toString();
}

function prepareConnections(
  props: BipartiteGraphRendererProps,
): SimilarityConnection[] {
  const connections: SimilarityConnection[] = [];

  props.colors.forEach((color, setName) => {
    const set = props.graph.sets.find((set) => set.name === setName);
    const setY = props.setPositions.get(setName);

    if (!set || setY === undefined) return;

    set.vertices.forEach((vertex) => {
      const vertexY = props.vertexPositions.get(vertex.name);
      if (vertexY === undefined) return;

      connections.push({
        x0: 0,
        y0: setY,
        x1: props.width,
        y1: vertexY,
        color: getConnectionColor(color, vertex.name, props.hoveredVertices),
        name: set.name,
      });
    });
  });

  return connections;
}

function getConnectionColor(
  color: string,
  vertexName: string,
  hoveredVertices: string[],
): string {
  if (!hoveredVertices || hoveredVertices.length <= 0) return color;
  return hoveredVertices.includes(vertexName)
    ? color
    : ApplyOpacityToHexColor(color, 0.2);
}
