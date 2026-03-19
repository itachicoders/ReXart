<script>
    import AnimeFullRowCard from "../components/elements/AnimeFullRowCard.svelte";
    import Dot from "../components/elements/Dot.svelte";
    import MetaInfo from "../components/gui/MetaInfo.svelte";
    import Preloader from "../components/gui/Preloader.svelte";
    import { fetchRelatedReleasesPage } from "../api/release.js";

    export let args = {};

    let page = 0;
    let allData = [];
    let updateInfo = false;
    let reachedEnd = false;

    let firstData = args?.id
        ? fetchRelatedReleasesPage(args.id, 0).catch(() => ({ content: [] }))
        : Promise.resolve({ content: [] });

    function getRelatedTitle() {
        return args?.name_ru || args?.name || "Франшиза";
    }

    async function getRelatedPage() {
        const data = await fetchRelatedReleasesPage(args.id, page).catch(() => ({ content: [] }));
        const content = data?.content ?? [];

        if (!content.length) {
            reachedEnd = true;
        } else {
            allData = allData.concat(content);
        }

        updateInfo = false;
    }

    setViewportScrollEvent(async (e) => {
        if (
            !args?.id ||
            updateInfo ||
            reachedEnd ||
            e.srcElement.scrollTop < e.srcElement.scrollHeight - 2000
        ) {
            return;
        }

        updateInfo = true;
        page++;
        await getRelatedPage();
    });
</script>

<MetaInfo subTitle={`Франшиза · ${getRelatedTitle()}`} />

<div class="related-page flex-column">
    <div class="related-header flex-row">
        {#if args?.image}
            <img src={args.image} class="related-cover" alt={getRelatedTitle()} />
        {/if}
        <div class="related-header-info flex-column">
            <span class="related-page-title">{getRelatedTitle()}</span>
            <span class="related-page-subtitle">Полная лента связанных релизов</span>
            {#if args?.description}
                <span class="related-page-description">{args.description}</span>
            {/if}
        </div>
    </div>

    {#await firstData}
        <Preloader />
    {:then data}
        {#if (data?.content?.length ?? 0) === 0}
            <div class="empty-state flex-column">
                <span class="empty-state-emoji">🧩</span>
                <span>Для этой франшизы пока нет связанных релизов.</span>
            </div>
        {:else}
            <div class="related-list flex-column">
                {#each data.content as item}
                    <AnimeFullRowCard anime={item}>
                        <div class="related-item-meta flex-row">
                            {#if item.year}
                                <span>{item.season ? `${utils.seasons[item.season]}, ` : ""}{item.year} г.</span>
                            {/if}
                            {#if item.category?.name}
                                <Dot />
                                <span>{item.category.name}</span>
                            {/if}
                            {#if item.grade && item.status?.id !== 3}
                                <Dot />
                                <span>{item.grade.toFixed(2)} ★</span>
                            {/if}
                        </div>
                    </AnimeFullRowCard>
                {/each}
                {#each allData as item}
                    <AnimeFullRowCard anime={item}>
                        <div class="related-item-meta flex-row">
                            {#if item.year}
                                <span>{item.season ? `${utils.seasons[item.season]}, ` : ""}{item.year} г.</span>
                            {/if}
                            {#if item.category?.name}
                                <Dot />
                                <span>{item.category.name}</span>
                            {/if}
                            {#if item.grade && item.status?.id !== 3}
                                <Dot />
                                <span>{item.grade.toFixed(2)} ★</span>
                            {/if}
                        </div>
                    </AnimeFullRowCard>
                {/each}
            </div>
        {/if}
    {/await}
</div>

<style>
    .related-page {
        padding-bottom: 20px;
    }

    .related-header {
        gap: 24px;
        padding: 24px 20px 10px 20px;
        align-items: flex-start;
    }

    .related-cover {
        width: 240px;
        min-width: 240px;
        height: 320px;
        object-fit: cover;
        border-radius: 20px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
    }

    .related-header-info {
        gap: 10px;
        max-width: 920px;
    }

    .related-page-title {
        font-size: 30px;
        font-weight: 700;
        color: var(--main-text-color);
    }

    .related-page-subtitle {
        font-size: 15px;
        color: var(--secondary-text-color);
        font-weight: 600;
    }

    .related-page-description {
        font-size: 14px;
        line-height: 24px;
        color: var(--main-text-color);
    }

    .related-item-meta {
        align-items: center;
        color: var(--secondary-text-color);
        font-size: 14px;
        margin-bottom: 8px;
        flex-wrap: wrap;
    }

    .related-list {
        padding-top: 4px;
    }

    .empty-state {
        align-items: center;
        justify-content: center;
        min-height: 360px;
        gap: 10px;
        color: var(--secondary-text-color);
        font-size: 18px;
    }

    .empty-state-emoji {
        font-size: 38px;
    }
</style>
