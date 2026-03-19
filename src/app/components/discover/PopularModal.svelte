<script>
    import AnimeColumnCard from "../elements/AnimeColumnCard.svelte";
    import BaseMainButton from "../buttons/BaseMainButton.svelte";
    import Preloader from "../gui/Preloader.svelte";
    import { DISCOVERY_POPULAR_PRESETS, fetchFilteredReleases } from "../../api/discovery.js";

    let activePreset = DISCOVERY_POPULAR_PRESETS[0];
    let content = loadPreset(activePreset);

    async function loadPreset(preset) {
        const data = await fetchFilteredReleases(preset.filter, 0);
        return data?.content ?? [];
    }

    function selectPreset(preset) {
        activePreset = preset;
        content = loadPreset(preset);
    }

    function openFullPage() {
        updateViewportComponent(17, {
            filter: activePreset.filter,
            title: `Популярное · ${activePreset.label}`,
        });
    }
</script>

<div class="modal-title">Популярное</div>
<div class="modal-content popular-content">
    <div class="popular-actions flex-row">
        <div class="popular-tabs flex-row">
            {#each DISCOVERY_POPULAR_PRESETS as preset}
                <BaseMainButton
                    style={activePreset.id === preset.id ? "primary" : "transparent"}
                    borderRadius={10}
                    currentColorVar="--secondary-text-color"
                    onClickCallback={() => selectPreset(preset)}
                >
                    {preset.label}
                </BaseMainButton>
            {/each}
        </div>
        <BaseMainButton style="transparent" borderRadius={10} onClickCallback={openFullPage}>
            Открыть страницей
        </BaseMainButton>
    </div>

    {#await content}
        <Preloader />
    {:then releases}
        <div class="popular-grid">
            {#each releases as release}
                <div class="popular-card">
                    <AnimeColumnCard anime={release} />
                </div>
            {/each}
        </div>
    {/await}
</div>

<style>
    .popular-content {
        gap: 18px;
    }

    .popular-actions {
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
    }

    .popular-tabs {
        gap: 10px;
        flex-wrap: wrap;
    }

    .popular-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
    }
</style>
