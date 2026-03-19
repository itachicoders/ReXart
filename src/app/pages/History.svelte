<script>
    import AnimeFullRowCard from "../components/elements/AnimeFullRowCard.svelte";
    import Dot from "../components/elements/Dot.svelte";
    import MetaInfo from "../components/gui/MetaInfo.svelte";
    import Preloader from "../components/gui/Preloader.svelte";
    import AuthPlaceholder from "./AuthPlaceholder.svelte";
    import { fetchHistoryPage } from "../api/profile.js";
    import { localStorageWritable } from "@babichjacob/svelte-localstorage";

    let utoken;
    let page = 0;
    let allData = [];
    let updateInfo = false;
    let reachedEnd = false;
    let searchValue = "";

    let firstData = null;

    const userToken = localStorageWritable("user_token", null);
    userToken.subscribe((value) => {
        utoken = JSON.parse(value);
        firstData = utoken ? fetchHistoryPage(0) : null;
        allData = [];
        page = 0;
        reachedEnd = false;
    });

    setViewportScrollEvent(async (e) => {
        if (
            !utoken ||
            updateInfo ||
            reachedEnd ||
            e.srcElement.scrollTop < e.srcElement.scrollHeight - 2000
        ) {
            return;
        }

        updateInfo = true;
        page++;

        try {
            const data = await fetchHistoryPage(page);
            const nextContent = data?.content ?? [];

            if (nextContent.length > 0) {
                allData = allData.concat(nextContent);
            } else {
                reachedEnd = true;
            }
        } finally {
            updateInfo = false;
        }
    });

    function openHistorySearch() {
        if (!searchValue?.trim()) return;
        updateViewportComponent(5, {
            query: searchValue.trim(),
            params: {
                where: "history",
                searchBy: "none",
            },
        });
    }
</script>

<MetaInfo subTitle="История просмотра" />

{#if !utoken}
    <AuthPlaceholder />
{:else}
    <form class="history-top-div flex-row" on:submit|preventDefault={openHistorySearch}>
        <div class="history-search-box flex-row">
            <input
                class="history-search-box-text"
                bind:value={searchValue}
                type="text"
                placeholder="Искать в истории..."
            />
            <button class="history-search-submit" type="submit">Поиск</button>
        </div>
    </form>

    <div class="history-result-content flex-column">
        {#await firstData}
            <Preloader />
        {:then data}
            {#if (data?.content?.length ?? 0) === 0}
                <div class="history-empty-state flex-column">
                    <span class="history-empty-emoji">🕘</span>
                    <span>История просмотра пока пуста.</span>
                </div>
            {:else}
                {#each data.content as item}
                    <AnimeFullRowCard anime={item}>
                        <div class="history-item-extra flex-row">
                            <span>{item.last_view_episode?.name ?? "Последний просмотр"}</span>
                            {#if item.last_view_timestamp}
                                <Dot />
                                <span class="history-date">{utils.returnTimeString(item.last_view_timestamp * 1000)}</span>
                            {/if}
                        </div>
                    </AnimeFullRowCard>
                {/each}
                {#each allData as item}
                    <AnimeFullRowCard anime={item}>
                        <div class="history-item-extra flex-row">
                            <span>{item.last_view_episode?.name ?? "Последний просмотр"}</span>
                            {#if item.last_view_timestamp}
                                <Dot />
                                <span class="history-date">{utils.returnTimeString(item.last_view_timestamp * 1000)}</span>
                            {/if}
                        </div>
                    </AnimeFullRowCard>
                {/each}
            {/if}
        {/await}
    </div>
{/if}

<style>
    .history-top-div {
        justify-content: center;
        position: sticky;
        top: 0;
        z-index: 20;
        padding-top: 10px;
        padding-bottom: 10px;
        background-color: var(--background-color);
    }

    .history-search-box {
        border-radius: 30px;
        padding: 0 8px 0 15px;
        border-color: var(--secondary-text-color);
        border-style: solid;
        background-color: var(--alt-background-color);
        width: 70%;
        border-width: 1px;
        align-items: center;
        gap: 10px;
    }

    .history-search-box-text {
        height: 40px;
        width: 100%;
        background-color: transparent;
        border: none;
        outline: none;
        color: var(--main-text-color);
    }

    .history-search-submit {
        min-width: 100px;
        height: 34px;
        border-radius: 18px;
        background-color: var(--select-button-color);
        color: var(--main-text-color);
        font-weight: 600;
    }

    .history-item-extra {
        align-items: center;
        color: var(--secondary-text-color);
        font-size: 14px;
        margin-bottom: 8px;
        flex-wrap: wrap;
    }

    .history-date {
        color: var(--third-text-color);
    }

    .history-result-content {
        height: 100%;
    }

    .history-empty-state {
        align-items: center;
        justify-content: center;
        color: var(--secondary-text-color);
        min-height: calc(100vh - 220px);
        gap: 10px;
        font-size: 18px;
    }

    .history-empty-emoji {
        font-size: 38px;
    }
</style>
