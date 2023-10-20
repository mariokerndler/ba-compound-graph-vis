<script lang="ts">
import { ImportCSV, ImportFile } from "../services/DataImporter";
  import { CSVImport } from "../services/Import/CSVImport";
  
let singleFile: File | null = null;
let multipleFiles: File[] | null = null;
  
function onSingleFileSelected(event: Event) {
    const target = event.target as unknown as { files: File[] };
    const file = target?.files[0];
    
    if (!file) {
        // TODO: Add proper error handling
        alert('Please select a csv file.');
        return;
    }
    
    singleFile = file;
}

function onMultipleFileSelected(event: Event) {
    const target = event.target as unknown as { files: File[] };
    const files = target?.files;
    
    if (!files) {
        // TODO: Add proper error handling
        alert('Please select csv files.');
        return;
    }
    
    multipleFiles = files;
}

async function importFiles() {
  if (!singleFile || !multipleFiles) {
      // TODO: Add proper error handling
      console.error('No files selected.');
      return;
  }

  await ImportCSV(singleFile, multipleFiles); 
}

</script>
  
<div>
  <form>
      <fieldset>
          <label for="singleFile">Upload a incidence matrix file</label>
          <input 
              type="file" 
              accept=".csv" 
              name="singleFile" 
              on:change={onSingleFileSelected}
          />
      </fieldset>
      
      <fieldset>
        <label for="multipleFile">Upload edge list files</label>
        <input 
            type="file" 
            accept=".csv" 
            multiple
            name="multipleFile" 
            on:change={onMultipleFileSelected}
        />
    </fieldset>
      
      <fieldset>
          <button type="button" on:click={importFiles}>Import</button>
      </fieldset>
  </form>
</div>
  
<style>
  div {
    display: flex;
  }
  
  fieldset {
    width: 100%;
    border: none;
  }
</style>