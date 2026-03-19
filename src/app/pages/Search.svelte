<script>
    import { localStorageWritable } from "@babichjacob/svelte-localstorage";
    import AnimeFullRowCard from "../components/elements/AnimeFullRowCard.svelte";
    import CollectionFullRowCard from "../components/elements/CollectionFullRowCard.svelte";
    import Preloader from "../components/gui/Preloader.svelte";
    import MetaInfo from "../components/gui/MetaInfo.svelte";
    import DropdownButton from "../components/buttons/DropdownButton.svelte";
    import AuthPlaceholder from "./AuthPlaceholder.svelte";
    import ProfileSearchRow from "../components/search/ProfileSearchRow.svelte";
    import {
        SEARCH_WHERE_VALUES,
        getSearchByOptions,
        isSearchWhereRequiresAuth,
        searchContent,
    } from "../api/search.js";

    export let args = {};

    let firstData = null;
    let allData = [];
    let timeout;
    let page = 0;
    let updateInfo = false;
    let reachedEnd = false;
    let searchBoxElement;
    let utoken;

    const userToken = localStorageWritable("user_token", null);
    userToken.subscribe((value) => (utoken = JSON.parse(value)));

    if (!args.params) {
        args.params = {
            where: "releases",
            searchBy: "name",
        };
    }

    if (!args.params.where) {
        args.params.where = "releases";
    }

    if (!args.params.searchBy) {
        args.params.searchBy = getSearchByOptions(args.params.where)[0]?.value ?? "none";
    }

    function resetState() {
        page = 0;
        allData = [];
        updateInfo = false;
        reachedEnd = false;
    }

    function getCurrentWhere() {
        return args.params?.where ?? "releases";
    }

    function getCurrentSearchBy() {
        return args.params?.searchBy ?? getSearchByOptions(getCurrentWhere())[0]?.value ?? "none";
    }

    function currentResultType() {
        const where = getCurrentWhere();

        if (where === "profiles") return "profiles";
        if (where === "collections_all" || where === "collections_fav") return "collections";
        return "releases";
    }

    function getMetaSubtitle() {
        const whereLabel =
            SEARCH_WHERE_VALUES.find((item) => item.value === getCurrentWhere())?.label ?? "Релизах";
        const searchByLabel = getSearchByOptions(getCurrentWhere()).find(
            (item) => item.value === getCurrentSearchBy(),
        )?.label;

        if (!args.query) {
            return `Поиск в ${whereLabel.toLowerCase()}`;
        }

        if (searchByLabel) {
            return `${args.query} · ${whereLabel} · ${searchByLabel}`;
        }

        return `${args.query} · ${whereLabel}`;
    }


    async function loadPage(targetPage = 0) {
        return searchContent({
            where: getCurrentWhere(),
            searchBy: getCurrentSearchBy(),
            query: args.query?.trim() ?? "",
            page: targetPage,
        });
    }

    function search(immediate = false) {
        resetState();

        const query = args.query?.trim();
        if (!query) {
            firstData = null;
            return;
        }

        if (isSearchWhereRequiresAuth(getCurrentWhere()) && !utoken) {
            firstData = null;
            return;
        }

        const viewport = document.getElementById("viewport");
        if (viewport) {
            viewport.scrollTop = 0;
        }

        const run = () => {
            firstData = loadPage(0);
        };

        if (immediate) {
            run();
            return;
        }

        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(run, 500);
    }

    function inputEvent(e) {
        args.query = e.currentTarget.value;
        search();
    }

    function changeWhere(where) {
        args.params.where = where;
        args.params.searchBy = getSearchByOptions(where)[0]?.value ?? "none";
        search(true);
    }

    function changeSearchBy(searchBy) {
        args.params.searchBy = searchBy;
        search(true);
    }

    setViewportScrollEvent(async (e) => {
        if (
            !args.query?.trim() ||
            updateInfo ||
            reachedEnd ||
            e.srcElement.scrollTop < e.srcElement.scrollHeight - 2000
        ) {
            return;
        }

        if (isSearchWhereRequiresAuth(getCurrentWhere()) && !utoken) {
            return;
        }

        updateInfo = true;
        page++;

        try {
            const data = await loadPage(page);
            const content =
                getCurrentWhere() === "releases" ? data?.releases ?? [] : data?.content ?? [];

            if (content.length === 0) {
                reachedEnd = true;
            } else {
                allData = allData.concat(content);
            }
        } catch {
            reachedEnd = true;
        } finally {
            updateInfo = false;
        }
    });

    if (args.query) {
        search(true);
    }

    $: if (
        utoken &&
        isSearchWhereRequiresAuth(getCurrentWhere()) &&
        args.query?.trim() &&
        firstData === null
    ) {
        search(true);
    }
</script>

