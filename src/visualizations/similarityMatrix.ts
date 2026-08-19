import * as d3 from "d3";
import type { SimilarityContainer } from "../model/similarity";
import { MapValueToColor } from "../util/Util";

interface SimilarityMatrixCell {
  value: number;
  row: number;
  col: number;
  labels: [string, string];
}

interface SimilarityMatrixRendererProps {
  data: SimilarityContainer;
  width: number;
  height: number;
  strokeWidth?: number;
  colors?: Map<string, string>;
  filterZeroValues?: boolean;
  drawGuides?: boolean;
  hoverMinZoom?: number;
  tooltipText: (cell: SimilarityMatrixCell) => string;
  onCellMouseEnter: (cell: SimilarityMatrixCell) => void;
  onCellMouseExit: () => void;
  onConnectionPositionsChange: (positions: Map<string, number>) => void;
}

export interface SimilarityMatrixRenderer {
  render: (props: SimilarityMatrixRendererProps) => void;
  destroy: () => void;
}

export function createSimilarityMatrixRenderer(
  svgElement: SVGSVGElement,
  tooltipElement: HTMLElement,
): SimilarityMatrixRenderer {
  const svgRoot = d3.select(svgElement);
  const tooltip = d3.select(tooltipElement);
  const matrixGroup = svgRoot.append("g").attr("id", "similarity-matrix-container");

  let props: SimilarityMatrixRendererProps;
  let zoomLevel = 1;
  let connectionPositions = new Map<string, number>();
  let originalConnectionPositions = new Map<string, number>();

  function render(nextProps: SimilarityMatrixRendererProps) {
    props = nextProps;
    zoomLevel = 1;
    svgRoot
      .attr("width", props.width)
      .attr("height", props.height)
      .attr("viewBox", [0, 0, props.width, props.height])
      .on(".zoom", null);
    matrixGroup.attr("transform", d3.zoomIdentity as any);
    matrixGroup.selectAll("*").remove();

    if (!props.data) return;

    const cells = getCells(props.data).filter(
      (cell) => !props.filterZeroValues || cell.value > 0,
    );
    const matrixLength = props.data.matrix.length;

    matrixGroup
      .selectAll("rect")
      .data(cells)
      .enter()
      .append("rect")
      .attr("x", (cell) => getRectPosition(cell, matrixLength, true))
      .attr("y", (cell) => getRectPosition(cell, matrixLength, false))
      .attr("width", (cell) => getRectSize(cell, matrixLength, true))
      .attr("height", (cell) => getRectSize(cell, matrixLength, false))
      .attr("fill", (cell) => MapValueToColor(cell.value))
      .attr("stroke", (cell) => (isSelected(cell) ? "#2c3e50" : "none"))
      .attr("stroke-width", props.strokeWidth ?? 0)
      .attr("shape-rendering", "crispEdges")
      .on("mouseover", (_, cell) => onMouseOver(cell))
      .on("mousemove", (event) => positionTooltip(event))
      .on("mouseout", onMouseOut);

    connectionPositions = getConnectionPositions(props.data, matrixLength, props.height);
    originalConnectionPositions = new Map(connectionPositions);
    if (connectionPositions.size > 0) {
      props.onConnectionPositionsChange(new Map(connectionPositions));
    }

    if (props.drawGuides) drawColorGuides(cells, matrixLength);
    if (props.hoverMinZoom !== undefined) initializeZoom();
  }

  function initializeZoom() {
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, Math.min(props.width / 10, props.height / 10)])
      .translateExtent([
        [0, 0],
        [props.width, props.height],
      ])
      .on("zoom", zoomed);

    svgRoot.call(zoom);
  }

  function zoomed(event: d3.D3ZoomEvent<SVGSVGElement, unknown>) {
    if (event.transform.k > 1) {
      matrixGroup.attr("transform", event.transform as any);
      zoomLevel = event.transform.k;

      connectionPositions = new Map(
        Array.from(originalConnectionPositions, ([key, value]) => [
          key,
          value * event.transform.k + event.transform.y,
        ]),
      );
    } else {
      matrixGroup.attr("transform", d3.zoomIdentity as any);
      zoomLevel = d3.zoomIdentity.k;
      connectionPositions = new Map(originalConnectionPositions);
    }

    props.onConnectionPositionsChange(new Map(connectionPositions));
  }

  function getRectSize(
    cell: SimilarityMatrixCell,
    n: number,
    isWidth: boolean,
  ): number {
    const size = (isWidth ? props.width : props.height) / n;
    return isSelected(cell) ? size - 2 * (props.strokeWidth ?? 0) : size;
  }

  function getRectPosition(
    cell: SimilarityMatrixCell,
    n: number,
    isWidth: boolean,
  ): number {
    const position = (isWidth ? cell.col * props.width : cell.row * props.height) / n;
    return isSelected(cell) ? position + (props.strokeWidth ?? 0) : position;
  }

  function isSelected(cell: SimilarityMatrixCell): boolean {
    if (!props.colors || props.colors.size <= 0) return false;

    const rowColor = props.colors.get(cell.labels[0]);
    const colColor = props.colors.get(cell.labels[1]);

    return rowColor !== undefined && colColor !== undefined && rowColor !== colColor;
  }

  function drawColorGuides(cells: SimilarityMatrixCell[], matrixLength: number) {
    if (!props.colors || props.colors.size <= 0) return;

    const guideContainer = matrixGroup.append("g").attr("id", "guide-container");
    const selectedCells = cells.filter((cell) => isSelected(cell));

    guideContainer
      .selectAll("line.row-guide")
      .data(selectedCells)
      .enter()
      .append("line")
      .attr("class", "row-guide")
      .attr("x1", (cell) => getGuideTargetPosition(cell, matrixLength, true))
      .attr("y1", 0)
      .attr("x2", (cell) => getGuideTargetPosition(cell, matrixLength, true))
      .attr("y2", (cell) => getGuideTargetPosition(cell, matrixLength, false))
      .style("stroke", (cell) => props.colors?.get(cell.labels[1]) || "black")
      .style("stroke-width", 3);

    guideContainer
      .selectAll("line.col-guide")
      .data(selectedCells)
      .enter()
      .append("line")
      .attr("class", "col-guide")
      .attr("x1", 0)
      .attr("y1", (cell) => getGuideTargetPosition(cell, matrixLength, false))
      .attr("x2", (cell) => getGuideTargetPosition(cell, matrixLength, true))
      .attr("y2", (cell) => getGuideTargetPosition(cell, matrixLength, false))
      .style("stroke", (cell) => props.colors?.get(cell.labels[0]) || "black")
      .style("stroke-width", 3);

    guideContainer.raise();
  }

  function getGuideTargetPosition(
    cell: SimilarityMatrixCell,
    n: number,
    isWidth: boolean,
  ): number {
    const length = (isWidth ? props.width : props.height) / n;
    const position = isWidth ? cell.col * length : cell.row * length;
    return position + length / 2;
  }

  function onMouseOver(cell: SimilarityMatrixCell) {
    if (props.hoverMinZoom !== undefined && zoomLevel <= props.hoverMinZoom) {
      tooltip.style("visibility", "hidden");
      return;
    }

    tooltip.style("visibility", "visible").text(props.tooltipText(cell));
    props.onCellMouseEnter(cell);
  }

  function onMouseOut() {
    tooltip.style("visibility", "hidden");
    props.onCellMouseExit();
  }

  function positionTooltip(event: MouseEvent) {
    tooltip
      .style("top", `${event.clientY + window.scrollY - 30}px`)
      .style("left", `${event.clientX}px`);
  }

  return {
    render,
    destroy: () => {
      svgRoot.on(".zoom", null);
      svgRoot.selectAll("*").remove();
    },
  };
}

function getCells(data: SimilarityContainer): SimilarityMatrixCell[] {
  return data.matrix.flatMap((row, rowIndex) =>
    row.map((value, colIndex) => ({
      value,
      row: rowIndex,
      col: colIndex,
      labels: [data.descriptor[rowIndex], data.descriptor[colIndex]],
    })),
  );
}

function getConnectionPositions(
  data: SimilarityContainer,
  matrixLength: number,
  height: number,
): Map<string, number> {
  const cellHeight = matrixLength === 0 ? 0 : height / matrixLength;

  return new Map(
    data.descriptor.map((descriptor, index) => [
      descriptor,
      index * cellHeight + cellHeight / 2,
    ]),
  );
}
