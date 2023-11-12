<script lang="ts">
import CsvFileImport from "./lib/CSVFileImport.svelte";
import GlobalTopologyView from "./lib/GlobalTopologyView.svelte";
import Header from "./lib/Header.svelte";
import SetRelativeTopologyView from "./lib/SetRelativeTopologyView.svelte";
import SetSimilarityView from "./lib/SetSimilarityView.svelte";
import SetView from "./lib/SetView.svelte";

</script>

<main>
  <Header/>
  <div class="main-display">
    <div class="left-column">
      <CsvFileImport/>
      <SetView/>
    </div>
    <div class="right-column">
      <div class="topology-view">
        <SetRelativeTopologyView width={1000} height={600}/>
        <GlobalTopologyView width={1000} height={600}/>
      </div>
      <SetSimilarityView/>
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
  padding: 10px;
  width: 100%;
}

.topology-view {
  display: flex;
  gap: 10px;
}

</style>
