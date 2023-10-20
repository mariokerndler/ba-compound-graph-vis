<script lang="ts">
import CsvFileImport from "./lib/CSVFileImport.svelte";
import GraphTest from "./lib/GraphTest.svelte";
</script>

<main>
  <h1>Svelte + D3.js</h1>
  <CsvFileImport/>
  <GraphTest/>
</main>

<style>
  main {
    height: 100vh;
  }
</style>
