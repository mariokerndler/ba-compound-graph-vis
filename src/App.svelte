<script lang="ts">
import CsvFileImport from "./lib/CSVFileImport.svelte";
import Header from "./lib/Header.svelte";
import SetView from "./lib/SetView.svelte";
import LocalTopologyView from "./lib/LocalTopologyView.svelte";

</script>

<main>
  <Header/>
  <div class="main-display">
    <div class="left-column">
      <CsvFileImport/>
      <SetView/>
    </div>
    <div class="right-column">
      <LocalTopologyView width={1000} height={600}/>
    </div>
  </div>
</main>

<style>
.main-display {
  display: flex;
}

.left-column {
  padding: 10px;
}

.right-column {
  padding: 10px
}

</style>
