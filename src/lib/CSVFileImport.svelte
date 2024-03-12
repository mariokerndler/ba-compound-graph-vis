<script lang="ts">
import { faGalacticRepublic } from '@fortawesome/free-brands-svg-icons';
import { faFileImport, faRing, faSync } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';

import { ImportCSV, ImportType } from "../services/Import/DataImporter";
  
let data: File[] | null = null;

let loading: boolean = false;

function onMultipleFileSelected(event: Event) {
    const target = event.target as unknown as { files: File[] };
    const files = target?.files;
    
    if (!files) {
        // TODO: Add proper error handling
        alert('Please select csv or json files.');
        return;
    }
    
    data = files;
}

function isCSV() : boolean {
  let ret = false;
  if (data && data.length > 0) {
    for(let i = 0; i < data.length; i++) {
      ret = data[i].type === "text/csv";
    }
  }
  
  return ret;
}

async function importFiles(type: ImportType) {
  if (!data) {
      // TODO: Add proper error handling
      console.error('No files selected.');
      return;
  }
  
  loading = true;
  await ImportCSV(data, type); 
  loading = false;
}

function importPathwayData() {
  importFiles(ImportType.Pathway);
}

function importStarWarsData() {
  importFiles(ImportType.StarWars);
}

function importLotrData() {
  importFiles(ImportType.Lotr);
}

</script>
  
<div class="import-container">
  <h2>Import</h2>

  <input type="file" accept=".csv,.json" multiple name="edgeLists" on:change={onMultipleFileSelected}/>

  {#if data && data.length > 0}
  <div class="import-container-header">
    {#if isCSV()}
      <button type="button" on:click={importPathwayData} class="button import-button">
        <Fa icon={faFileImport} size="2x"/>
      </button>
    {/if}
    
    <button class="button import-button" on:click={importStarWarsData}>
      <Fa icon={faGalacticRepublic} size="2x"/>
    </button>
    
    <button class="button import-button" on:click={importLotrData}>
      <Fa icon={faRing} size="2x"/>
    </button>
  </div>
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
  
  input[type="file"]::file-selector-button:hover {
    background-color: #f3f4f6;
  }

  input[type="file"]::file-selector-button:active {
    background-color: #e5e7eb;
  }

  .loading {
    margin: 10px auto;
  }

  .import-container-header {
    display: flex;
    justify-content: space-evenly;
    gap: 5px;
  }
  
  .import-button { 
    height: auto;
    width: 100%;
  }

</style>