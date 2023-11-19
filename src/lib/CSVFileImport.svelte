<script lang="ts">
import { faFileImport, faSync } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';

import { ImportCSV } from "../services/Import/DataImporter";
  
let edgeLists: File[] | null = null;

let loading: boolean = false;
  
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
  
  loading = true;
  await ImportCSV(edgeLists); 
  loading = false;
}

</script>
  
<div class="import-container">
  <h2>Import</h2>
  
  <input type="file" accept=".csv" multiple name="edgeLists" on:change={onMultipleFileSelected}/>

  {#if edgeLists && edgeLists.length > 0}
    <button type="button" on:click={importFiles} class="import-button">
      <Fa icon={faFileImport} /> Import
    </button>
  {/if}
  
  {#if loading}
  <div class=loading>
    <Fa icon={faSync} spin size="3x"/>
  </div>
  {/if}
</div>

<style>
  .import-container {
    background: #fff;
    color: var(--darkblue);
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  input[type="file"] {
    font-size: 1rem;
  }

  input[type="file"]::file-selector-button {
    border-radius: 4px;
    padding: 5px 10px;
    cursor: pointer;
    background-color: white;
    color: var(--darkblue);
    border: none;
    margin-right: 16px;
    border: 1px solid var(--darkblue);
    height: 30px;
  }
  
  .import-button:hover, input[type="file"]::file-selector-button:hover {
    background-color: #f3f4f6;
  }

  .import-button:active, input[type="file"]::file-selector-button:active {
    background-color: #e5e7eb;
  }
  
  .import-button {
    padding: 5px 10px;
    text-decoration: none;
    border: none;
    background: white;
    font-size: 1em;
    color: var(--darkblue);
    cursor: pointer;
    border-radius: 4px;
    border: 1px solid var(--darkblue);
    height: 30px;
  }

  .loading {
    margin: 10px auto;
  }

</style>