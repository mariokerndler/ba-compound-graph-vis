<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { Unsubscriber } from "svelte/store";
  import type { GraphVertex } from "../../model/graph";
  import { egonetSelectedVertexStore, vertexHoverStore } from "../../store/GraphStore";

export let vertex: GraphVertex;

let isHovered: boolean = false;
let vertexHoverUnsub: Unsubscriber;

onMount(() => {
  vertexHoverUnsub = vertexHoverStore.subscribe($vertices => {
      const t = $vertices.find(e => e === vertex.name);
      
      isHovered =  t !== undefined;
  });
})

onDestroy(() => {
  vertexHoverUnsub();
})

function mouseOver() {
  vertexHoverStore.set([vertex.name]);
}

function mouseOut() {
  vertexHoverStore.set([]);
}

function mouseDown() {
  egonetSelectedVertexStore.set(vertex);
}

</script>

<div class="vertex-view-item-container {isHovered ? "hovered" : ""}" on:mouseenter={mouseOver} on:mouseleave={mouseOut} on:mousedown={mouseDown} role="menuitem" tabindex="-1">
  <b>ID:</b> {vertex.name} 
</div>

<style>
.vertex-view-item-container {
  width: auto;
  cursor: pointer;
}

.hovered, .vertex-view-item-container:hover {
  background: #f3f4f6;
}
</style>