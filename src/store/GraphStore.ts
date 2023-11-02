import { writable, type Writable } from "svelte/store";
import { defineGraphWithDefaults, type Graph } from "../model/graph";

export const graphObjectStore: Writable<Graph> = writable(
  defineGraphWithDefaults(),
);

export const localTopologyViewStore: Writable<Graph[]> = writable([]);
