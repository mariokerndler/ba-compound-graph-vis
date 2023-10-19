import { writable } from "svelte/store";
import { defineGraph } from 'd3-graph-controller';
import { type CustomType, type CustomNode, type CustomLink } from '../types/Graph';

export const graphObjectStore = writable(
    defineGraph<CustomType, CustomNode, CustomLink>(
        {
            nodes: [],
            links: [],
        }));
