<script lang="ts">
import EgoNetView from "./lib/EgoNetView.svelte/EgoNetView.svelte";
import Header from "./lib/Header.svelte";
import Import from "./lib/Import.svelte";
import SetView from "./lib/SetView/SetView.svelte";
import SimilarityView from "./lib/SimilarityView/SimilarityView.svelte";
import GlobalTopologyView from "./lib/TopologyView/GlobalTopologyView.svelte";
import SetRelativeTopologyView from "./lib/TopologyView/SetRelativeTopologyView.svelte";
</script>

<main>
  <Header/>
  <div class="main-display">
    <div class="left-column">
      <Import/>
      <SetView/>
    </div>
    <div class="right-column">
      <div class="topology-view">
        <SetRelativeTopologyView width={500} height={400}/>
        <GlobalTopologyView width={500} height={400}/>
      </div>
      <div class="similarity-view">
        <SimilarityView/>
      </div>
      <div class="egonet-view">
        <EgoNetView width={500} height={400}/>
      </div>
    </div>
  </div>
</main>

<style>
.main-display {
  display: flex;
}

.left-column {
  padding: 10px;
  max-width: 300px;
}

.right-column {
  padding: 10px;
  width: 100%;
}

.topology-view {
  display: flex;
  gap: 10px;
}

.similarity-view {
  margin-top: 10px;
}

.egonet-view {
  margin-top: 10px;
}

</style>
