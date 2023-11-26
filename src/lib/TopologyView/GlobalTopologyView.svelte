<script lang="ts">
  import { faCircleDot } from '@fortawesome/free-regular-svg-icons';
  import { faCircleNodes } from '@fortawesome/free-solid-svg-icons';
  import Fa from 'svelte-fa';
  import GlobalToplogyCircleView from './GlobalToplogyCircleView.svelte';
  import GlobalTopologyNetworkView from './GlobalTopologyNetworkView.svelte';

export let width: number;
export let height: number;

let isNetworkView: boolean = false;

</script>

<div class="global-topology-container">
    <div class="global-topology-view-header">
        <h2>Global Topology View</h2>
        <div class="global-topology-view-buttons">
            <button on:click={() => isNetworkView = true} class="button" title="Show global topology as network view.">
                <Fa icon={faCircleNodes}/>
            </button>
            <button on:click={() => isNetworkView = false} class="button" title="Show global topology as circle view.">
                <Fa icon={faCircleDot}/>
            </button>
        </div>
    </div>
    
    {#if isNetworkView}
        <GlobalTopologyNetworkView width={width} height={height}/>
    {:else}
        <GlobalToplogyCircleView width={width} height={height}/>
    {/if}
</div>

<style>
.global-topology-view-header {
    display: flex;
    justify-content: space-between;
}

.global-topology-view-buttons {
    display: flex;
    gap: 5px;
}

.global-topology-container {
    width: 100%;
}
</style>