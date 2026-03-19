<script>
    import CollectionFullRowCard from "../components/elements/CollectionFullRowCard.svelte";
    import MetaInfo from "../components/gui/MetaInfo.svelte";
    import Preloader from "../components/gui/Preloader.svelte";
    import { fetchReleaseCollectionsPage } from "../api/collections.js";

    export let args = {};

    let page = 0;
    let allData = [];
    let updateInfo = false;
    let reachedEnd = false;

    let firstData = args?.id
        ? fetchReleaseCollectionsPage(args.id, 0).catch(() => ({ content: [] }))
        : Promise.resolve({ content: [] });

    function getSubtitle() {
        return args?.title ? `Коллекции · ${args.title}` : "Коллекции релиза";
    }

    async function getCollectionsPage() {
        const data = await fetchReleaseCollectionsPage(args.id, page).catch(() => ({ content: [] }));
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
        await getCollectionsPage();
    });
</script>

<MetaInfo subTitle={getSubtitle()} />

<div class="release-collections-page flex-column">
    <div class="release-collections-header flex-column">
        <span class="release-collections-title">Коллекции с этим релизом</span>
        {#if args?.title}
            <span class="release-collections-subtitle">{args.title}</span>
        {/if}
        {#if args?.count !== undefined}
            <span class="release-collections-meta">
                Найдено коллекций: {args.count}
            </span>
        {/if}
    </div>

    {#await firstData}
        <Preloader />
    {:then data}
        {#if (data?.content?.length ?? 0) === 0}
            <div class="empty-state flex-column">
                <span class="empty-state-emoji">📚</span>
                <span>Этот релиз пока не добавлен ни в одну коллекцию.</span>
            </div>
        {:else}
            <div class="collections-list flex-column">
                {#each data.content as collection}
                    <CollectionFullRowCard {collection} />
                {/each}
                {#each allData as collection}
                    <CollectionFullRowCard {collection} />
                {/each}
            </div>
        {/if}
    {/await}
</div>

<style>
    .release-collections-page {
        padding-bottom: 20px;
    }

    .release-collections-header {
        padding: 24px 20px 10px 20px;
        gap: 6px;
    }

    .release-collections-title {
        font-size: 30px;
        font-weight: 700;
        color: var(--main-text-color);
    }

    .release-collections-subtitle {
        font-size: 16px;
        color: var(--main-text-color);
        font-weight: 600;
    }

    .release-collections-meta {
        font-size: 14px;
        color: var(--secondary-text-color);
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

    .collections-list {
        padding-top: 4px;
    }
</style>
