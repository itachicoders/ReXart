<script>
    import { createEventDispatcher } from "svelte";
    import Preloader from "../gui/Preloader.svelte";
    import { addReleaseToCollection, fetchUserCollectionsPage } from "../../api/collections.js";
    import { getCurrentUserId } from "../../api/request.js";

    const dispatch = createEventDispatcher();

    export let args = {};
    export let showed = false;

    dispatch("setTitle", "Добавить в коллекцию");

    let page = 0;
    let allData = [];
    let updateInfo = false;
    let reachedEnd = false;
    let errorMessage = "";
    let loadingCollectionId = null;

    const currentUserId = getCurrentUserId();

    let firstData = currentUserId
        ? fetchUserCollectionsPage(currentUserId, 0).catch(() => ({ content: [] }))
        : Promise.resolve({ content: [] });

    async function getCollectionsPage() {
        const data = await fetchUserCollectionsPage(currentUserId, page).catch(() => ({ content: [] }));
        const content = data?.content ?? [];

        if (!content.length) {
            reachedEnd = true;
        } else {
            allData = allData.concat(content);
        }

        updateInfo = false;
    }

    async function scrollEvent(e) {
        if (
            !currentUserId ||
            updateInfo ||
            reachedEnd ||
            e.currentTarget.scrollTop < e.currentTarget.scrollHeight - e.currentTarget.clientHeight - 1200
        ) {
            return;
        }

        updateInfo = true;
        page++;
        await getCollectionsPage();
    }

    async function selectCollection(collection) {
        if (!args?.releaseId || loadingCollectionId !== null) return;

        loadingCollectionId = collection.id;
        errorMessage = "";

        try {
            await addReleaseToCollection(collection.id, args.releaseId);
            args?.onAdded?.({
                countDelta: 1,
                collection,
                message: `Релиз добавлен в коллекцию «${collection.title}».`,
            });
            dispatch("closeModal");
        } catch (error) {
            const code = error?.data?.code ?? error?.status;
            if (code === 5) {
                errorMessage = "Этот релиз уже добавлен в выбранную коллекцию.";
            } else {
                errorMessage = error?.data?.message || "Не удалось добавить релиз в коллекцию.";
            }
        } finally {
            loadingCollectionId = null;
        }
    }

    function cardBackground(image) {
        return `linear-gradient(180deg, rgba(0, 0, 0, 0.12) 0%, rgba(0, 0, 0, 0.85) 100%), url(${image})`;
    }
</script>

{#if showed}
    <div class="modal-title">Добавить в коллекцию</div>
    <div class="modal-content" on:scroll={scrollEvent}>
        {#if errorMessage}
            <div class="modal-error">{errorMessage}</div>
        {/if}

        {#if !currentUserId}
            <div class="empty-state flex-column">
                <span class="empty-state-emoji">🔒</span>
                <span>Для управления коллекциями требуется авторизация.</span>
            </div>
        {:else}
            {#await firstData}
                <div class="center">
                    <Preloader />
                </div>
            {:then data}
                {#if (data?.content?.length ?? 0) === 0}
                    <div class="empty-state flex-column">
                        <span class="empty-state-emoji">📚</span>
                        <span>У вас пока нет коллекций.</span>
                    </div>
                {:else}
                    <div class="collections-grid flex-column">
                        {#each data.content as collection}
                            <button
                                class="collection-select-card"
                                style={`background-image: ${cardBackground(collection.image)}`}
                                disabled={loadingCollectionId !== null}
                                on:click={() => selectCollection(collection)}
                            >
                                <div class="collection-card-body">
                                    <span class="collection-card-title">{collection.title}</span>
                                    <span class="collection-card-description">
                                        {collection.description?.length > 220
                                            ? `${collection.description.slice(0, 220)}...`
                                            : collection.description}
                                    </span>
                                </div>
                                <div class="collection-card-meta">
                                    {#if loadingCollectionId === collection.id}
                                        <span class="collection-card-pill">Добавление...</span>
                                    {:else}
                                        <span class="collection-card-pill">Выбрать</span>
                                    {/if}
                                </div>
                            </button>
                        {/each}
                        {#each allData as collection}
                            <button
                                class="collection-select-card"
                                style={`background-image: ${cardBackground(collection.image)}`}
                                disabled={loadingCollectionId !== null}
                                on:click={() => selectCollection(collection)}
                            >
                                <div class="collection-card-body">
                                    <span class="collection-card-title">{collection.title}</span>
                                    <span class="collection-card-description">
                                        {collection.description?.length > 220
                                            ? `${collection.description.slice(0, 220)}...`
                                            : collection.description}
                                    </span>
                                </div>
                                <div class="collection-card-meta">
                                    {#if loadingCollectionId === collection.id}
                                        <span class="collection-card-pill">Добавление...</span>
                                    {:else}
                                        <span class="collection-card-pill">Выбрать</span>
                                    {/if}
                                </div>
                            </button>
                        {/each}
                    </div>
                {/if}
            {/await}
        {/if}
    </div>
{/if}

<style>
    .center {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
    }

    .collections-grid {
        gap: 14px;
        padding-bottom: 20px;
    }

    .collection-select-card {
        min-height: 220px;
        width: 100%;
        border-radius: 20px;
        padding: 18px;
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        text-align: left;
        gap: 16px;
        transition: transform 0.2s ease, opacity 0.2s ease;
    }

    .collection-select-card:hover:not(:disabled) {
        transform: translateY(-2px);
    }

    .collection-select-card:disabled {
        opacity: 0.8;
        cursor: default;
    }

    .collection-card-body {
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-width: calc(100% - 120px);
    }

    .collection-card-title {
        font-size: 24px;
        font-weight: 700;
        color: white;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.45);
    }

    .collection-card-description {
        font-size: 14px;
        line-height: 22px;
        color: rgba(255, 255, 255, 0.85);
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
    }

    .collection-card-meta {
        margin-left: auto;
        align-self: flex-start;
    }

    .collection-card-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 92px;
        padding: 8px 12px;
        border-radius: 999px;
        background-color: rgba(0, 0, 0, 0.45);
        color: white;
        font-size: 13px;
        font-weight: 700;
        backdrop-filter: blur(8px);
    }

    .modal-error {
        margin-bottom: 15px;
        padding: 12px 14px;
        border-radius: 12px;
        background-color: rgba(214, 61, 61, 0.12);
        color: #ffb3b3;
        font-size: 14px;
        line-height: 20px;
    }

    .empty-state {
        align-items: center;
        justify-content: center;
        min-height: 320px;
        gap: 10px;
        color: var(--secondary-text-color);
        text-align: center;
        font-size: 18px;
    }

    .empty-state-emoji {
        font-size: 38px;
    }
</style>
