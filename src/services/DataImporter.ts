import type { DataImport } from "./DataImport";
import { JSONImport } from "./JSONImport";

export async function ImportFile(file: File) {
    if (!file) {
        // TODO: Add proper error handling
        alert("File is empty or null.");
        return;
    }

    const fileContent = await readFileContent(file);

    let dataImport: DataImport;
    switch(file.type) {
        case "application/json":
            dataImport = new JSONImport();
            break;
        default: 
            // TODO: Add proper error handling
            alert("Filetype not valid.");
            return;
    }
    
    const graph = await dataImport.import(fileContent);
    
    if (!graph) {
        // TODO: Add proper error handling
        alert("Graph could not be importet.");
        return;
    }
    
    // TODO: Proceed to store graph
    console.log(graph);
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