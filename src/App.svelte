<script lang="ts">
import CsvFileImport from "./lib/CSVFileImport.svelte";
import Header from "./lib/Header.svelte";
import SetView from "./lib/SetView.svelte";
import SetRelativeTopologyView from "./lib/SetRelativeTopologyView.svelte";
import GlobalTopologyView from "./lib/GlobalTopologyView.svelte";

</script>

<main>
  <Header/>
  <div class="main-display">
    <div class="left-column">
      <CsvFileImport/>
      <SetView/>
    </div>
    <div class="right-column">
      <SetRelativeTopologyView width={1000} height={600}/>
      <GlobalTopologyView width={1000} height={600} padding={20}/>
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