<div class="search-top-div flex-row">
    <div class="search-controls flex-column">
        <div class="search-box flex-row">
            <input
                bind:this={searchBoxElement}
                class="search-box-text"
                on:input={inputEvent}
                type="text"
                placeholder="Введите запрос..."
                value={args.query}
            />
        </div>
        <div class="search-filters flex-row">
            <DropdownButton
                values={SEARCH_WHERE_VALUES.map((item) => ({
                    label: item.auth && !utoken ? `${item.label} · авторизация` : item.label,
                    value: item.value,
                }))}
                value={getCurrentWhere()}
                placeholder="Где искать"
                width={250}
                height={36}
                onChange={(e, value) => changeWhere(value)}
            />
            {#if getSearchByOptions(getCurrentWhere()).length > 0}
                <DropdownButton
                    values={getSearchByOptions(getCurrentWhere())}
                    value={getCurrentSearchBy()}
                    placeholder="Искать по"
                    width={220}
                    height={36}
                    onChange={(e, value) => changeSearchBy(value)}
                />
            {/if}
        </div>
    </div>
</div>

<div class="result-content flex-column">
    {#key `${getCurrentWhere()}-${getCurrentSearchBy()}-${args.query ?? ""}`}
        <MetaInfo subTitle={getMetaSubtitle()} />
    {/key}

    {#if isSearchWhereRequiresAuth(getCurrentWhere()) && !utoken}
        <AuthPlaceholder />
    {:else if !args.query?.trim()}
        <div class="empty-state flex-column">
            <span class="empty-state-emoji">🔎</span>
            <span>Введите запрос, чтобы начать поиск.</span>
        </div>
    {:else if firstData}
        {#await firstData}
            <Preloader />
        {:then data}
            <span class="title">Результаты поиска</span>

            {#if currentResultType() === "profiles"}
                {#if (data?.content?.length ?? 0) === 0}
                    <div class="empty-state flex-column">
                        <span class="empty-state-emoji">😿</span>
                        <span>Ничего не найдено. Попробуйте другой запрос.</span>
                    </div>
                {:else}
                    {#each data.content as item}
                        <ProfileSearchRow profile={item} />
                    {/each}
                    {#each allData as item}
                        <ProfileSearchRow profile={item} />
                    {/each}
                {/if}
            {:else if currentResultType() === "collections"}
                {#if (data?.content?.length ?? 0) === 0}
                    <div class="empty-state flex-column">
                        <span class="empty-state-emoji">😿</span>
                        <span>Ничего не найдено. Попробуйте другой запрос.</span>
                    </div>
                {:else}
                    {#each data.content as collection}
                        <CollectionFullRowCard {collection} />
                    {/each}
                    {#each allData as collection}
                        <CollectionFullRowCard {collection} />
                    {/each}
                {/if}
            {:else}
                {#if (data?.releases?.length ?? data?.content?.length ?? 0) === 0}
                    <div class="empty-state flex-column">
                        <span class="empty-state-emoji">😿</span>
                        <span>Ничего не найдено. Попробуйте другой запрос.</span>
                    </div>
                {:else}
                    {#each data.releases ?? data.content as item}
                        <AnimeFullRowCard anime={item} />
                    {/each}
                    {#each allData as item}
                        <AnimeFullRowCard anime={item} />
                    {/each}
                {/if}
            {/if}
        {/await}
    {/if}
</div>

<style>
    .search-controls {
        width: 70%;
        gap: 10px;
    }

    .search-filters {
        gap: 10px;
        flex-wrap: wrap;
    }

    .related-release-button {
        width: 100%;
        text-align: left;
    }

    .related-title {
        font-size: 20px;
        font-weight: 700;
        margin-top: 15px;
    }

    .title {
        margin-left: 30px;
        margin-top: 10px;
        font-weight: 700;
        font-size: 18px;
    }

    .related-info {
        margin-right: 40px;
        z-index: -1;
        text-align: left;
        margin-top: 10px;
    }

    .related-open-hint {
        margin-top: 14px;
        color: var(--main-text-color);
        font-weight: 600;
    }

    .release-images {
        justify-items: center;
        align-items: center;
        position: relative;
        width: 360px;
        height: 240px;
        min-width: 360px;
        min-height: 240px;
        margin-left: 25px;
        z-index: -1;
    }

    .release-images img:first-child,
    .release-images img:last-child {
        height: 204px;
        width: 140px;
        position: relative;
        z-index: 0;
    }

    .release-images {
        margin-left: 40px;
        margin-right: 20px;
    }

    .release-images img:first-child {
        left: 0px;
        height: 204px;
        width: 140px;
        position: relative;
        border-radius: 15px;
    }

    .release-images img:last-child {
        left: 80px;
        height: 204px;
        width: 140px;
        position: relative;
        border-radius: 15px;
    }

    .release-images img {
        width: 180px;
        height: 240px;
        background-color: var(--alt-background-color);
        position: absolute;
        left: 80px;
        z-index: 1;
        border-radius: 15px;
        object-fit: cover;
        box-shadow: 6px 7px 13px 0px rgb(0 0 0 / 82%);
    }

    .related-release {
        position: relative;
        width: 100%;
        height: fit-content;
        margin-top: 30px;
        margin-bottom: 25px;
    }

    .related-description {
        margin-top: 10px;
        font-size: 14px;
    }

    .related-count {
        font-size: 14px;
        color: var(--secondary-text-color);
    }

    .search-box {
        border-radius: 30px;
        padding: 0 15px;
        border-color: var(--secondary-text-color);
        border-style: solid;
        background-color: var(--alt-background-color);
        width: 100%;
        border-width: 1px;
        z-index: 20;
    }

    .search-box-text {
        height: 40px;
        width: 100%;
        background-color: var(--alt-background-color);
        border: none;
        outline: none;
        color: var(--main-text-color);
    }

    .search-top-div {
        justify-content: center;
        position: sticky;
        top: 0;
        z-index: 25;
        padding-top: 10px;
        padding-bottom: 10px;
        background-color: var(--background-color);
    }

    .result-content {
        height: 100%;
    }

    .empty-state {
        align-items: center;
        justify-content: center;
        color: var(--secondary-text-color);
        min-height: calc(100vh - 240px);
        gap: 12px;
        font-size: 18px;
    }

    .empty-state-emoji {
        font-size: 42px;
    }
</style>
