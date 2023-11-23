<script lang="ts">
import CsvFileImport from "./lib/CSVFileImport.svelte";
import Header from "./lib/Header.svelte";
import SetView from "./lib/SetView/SetView.svelte";
import SimilarityView from "./lib/SimilarityView/SimilarityView.svelte";
import GlobalTopologyView from "./lib/TopologyView/GlobalTopologyView.svelte";
import SetRelativeTopologyView from "./lib/TopologyView/SetRelativeTopologyView.svelte";
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
        <SetRelativeTopologyView width={1000} height={400}/>
        <GlobalTopologyView width={1000} height={400}/>
      </div>
      <SimilarityView/>
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
