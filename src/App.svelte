<script lang="ts">
import CsvFileImport from "./lib/CSVFileImport.svelte";
import Header from "./lib/Header.svelte";
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
      Test
    </div>
  </div>
</main>

<style>
.main-display {
  width: 100%;
  height: 100vh;
  display: flex;
}

.left-column {
  padding: 10px
}

</style>
