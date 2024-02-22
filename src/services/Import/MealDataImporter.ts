import type { Graph } from "../../model/graph";
import type { IImport } from "./IImport";

export class MealDataImporter implements IImport {
  importData(data: Map<string, string>): Promise<Graph> {
    throw new Error("Method not implemented.");
  }
}
