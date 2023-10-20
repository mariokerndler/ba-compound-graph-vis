import { graphObjectStore } from "../store/GraphStore";
import type { SingleFileImport } from "./Interfaces/SingleFileImport";
import { JSONImport } from "./Import/JSONImport";
import { CSVImport } from "./Import/CSVImport";

export async function ImportFile(file: File) {
    if (!file) {
        // TODO: Add proper error handling
        console.error("File is empty or null.");
        return;
    }

    const fileContent = await readFileContent(file);
  
    let dataImport: SingleFileImport;
    switch(file.type) {
        case "application/json":
            dataImport = new JSONImport();
            break;
        default: 
            // TODO: Add proper error handling
            console.error("Filetype not valid.");
            return;
    }
    
    const graph = await dataImport.import(fileContent);
    
    if (!graph) {
        // TODO: Add proper error handling
        console.error("Graph could not be importet.");
        return;
    }
    
    graphObjectStore.update((_) => {
      return graph;
    });
}

export async function ImportCSV(matrix: File, edgeList: File[]) {
    if (!matrix || !edgeList) {
      // TODO: Add proper error handling
      console.error("Matrix or edge list is empte.");
      return;
    }
    
    const matrixContent: string = await readFileContent(matrix);
    const edgeListContent: string[] = await readMultipleFileContent(edgeList);
    
    const csvImport: CSVImport = new CSVImport();
    
    const graph = await csvImport.import(matrixContent, edgeListContent);
    
    if (!graph) {
      // TODO: Add proper error handling
      console.error("Could not create graph from csv files.");
      return;
    }
    
    graphObjectStore.update(_ => graph);
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

async function readMultipleFileContent(files: File[]): Promise<string[]> {
  const fileContents: string[] = [];
  
  async function readNextFile(index: number): Promise<void> {
    if (index >= files.length) {
      return;
    }
    
    try {
      const content = await readFileContent(files[index]);
      fileContents.push(content);
      await readNextFile(index + 1);
    } catch(error) {
      // TODO: Add proper error handling
      console.error(`Error reading file ${files[index].name}: ${error}`);
      // await readNextFile(index + 1);
    }
  }
  
  await readNextFile(0);
  
  return fileContents;
}