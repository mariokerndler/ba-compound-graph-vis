import { defineGraphConfig, Markers, type GraphLink, type GraphNode, type Graph } from 'd3-graph-controller';
import type { Selection } from 'd3-selection'
import * as d3 from 'd3';

export type CustomType = 'primary';

export interface CustomNode extends GraphNode<CustomType> {
    group: number;
}

export interface CustomLink extends GraphLink<CustomType, CustomNode> {}

export interface CustomGraph extends Graph<CustomType, CustomNode, CustomLink> {}

export const CustomConfig = defineGraphConfig<CustomType, CustomNode, CustomLink>({
    marker: Markers.Arrow(0)
});