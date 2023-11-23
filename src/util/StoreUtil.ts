import type { Graph } from "../model/graph";
import { colorStore, localTopologyViewStore } from "../store/GraphStore";
import { ColorScale } from "./Globals";

export function AddSetToLocalTopologyViewStore(
  set: Graph,
  callback?: () => void,
): string {
  let color = "black";
  localTopologyViewStore.update(($graphs) => {
    if (!$graphs.includes(set)) {
      $graphs.push(set);

      colorStore.update(($colors) => {
        color = ColorScale(set.name);
        return $colors.set(set.name, color);
      });

      if (callback) callback();
    }

    return $graphs;
  });

  return color;
}

export function RemoveSetFromLocalTopologyViewStore(
  set: Graph,
  callback?: () => void,
): string {
  localTopologyViewStore.update(($graphs) => {
    if ($graphs.includes(set)) {
      $graphs = $graphs.filter((item) => item !== set);

      colorStore.update(($colors) => {
        $colors.delete(set.name);
        return $colors;
      });

      if (callback) callback();
    }

    return $graphs;
  });

  return "black";
}

export function LocalTopologyViewStoreHasSet(set: Graph): boolean {
  let ret: boolean = false;
  localTopologyViewStore.subscribe(($graphs) => {
    ret = $graphs.includes(set);
  });

  return ret;
}
