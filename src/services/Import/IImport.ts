import type { Graph } from "../../model/graph";

export interface IImport {
  importData(data: Map<string, string>): Promise<Graph>;
}
