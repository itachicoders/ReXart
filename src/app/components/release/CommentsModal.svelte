<script>
    import AuthPlaceholder from "../../pages/AuthPlaceholder.svelte";
    import CommentItem from "../elements/CommentItem.svelte";
    import Preloader from "../gui/Preloader.svelte";
    import CommentComposer from "./CommentComposer.svelte";
    import { addComment, fetchCommentsPage } from "../../api/comments.js";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    export let args;
    export let showed;
    dispatch("setTitle", "Комментарии");

    let page = 0;
    let comments = [];
    let totalCount = 0;
    let loading = false;
    let loadingMore = false;
    let showComposer = false;
    let initializedKey = null;
    let canLoadMore = true;
    let submitting = false;

    function getType() {
        return args?.type || "release";
    }

    async function loadInitial(forceComposerState = null) {
        if (!args?.id) return;
        loading = true;
        page = 0;
        canLoadMore = true;
        try {
            const data = await fetchCommentsPage({
                type: getType(),
                entityId: args.id,
                page: 0,
                sort: 1,
            }).catch(() => ({ content: [], total_count: 0, total_page_count: 0 }));

            comments = data?.content || [];
            totalCount = data?.total_count || comments.length;
            canLoadMore = (data?.total_page_count || 1) > 1 || (data?.content || []).length > 0;
            showComposer = forceComposerState ?? !!args?.openComposer;
        } finally {
            loading = false;
        }
    }

    async function loadNextPage() {
        if (loadingMore || loading || !canLoadMore || !args?.id) return;
        loadingMore = true;
        try {
            const nextPage = page + 1;
            const data = await fetchCommentsPage({
                type: getType(),
                entityId: args.id,
                page: nextPage,
                sort: 1,
            }).catch(() => ({ content: [] }));
            const content = data?.content || [];
            if (!content.length) {
                canLoadMore = false;
            } else {
                comments = comments.concat(content);
                page = nextPage;
            }
        } finally {
            loadingMore = false;
        }
    }

    async function scrollEvent(e) {
        if (e.currentTarget.scrollTop >= e.currentTarget.scrollHeight - e.currentTarget.clientHeight - 1200) {
            await loadNextPage();
        }
    }

    async function submitComment(event) {
        if (!anixApi.client.token) {
            dispatch("updateComponent", AuthPlaceholder);
            return;
        }

        submitting = true;
        try {
            await addComment({
                type: getType(),
                entityId: args.id,
                message: event.detail.message,
                spoiler: event.detail.spoiler,
            });
            await loadInitial(false);
        } finally {
            submitting = false;
        }
    }

    $: modalKey = showed && args?.id ? `${getType()}:${args.id}:${args?.openComposer ? 1 : 0}` : null;
    $: if (!showed) {
        initializedKey = null;
    }
    $: if (modalKey && modalKey !== initializedKey) {
        initializedKey = modalKey;
        loadInitial();
    }
</script>

{#if showed}
    <div class="modal-title">Комментарии</div>
    <div class="modal-content" class:full-content={loading} on:scroll={scrollEvent}>
        <div class="comment-header flex-row">
            <div class="comment-meta flex-column">
                <span class="comment-subtitle">Всего комментариев: {loading ? "..." : totalCount}</span>
            </div>
            <button
                class="add-comment-button"
                on:click={() => {
                    if (anixApi.client.token) {
                        showComposer = !showComposer;
                    } else {
                        dispatch("updateComponent", AuthPlaceholder);
                    }
                }}
            >
                {showComposer ? "Скрыть форму" : "Оставить комментарий"}
            </button>
        </div>

        {#if showComposer}
            <CommentComposer
                submitLabel={submitting ? "Отправка..." : "Отправить"}
                disabled={submitting}
                on:submit={submitComment}
                on:cancel={() => (showComposer = false)}
            />
        {/if}

        {#if loading}
            <div class="center"><Preloader /></div>
        {:else if comments.length === 0}
            <div class="empty-state">Комментариев пока нет</div>
        {:else}
            {#each comments as d}
                {#if d.parent_comment_id === null || d.parentCommentId === null || d.parent_comment_id === undefined}
                    <CommentItem
                        comment={d}
                        type={getType()}
                        entityId={args.id}
                        on:showAuthModal={() => dispatch("updateComponent", AuthPlaceholder)}
                        on:changed={() => loadInitial(showComposer)}
                    />
                {/if}
            {/each}
        {/if}

        {#if loadingMore}
            <div class="load-more">Загрузка ещё комментариев...</div>
        {/if}
    </div>
{/if}

<style>
    .center {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 280px;
    }

    .comment-header {
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 12px;
    }

    .comment-subtitle,
    .empty-state,
    .load-more {
        color: var(--secondary-text-color);
    }

    .add-comment-button {
        padding: 10px 14px;
        border-radius: 10px;
        color: white;
        background-color: var(--accent-color, #2563eb);
        font-weight: 600;
    }

    .empty-state,
    .load-more {
        padding: 18px 0;
    }
</style>
