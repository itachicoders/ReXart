<script>
    import BaseMainButton from "../buttons/BaseMainButton.svelte";
    import { createEventDispatcher } from "svelte";
    import {
        searchAnilibriaTorrents,
        searchTorApiTorrents,
    } from "../../api/downloads.js";

    export let args = {};

    const dispatch = createEventDispatcher();

    const SOURCES = [
        { id: "anilibria", label: "Anilibria" },
        { id: "rutracker", label: "Rutracker" },
        { id: "rutor", label: "Rutor" },
        { id: "kinozal", label: "Kinozal" },
        { id: "nonameclub", label: "NoNameClub" },
    ];

    let selectedSource = "anilibria";
    let selectedTitleMode = "ru";
    let isLoading = false;
    let errorMessage = "";
    let results = [];
    let lastLoadKey = null;

    function getReleaseTitle() {
        return selectedTitleMode === "original"
            ? (args?.releaseTitleOriginal || args?.releaseTitleRu || "")
            : (args?.releaseTitleRu || args?.releaseTitleOriginal || "");
    }

    function getFallbackLinks() {
        const query = encodeURIComponent(getReleaseTitle());
        return [
            {
                label: "Anilibria",
                url: `https://anilibria.top/search?query=${query}`,
            },
            {
                label: "Rutracker",
                url: `https://rutracker.org/forum/tracker.php?nm=${query}`,
            },
            {
                label: "Rutor",
                url: `https://rutor.info/search/${query}`,
            },
        ];
    }

    function openExternal(link) {
        if (!link) return;
        winApi.openLink(link);
    }

    async function loadResults() {
        const query = getReleaseTitle().trim();

        if (!query.length) {
            results = [];
            errorMessage = "Не удалось определить название релиза для поиска.";
            return;
        }

        isLoading = true;
        errorMessage = "";

        try {
            results = selectedSource === "anilibria"
                ? await searchAnilibriaTorrents(query)
                : await searchTorApiTorrents(query, selectedSource);

            if (!results.length) {
                errorMessage = "По этому запросу ничего не найдено.";
            }
        } catch (error) {
            console.error("Не удалось загрузить список торрентов:", error);
            results = [];
            errorMessage = error?.message || "Не удалось загрузить список торрентов.";
        } finally {
            isLoading = false;
        }
    }

    $: {
        const nextKey = `${selectedSource}:${selectedTitleMode}:${args?.releaseTitleRu ?? ""}:${args?.releaseTitleOriginal ?? ""}`;

        if (nextKey !== lastLoadKey) {
            lastLoadKey = nextKey;
            loadResults();
        }
    }
</script>

<div class="modal-title">Поиск торрентов</div>
<div class="modal-content download-modal-content">
    <div class="download-toolbar flex-column">
        <div class="download-toolbar-section flex-row">
            <span class="download-label">Искать по названию:</span>
            <div class="download-chip-group flex-row">
                <BaseMainButton style={selectedTitleMode === "ru" ? "primary" : "transparent"} borderRadius={10} height={36} onClickCallback={() => (selectedTitleMode = "ru")}>
                    Русское
                </BaseMainButton>
                <BaseMainButton style={selectedTitleMode === "original" ? "primary" : "transparent"} borderRadius={10} height={36} onClickCallback={() => (selectedTitleMode = "original")}>
                    Оригинальное
                </BaseMainButton>
            </div>
        </div>

        <div class="download-toolbar-section flex-row">
            <span class="download-label">Источник:</span>
            <div class="download-chip-group flex-row">
                {#each SOURCES as source}
                    <BaseMainButton style={selectedSource === source.id ? "primary" : "transparent"} borderRadius={10} height={36} onClickCallback={() => (selectedSource = source.id)}>
                        {source.label}
                    </BaseMainButton>
                {/each}
            </div>
        </div>

        <div class="download-query">
            Текущий запрос: <strong>{getReleaseTitle() || "—"}</strong>
        </div>
    </div>

    {#if isLoading}
        <div class="download-empty">Загрузка...</div>
    {:else if errorMessage && !results.length}
        <div class="download-empty flex-column">
            <span>{errorMessage}</span>
            <div class="download-links flex-row">
                {#each getFallbackLinks() as item}
                    <BaseMainButton style="transparent" borderRadius={10} onClickCallback={() => openExternal(item.url)}>
                        Открыть {item.label}
                    </BaseMainButton>
                {/each}
            </div>
        </div>
    {:else}
        <div class="download-results flex-column">
            {#if errorMessage}
                <div class="download-warning">{errorMessage}</div>
            {/if}

            {#each results as item}
                <div class="download-item flex-column">
                    <div class="download-item-title">{item.title}</div>
                    {#if item.filename}
                        <div class="download-item-subtitle">{item.filename}</div>
                    {/if}
                    <div class="download-item-meta flex-row">
                        {#if item.quality}
                            <span>{item.quality}</span>
                        {/if}
                        {#if item.codec}
                            <span>{item.codec}</span>
                        {/if}
                        {#if item.size}
                            <span>{item.size}</span>
                        {/if}
                        {#if item.seeders !== null && item.seeders !== undefined}
                            <span>{item.seeders} сид.</span>
                        {/if}
                        {#if item.leechers !== null && item.leechers !== undefined}
                            <span>{item.leechers} лич.</span>
                        {/if}
                    </div>
                    <div class="download-item-actions flex-row">
                        {#if item.magnet}
                            <BaseMainButton style="primary" borderRadius={10} onClickCallback={() => openExternal(item.magnet)}>
                                Открыть magnet
                            </BaseMainButton>
                        {/if}
                        {#if item.file}
                            <BaseMainButton style="transparent" borderRadius={10} onClickCallback={() => openExternal(item.file)}>
                                Скачать .torrent
                            </BaseMainButton>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    {/if}

    <div class="download-footer flex-row">
        <BaseMainButton style="transparent" borderRadius={10} onClickCallback={() => dispatch("closeModal")}>
            Закрыть
        </BaseMainButton>
    </div>
</div>

<style>
    .download-modal-content {
        gap: 18px;
    }

    .download-toolbar,
    .download-results {
        gap: 14px;
    }

    .download-toolbar-section {
        gap: 12px;
        align-items: center;
        flex-wrap: wrap;
    }

    .download-label,
    .download-query,
    .download-item-subtitle {
        color: var(--secondary-text-color);
    }

    .download-chip-group,
    .download-links,
    .download-item-meta,
    .download-item-actions,
    .download-footer {
        gap: 10px;
        flex-wrap: wrap;
    }

    .download-item {
        gap: 10px;
        background-color: var(--alt-background-color);
        padding: 16px 18px;
        border-radius: 16px;
    }

    .download-item-title {
        color: var(--main-text-color);
        font-size: 16px;
        font-weight: 700;
    }

    .download-item-meta span,
    .download-warning {
        padding: 6px 10px;
        border-radius: 999px;
        background-color: rgba(255, 255, 255, 0.06);
        color: var(--main-text-color);
        font-size: 13px;
    }

    .download-empty {
        align-items: center;
        justify-content: center;
        gap: 12px;
        min-height: 220px;
        color: var(--secondary-text-color);
        text-align: center;
    }

    .download-warning {
        align-self: flex-start;
        background-color: rgba(255, 188, 59, 0.12);
        color: #ffd680;
    }

    .download-footer {
        justify-content: flex-end;
        margin-top: auto;
    }
</style>
