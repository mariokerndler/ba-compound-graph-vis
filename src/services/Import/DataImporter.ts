import { graphObjectStore } from "../../store/GraphStore";

import { CSVImport } from "./CSVImport";
import { EmailImporter } from "./EmailDataImporter";
import { HPImporter } from "./HarryPotterImporter";
import { LotrImporter } from "./LotrImporter";
import { MealDataImporter } from "./MealDataImporter";
import { StarWarsDataImporter } from "./StarWarsDataImporter";
import type { IImport } from "./IImport";

export enum ImportType {
  StarWars,
  Meals,
  Pathway,
  Lotr,
  HP,
  Email,
}

export async function ImportCSV(data: File[], type: ImportType) {
  if (!data) {
    console.error("Data is empty.");
    return;
  }

  const fileContents: Map<string, string> = await readMultipleFileContent(data);

  let imp: IImport;
  switch (type) {
    case ImportType.Meals:
      imp = new MealDataImporter();
      break;

    case ImportType.Pathway:
      imp = new CSVImport();
      break;

    case ImportType.StarWars:
      imp = new StarWarsDataImporter();
      break;

    case ImportType.Lotr:
      imp = new LotrImporter();
      break;

    case ImportType.HP:
      imp = new HPImporter();
      break;

    case ImportType.Email:
      imp = new EmailImporter();
      break;
  }

  const graph = await imp.importData(fileContents);

  if (!graph) {
    console.error("Could not create graph from csv files.");
    return;
  }

  graphObjectStore.update((_) => graph);
}

async function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(String(reader.result ?? ""));
    };
    reader.onerror = () => {
      reject(reader.error ?? new Error(`Could not read ${file.name}`));
    };
    reader.readAsText(file);
  });
}

async function readMultipleFileContent(
  files: File[],
): Promise<Map<string, string>> {
  const fileContents: Map<string, string> = new Map<string, string>();

  for (const file of files) {
    try {
      const name = file.name.split(".")[0];
      const content = await readFileContent(file);
      fileContents.set(name, content);
    } catch (error) {
      console.error(`Error reading file ${file.name}: ${error}`);
      break;
    }
  }

  return fileContents;
}
