import { graphObjectStore } from "../../store/GraphStore";

import { CSVImport } from "./CSVImport";
import { EmailImporter } from "./EmailDataImporter";
import { HPImporter } from "./HarryPotterImporter";
import { LotrImporter } from "./LotrImporter";
import { MealDataImporter } from "./MealDataImporter";
import { StarWarsDataImporter } from "./StarWarsDataImporter";

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
    // TODO: Add proper error handling
    console.error("Data is empty.");
    return;
  }

  const fileContents: Map<string, string> = await readMultipleFileContent(data);

  let imp;
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
    // TODO: Add proper error handling
    console.error("Could not create graph from csv files.");
    return;
  }

  graphObjectStore.update((_) => graph);
}

async function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event: any) => {
      resolve(event.target.result);
    };
    reader.onerror = (event: any) => {
      reject(event.target.error);
    };
    reader.readAsText(file);
  });
}

async function readMultipleFileContent(
  files: File[],
): Promise<Map<string, string>> {
  const fileContents: Map<string, string> = new Map<string, string>();

  async function readNextFile(index: number): Promise<void> {
    if (index >= files.length) {
      return;
    }

    try {
      const name = files[index].name.split(".")[0];
      const content = await readFileContent(files[index]);
      fileContents.set(name, content);
      await readNextFile(index + 1);
    } catch (error) {
      // TODO: Add proper error handling
      console.error(`Error reading file ${files[index].name}: ${error}`);
      // await readNextFile(index + 1);
    }
  }

  await readNextFile(0);

  return fileContents;
}
