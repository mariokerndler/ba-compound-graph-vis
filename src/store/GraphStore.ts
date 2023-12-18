import { writable, type Writable } from "svelte/store";
import { defineGraphWithDefaults, type Graph } from "../model/graph";

export const graphObjectStore: Writable<Graph> = writable(defineGraphWithDefaults());

export const localTopologyViewStore: Writable<Graph[]> = writable([]);

export const colorStore: Writable<Map<string, string>> = writable(new Map<string, string>());

export const hoverStore: Writable<string[]> = writable([]);

export const vertexHoverStore: Writable<string[]> = writable([]);
