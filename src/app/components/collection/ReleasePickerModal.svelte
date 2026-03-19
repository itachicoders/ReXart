<script>
    import AnimePoster from "../release/AnimePoster.svelte";
    import BaseMainButton from "../buttons/BaseMainButton.svelte";
    import Preloader from "../gui/Preloader.svelte";
    import { searchContent } from "../../api/search.js";

    export let args = {};

    let query = "";
    let timeout;
    let page = 0;
    let firstData = null;
    let allData = [];
    let reachedEnd = false;
    let loadingMore = false;
    let selectedIds = args?.selectedIds ?? [];

    function resetResults() {
        page = 0;
        allData = [];
        reachedEnd = false;
    }

    async function loadPage(targetPage = 0) {
        return searchContent({
            where: "releases",
            searchBy: "name",
            query: query.trim(),
            page: targetPage,
        });
    }

    function runSearch(immediate = false) {
        resetResults();

        if (!query.trim()) {
            firstData = null;
            return;
        }

        const execute = () => {
            firstData = loadPage(0);
        };

        if (timeout) {
            clearTimeout(timeout);
        }

        if (immediate) {
            execute();
            return;
        }

        timeout = setTimeout(execute, 350);
    }

    async function loadMore() {
        if (!query.trim() || reachedEnd || loadingMore) return;

        loadingMore = true;
        page += 1;

        try {
            const data = await loadPage(page);
            const content = data?.releases ?? [];

            if (content.length === 0) {
                reachedEnd = true;
            } else {
                allData = allData.concat(content);
            }
        } finally {
            loadingMore = false;
        }
    }

    function addRelease(release) {
        args?.onAdd?.(release);
        selectedIds = [...new Set([...(args?.selectedIds ?? selectedIds), release.id])];
    }
</script>

<div class="modal-title">Добавить релизы</div>
<div class="modal-content picker-content">
    <div class="picker-search-box flex-row">
        <input bind:value={query} class="picker-search-input" type="text" placeholder="Введите название релиза..." on:input={() => runSearch()} />
        <BaseMainButton style="primary" borderRadius={10} onClickCallback={() => runSearch(true)}>
            Найти
        </BaseMainButton>
    </div>

    {#if !query.trim()}
        <div class="picker-empty">Найдите релизы и добавьте их в коллекцию.</div>
    {:else if firstData}
        {#await firstData}
            <Preloader />
        {:then data}
            {#if (data?.releases?.length ?? 0) === 0}
                <div class="picker-empty">Ничего не найдено.</div>
            {:else}
                <div class="picker-results flex-column">
                    {#each data.releases as release}
                        <div class="picker-row flex-row">
                            <div class="picker-info flex-row">
                                <AnimePoster size={{ width: 72, height: 102 }} posterInfo={{ poster: release.image, title: release.title }} borderRadius={14} shadow={false} />
                                <div class="picker-text flex-column">
                                    <span class="picker-title">{release.title_ru}</span>
                                    <span class="picker-meta">{utils.returnEpisodeString(release)} эп. · {release.grade?.toFixed?.(2) ?? "0.00"} ★</span>
                                </div>
                            </div>
                            <BaseMainButton
                                style={selectedIds.includes(release.id) ? "default" : "primary"}
                                borderRadius={10}
                                disabled={selectedIds.includes(release.id)}
                                onClickCallback={() => addRelease(release)}
                            >
                                {selectedIds.includes(release.id) ? "Добавлен" : "Добавить"}
                            </BaseMainButton>
                        </div>
                    {/each}
                    {#each allData as release}
                        <div class="picker-row flex-row">
                            <div class="picker-info flex-row">
                                <AnimePoster size={{ width: 72, height: 102 }} posterInfo={{ poster: release.image, title: release.title }} borderRadius={14} shadow={false} />
                                <div class="picker-text flex-column">
                                    <span class="picker-title">{release.title_ru}</span>
                                    <span class="picker-meta">{utils.returnEpisodeString(release)} эп. · {release.grade?.toFixed?.(2) ?? "0.00"} ★</span>
                                </div>
                            </div>
                            <BaseMainButton
                                style={selectedIds.includes(release.id) ? "default" : "primary"}
                                borderRadius={10}
                                disabled={selectedIds.includes(release.id)}
                                onClickCallback={() => addRelease(release)}
                            >
                                {selectedIds.includes(release.id) ? "Добавлен" : "Добавить"}
                            </BaseMainButton>
                        </div>
                    {/each}
                </div>

                {#if !reachedEnd}
                    <div class="picker-actions">
                        <BaseMainButton style="transparent" borderRadius={10} isLoading={loadingMore} onClickCallback={loadMore}>
                            Загрузить ещё
                        </BaseMainButton>
                    </div>
                {/if}
            {/if}
        {/await}
    {/if}
</div>

<style>
    .picker-content {
        gap: 18px;
    }

    .picker-search-box {
        gap: 12px;
    }

    .picker-search-input {
        width: 100%;
        min-height: 42px;
        border-radius: 12px;
        padding: 0 14px;
        background-color: var(--alt-background-color);
        color: var(--main-text-color);
        border: 1px solid var(--rate-back-color);
    }

    .picker-results {
        gap: 12px;
    }

    .picker-row {
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        background-color: var(--alt-background-color);
        border-radius: 14px;
        padding: 12px 14px;
    }

    .picker-info {
        gap: 14px;
        align-items: center;
    }

    .picker-title {
        font-size: 18px;
        color: var(--main-text-color);
        font-weight: 600;
    }

    .picker-meta,
    .picker-empty {
        color: var(--secondary-text-color);
    }

    .picker-actions {
        display: flex;
        justify-content: center;
    }
</style>
