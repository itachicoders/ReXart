<script>
    import AnimeFullRowCard from "../components/elements/AnimeFullRowCard.svelte";
    import BaseMainButton from "../components/buttons/BaseMainButton.svelte";
    import BaseModal from "../components/modal/BaseModal.svelte";
    import MetaInfo from "../components/gui/MetaInfo.svelte";
    import Preloader from "../components/gui/Preloader.svelte";
    import FiltersModal from "../components/discover/FiltersModal.svelte";
    import { DISCOVERY_FILTER_DEFAULT, fetchFilteredReleases } from "../api/discovery.js";

    export let args = {};

    let currentFilter = {
        ...DISCOVERY_FILTER_DEFAULT,
        ...(args?.filter ?? {}),
    };
    let title = args?.title ?? "Фильтр релизов";
    let showFiltersModal = false;
    let firstData = fetchFilteredReleases(currentFilter, 0);
    let allData = [];
    let page = 0;
    let loadingMore = false;
    let reachedEnd = false;

    function applyFilter(nextFilter) {
        currentFilter = { ...DISCOVERY_FILTER_DEFAULT, ...nextFilter };
        title = args?.title ?? "Фильтр релизов";
        firstData = fetchFilteredReleases(currentFilter, 0);
        allData = [];
        page = 0;
        reachedEnd = false;
        showFiltersModal = false;

        const viewport = document.getElementById("viewport");
        if (viewport) {
            viewport.scrollTop = 0;
        }
    }

    function getFilterLabels() {
        const result = [];

        if (currentFilter.country) result.push(currentFilter.country);
        if (currentFilter.category_id) result.push(`Категория: ${currentFilter.category_id}`);
        if (currentFilter.status_id) result.push(`Статус: ${currentFilter.status_id}`);
        if (currentFilter.season) result.push(`Сезон: ${currentFilter.season}`);
        if (currentFilter.source) result.push(currentFilter.source);
        if (currentFilter.studio) result.push(currentFilter.studio);
        if (currentFilter.genres.length > 0) result.push(...currentFilter.genres.slice(0, 4));
        if (currentFilter.types.length > 0) result.push(`Озвучек: ${currentFilter.types.length}`);
        if (currentFilter.profile_list_exclusions.length > 0) result.push(`Исключений: ${currentFilter.profile_list_exclusions.length}`);

        return result;
    }

    setViewportScrollEvent(async (e) => {
        if (
            loadingMore ||
            reachedEnd ||
            e.srcElement.scrollTop < e.srcElement.scrollHeight - 2000
        ) {
            return;
        }

        loadingMore = true;
        page += 1;

        try {
            const data = await fetchFilteredReleases(currentFilter, page);
            const content = data?.content ?? [];

            if (content.length === 0) {
                reachedEnd = true;
            } else {
                allData = allData.concat(content);
            }
        } finally {
            loadingMore = false;
        }
    });
</script>

<MetaInfo subTitle={title} />

<div class="filter-page flex-column">
    <div class="filter-page-top flex-row">
        <div class="filter-summary flex-row">
            {#each getFilterLabels() as label}
                <span class="summary-chip">{label}</span>
            {/each}
            {#if getFilterLabels().length === 0}
                <span class="summary-empty">Показываются релизы без дополнительных ограничений.</span>
            {/if}
        </div>
        <BaseMainButton style="primary" borderRadius={10} onClickCallback={() => (showFiltersModal = true)}>
            Изменить фильтр
        </BaseMainButton>
    </div>

    {#await firstData}
        <Preloader />
    {:then data}
        {#if (data?.content?.length ?? 0) === 0}
            <div class="filter-empty">По текущим параметрам ничего не найдено.</div>
        {:else}
            {#each data.content as release}
                <AnimeFullRowCard anime={release} />
            {/each}
            {#each allData as release}
                <AnimeFullRowCard anime={release} />
            {/each}
        {/if}
    {/await}
</div>

<BaseModal
    modalComponent={FiltersModal}
    showed={showFiltersModal}
    modalSize={{ width: "84%", height: "90%" }}
    modalArgs={{
        filter: currentFilter,
        onApply: applyFilter,
    }}
    on:closeModal={() => (showFiltersModal = false)}
/>

<style>
    .filter-page {
        max-width: 1500px;
        margin: 20px auto 30px auto;
    }

    .filter-page-top {
        position: sticky;
        top: 0;
        z-index: 10;
        background-color: var(--background-color);
        padding: 12px 20px 16px 20px;
        justify-content: space-between;
        gap: 16px;
        align-items: center;
    }

    .filter-summary {
        gap: 8px;
        flex-wrap: wrap;
    }

    .summary-chip {
        border-radius: 999px;
        padding: 8px 10px;
        background-color: var(--alt-background-color);
        color: var(--secondary-text-color);
        border: 1px solid var(--rate-back-color);
    }

    .summary-empty,
    .filter-empty {
        color: var(--secondary-text-color);
    }

    .filter-empty {
        margin: 40px 20px;
        font-size: 18px;
    }
</style>
