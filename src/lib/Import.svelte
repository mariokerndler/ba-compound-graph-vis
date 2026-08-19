<script lang="ts">
    import { faGalacticRepublic } from '@fortawesome/free-brands-svg-icons';
    import { faEnvelope, faFileImport, faHatWizard, faRing, faSync } from '@fortawesome/free-solid-svg-icons';
    import Fa from 'svelte-fa';

    import { ImportCSV, ImportType } from "../services/Import/DataImporter";

    let data: File[] = [];

    let loading: boolean = false;

    const FileType = {
      CSV: "text/csv",
      TXT: "text/plain",
      JSON: "application/json",
    } as const;

    type FileType = (typeof FileType)[keyof typeof FileType];

    function onMultipleFileSelected(event: Event) {
        const target = event.target as HTMLInputElement;
        const files = Array.from(target.files ?? []);

        if (files.length === 0) {
            alert('Please select csv or json files.');
            return;
        }

        data = files;
    }

    function isFileType(type: FileType) : boolean {
      return data.at(-1)?.type === type;
    }

    async function importFiles(type: ImportType) {
      if (data.length === 0) {
          console.error('No files selected.');
          return;
      }

      loading = true;
      try {
        await ImportCSV(data, type);
      } finally {
        loading = false;
      }
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

    function importHPData() {
      importFiles(ImportType.HP);
    }

    function importEmailData() {
      importFiles(ImportType.Email);
    }

    </script>

    <div class="import-container">
      <h2>Import</h2>

      <input type="file" accept=".csv,.json,.txt" multiple name="edgeLists" on:change={onMultipleFileSelected}/>

      {#if data.length > 0}
      <div class="import-container-header">
        {#if isFileType(FileType.CSV)}
          <button type="button" on:click={importPathwayData} class="button import-button">
            <Fa icon={faFileImport} size="2x"/>
          </button>
        {/if}

        {#if isFileType(FileType.JSON)}
        <button class="button import-button" on:click={importStarWarsData}>
          <Fa icon={faGalacticRepublic} size="2x"/>
        </button>
        {/if}

        {#if isFileType(FileType.CSV)}
        <button class="button import-button" on:click={importLotrData}>
          <Fa icon={faRing} size="2x"/>
        </button>
        {/if}

        {#if isFileType(FileType.CSV)}
        <button class="button import-button" on:click={importHPData}>
          <Fa icon={faHatWizard} size="2x"/>
        </button>
        {/if}

        {#if isFileType(FileType.TXT)}
        <button class="button import-button" on:click={importEmailData}>
          <Fa icon={faEnvelope} size="2x"/>
        </button>
        {/if}
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
