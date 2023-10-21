import { writable, type Writable } from "svelte/store";
import { defineGraphWithDefaults, type Graph } from "../model/graph/graph";

export const graphObjectStore: Writable<Graph> = writable(defineGraphWithDefaults());
