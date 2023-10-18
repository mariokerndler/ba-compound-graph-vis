<script lang="ts">
  import { ImportFile } from "../services/DataImporter";


let selectedFile: File | null;

function onFileSelected(event: Event) {
    const target = event.target as unknown as { files: File[] };
    const file: File = target?.files[0];
    
    if (!file) {
        // TODO: Add proper error handling
        alert('Please select a file.');
        return;
    }
    
    selectedFile = file;
}

async function importFiles() {
  if (!selectedFile) {
    // TODO: Add proper error handling
    alert('Please select a file.');
    return;
  }

  // Send the JSON content to your importer function.
  await ImportFile(selectedFile);
}
  
</script>

<div>
    <form>
        <fieldset>
            <label for="csvFile">Upload a JSON-File</label>
            <input 
                type="file" 
                accept=".json" 
                name="csvFile" 
                on:change={onFileSelected}
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