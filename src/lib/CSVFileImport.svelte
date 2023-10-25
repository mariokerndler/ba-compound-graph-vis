<script lang="ts">
import { ImportCSV } from "../services/Import/DataImporter";
  
let edgeLists: File[] | null = null;
  
function onMultipleFileSelected(event: Event) {
    const target = event.target as unknown as { files: File[] };
    const files = target?.files;
    
    if (!files) {
        // TODO: Add proper error handling
        alert('Please select csv files.');
        return;
    }
    
    edgeLists = files;
}

async function importFiles() {
  if (!edgeLists) {
      // TODO: Add proper error handling
      console.error('No files selected.');
      return;
  }

  await ImportCSV(edgeLists); 
}

</script>
  
<div>
  <form>
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