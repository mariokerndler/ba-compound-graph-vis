import { graphObjectStore } from "../../store/GraphStore";

import { CSVImport } from "./CSVImport";

export async function ImportCSV(matrix: File, edgeList: File[]) {
    if (!matrix || !edgeList) {
      // TODO: Add proper error handling
      console.error("Matrix or edge list is empty.");
      return;
    }
    
    const matrixContent: string = await readFileContent(matrix);
    const edgeListContent: Map<string, string> = await readMultipleFileContent(edgeList);
    
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

async function readMultipleFileContent(files: File[]): Promise<Map<string, string>> {
  const fileContents: Map<string, string> = new Map<string,string>();
  
  async function readNextFile(index: number): Promise<void> {
    if (index >= files.length) {
      return;
    }
    
    try {
      const name = files[index].name.split('.')[0];
      const content = await readFileContent(files[index]);
      fileContents.set(name, content);
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