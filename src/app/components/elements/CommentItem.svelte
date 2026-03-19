<script>
    import { Lottie } from "lottie-svelte";
    import ProfileAvatar from "../profile/ProfileAvatar.svelte";
    import Icon from "./Icon.svelte";
    import upVoteIcon from "../../icons/upVote.svg";
    import downVoteIcon from "../../icons/downVote.svg";
    import doubleReplyIcon from "../../icons/doubleReply.svg";
    import replyIcon from "../../icons/reply.svg";
    import CommentComposer from "../release/CommentComposer.svelte";
    import {
        addComment,
        deleteComment,
        editComment,
        fetchCommentReplies,
        getCurrentUserId,
        voteCommentRequest,
    } from "../../api/comments.js";
    import { createEventDispatcher } from "svelte";

    export let comment;
    export let type = "release";
    export let entityId = null;
    export let isSubComment = false;
    export let rootComment = null;
    export let refreshRootReplies = null;

    const dispatch = createEventDispatcher();

    let showedReply = false;
    let spoilerView = false;
    let replies = [];
    let loadingReplies = false;
    let replying = false;
    let editing = false;
    let sendingReply = false;
    let savingEdit = false;
    let deleting = false;

    let likesCount = comment.likes_count ?? 0;
    let vote = comment.vote ?? 0;
    let replyCount = comment.reply_count ?? 0;
    let message = comment.message ?? "";
    let isSpoiler = comment.is_spoiler ?? comment.isSpoiler ?? false;
    let isDeleted = comment.is_deleted ?? comment.isDeleted ?? false;
    let isEdited = comment.is_edited ?? comment.isEdited ?? false;
    let hiddenByDefault = !isSubComment && (isSpoiler || likesCount < -5);
    let hidden = hiddenByDefault;

    const currentUserId = Number(getCurrentUserId());
    $: canManage = currentUserId && Number(comment?.profile?.id) === currentUserId;
    $: rootTargetComment = rootComment || comment;

    async function getAllReplies() {
        loadingReplies = true;
        try {
            let totalPages = 1;
            let result = [];

            const firstPage = await fetchCommentReplies({
                type,
                commentId: rootTargetComment.id,
                page: 0,
                sort: 2,
            }).catch(() => ({ content: [], total_page_count: 0 }));

            result = firstPage?.content || [];
            totalPages = firstPage?.total_page_count || 1;

            for (let i = 1; i < totalPages; i++) {
                const page = await fetchCommentReplies({
                    type,
                    commentId: rootTargetComment.id,
                    page: i,
                    sort: 2,
                }).catch(() => ({ content: [] }));
                result = result.concat(page?.content || []);
            }

            replies = result;
        } finally {
            loadingReplies = false;
        }
    }

    async function toggleReplies() {
        showedReply = !showedReply;
        if (showedReply) {
            await getAllReplies();
        }
    }

    async function refreshReplies(forceOpen = false) {
        if (forceOpen) {
            showedReply = true;
        }
        if (showedReply || forceOpen) {
            await getAllReplies();
        }
    }

    async function setVote(nextVote) {
        const prevVote = vote;
        const prevLikes = likesCount;

        likesCount =
            likesCount +
            (vote == 0
                ? nextVote == 2
                    ? 1
                    : -1
                : vote != nextVote && nextVote == 2
                  ? 2
                  : vote == nextVote
                    ? nextVote == 2
                        ? -1
                        : 1
                    : -2);
        vote = vote == nextVote ? 0 : nextVote;

        try {
            await voteCommentRequest({ type, commentId: comment.id, vote: nextVote });
        } catch {
            vote = prevVote;
            likesCount = prevLikes;
        }
    }

    async function submitReply(event) {
        if (!anixApi.client.token) {
            dispatch("showAuthModal");
            return;
        }

        sendingReply = true;
        try {
            await addComment({
                type,
                entityId,
                message: event.detail.message,
                parentCommentId: rootTargetComment.id,
                replyToProfileId: comment.profile.id,
                spoiler: event.detail.spoiler,
            });

            replying = false;
            replyCount += 1;

            if (refreshRootReplies) {
                await refreshRootReplies(true);
            } else {
                await refreshReplies(true);
            }
        } finally {
            sendingReply = false;
        }
    }

    async function submitEdit(event) {
        if (!anixApi.client.token) {
            dispatch("showAuthModal");
            return;
        }

        savingEdit = true;
        try {
            await editComment({
                type,
                commentId: comment.id,
                message: event.detail.message,
                spoiler: event.detail.spoiler,
            });
            message = event.detail.message;
            isSpoiler = event.detail.spoiler;
            isEdited = true;
            hidden = !isSubComment && (isSpoiler || likesCount < -5);
            editing = false;
            dispatch("changed");
        } finally {
            savingEdit = false;
        }
    }

    async function removeComment() {
        if (!anixApi.client.token || deleting) return;
        deleting = true;
        try {
            await deleteComment({ type, commentId: comment.id });
            isDeleted = true;
            message = "Комментарий был удалён.";
            editing = false;
            dispatch("changed");
        } finally {
            deleting = false;
        }
    }
</script>

<div class="comment flex-column" class:subcomment={isSubComment}>
    <div class="comment-author flex-row">
        <div
            class="comment-author-image"
            on:click={() => updateViewportComponent(9, comment.profile.id)}
        >
            <ProfileAvatar
                src={comment.profile.avatar}
                alt={comment.profile.login}
                size={{ width: isSubComment ? 34 : 40, height: isSubComment ? 34 : 40 }}
            />
        </div>
        <div class="comment-author-info flex-row">
            <div class="author-meta flex-column">
                <div
                    class="comment-author-username flex-row"
                    on:click={() => updateViewportComponent(9, comment.profile.id)}
                >
                    {comment.profile.login}
                    {#if comment.profile.badge_url}
                        {#if comment.profile.badge_url.endsWith(".json")}
                            <Lottie src={comment.profile.badge_url} height="20" width="20" />
                        {:else}
                            <img height="20" width="20" src={comment.profile.badge_url} alt={comment.profile.badge_name} />
                        {/if}
                    {/if}
                    {#if comment.profile.is_verified}
                        <div class="verified">
                            <img height="20" width="20" src="./assets/icons/verified.svg" alt="verified" />
                        </div>
                    {/if}
                </div>
                <div class="comment-author-date flex-row">
                    {utils.returnTimeString(comment.timestamp * 1000)}
                    {#if isEdited && !isDeleted}
                        <span class="edited-mark">• изменён</span>
                    {/if}
                </div>
            </div>
            {#if canManage && !isDeleted}
                <div class="comment-manage flex-row">
                    <button on:click={() => (editing = !editing, replying = false)}>Ред.</button>
                    <button class="danger" on:click={removeComment} disabled={deleting}>Удал.</button>
                </div>
            {/if}
        </div>
    </div>
    <div class="comment-message flex-row">
        <div class="comment-like-count flex-column">
            <button
                class="upvote"
                on:click={async () => {
                    if (anixApi.client.token) {
                        await setVote(2);
                    } else {
                        dispatch("showAuthModal");
                    }
                }}
                disabled={isDeleted}
            >
                <Icon src={upVoteIcon} size={{ width: 20, heigth: 12 }} varColor={vote == 2 ? "--good-reputation-color" : "--gray-btn"} />
            </button>
            <span class:like-positive={likesCount > 0} class:like-negative={likesCount < 0}>{likesCount}</span>
            <button
                class="downvote"
                on:click={async () => {
                    if (anixApi.client.token) {
                        await setVote(1);
                    } else {
                        dispatch("showAuthModal");
                    }
                }}
                disabled={isDeleted}
            >
                <Icon src={downVoteIcon} size={{ width: 20, heigth: 12 }} varColor={vote == 1 ? "--bad-reputation-color" : "--gray-btn"} />
            </button>
        </div>
        <div class="comment-msg flex-column">
            <div class="comment-text flex-row">
                {#if hidden && !spoilerView && !isDeleted}
                    <button class="comment-spoiler flex-column" on:click={() => (spoilerView = true)}>
                        <div class="spoiler-text flex-column">
                            <span>{likesCount < -5 ? "У комментария слишком низкий рейтинг" : "Данный комментарий содержит спойлер"}</span>
                            <span class="spoiler-subtitle">Для просмотра нажмите здесь</span>
                        </div>
                    </button>
                {/if}
                <span class="message-text" class:spoiler-blur={hidden && !spoilerView && !isDeleted}>{isDeleted ? "Комментарий был удалён." : message}</span>
            </div>

            {#if editing && !isDeleted}
                <CommentComposer
                    compact={true}
                    initialMessage={message}
                    initialSpoiler={isSpoiler}
                    submitLabel={savingEdit ? "Сохранение..." : "Сохранить"}
                    disabled={savingEdit}
                    placeholder="Изменить комментарий..."
                    on:submit={submitEdit}
                    on:cancel={() => (editing = false)}
                />
            {/if}

            {#if !editing && !isDeleted}
                <div class="comment-actions flex-row">
                    <button
                        class="reply-button"
                        on:click={() => {
                            if (anixApi.client.token) {
                                replying = !replying;
                                editing = false;
                            } else {
                                dispatch("showAuthModal");
                            }
                        }}
                    >
                        <Icon src={replyIcon} size={{ width: 14, heigth: 11 }} varColor="--light-gray" />
                        Ответить
                    </button>

                    {#if !isSubComment && replyCount > 0}
                        <button class="comment-reply-count" on:click={toggleReplies}>
                            <Icon src={doubleReplyIcon} size={{ width: 18, heigth: 18 }} varColor="--light-gray" />
                            {showedReply ? "Скрыть" : "Показать"}
                            {replyCount}
                            {utils.getNumericWord(replyCount, ["ответ", "ответа", "ответов"])}
                        </button>
                    {/if}
                </div>
            {/if}

            {#if replying && !isDeleted}
                <CommentComposer
                    compact={true}
                    initialMessage={`${comment.profile.login}, `}
                    submitLabel={sendingReply ? "Отправка..." : "Ответить"}
                    disabled={sendingReply}
                    placeholder="Написать ответ..."
                    on:submit={submitReply}
                    on:cancel={() => (replying = false)}
                />
            {/if}

            {#if showedReply}
                <div class="comment-replies flex-column">
                    {#if loadingReplies}
                        <div class="reply-loading">Загрузка ответов...</div>
                    {/if}
                    {#each replies as reply}
                        <svelte:self
                            comment={reply}
                            {type}
                            {entityId}
                            isSubComment={true}
                            rootComment={rootTargetComment}
                            refreshRootReplies={refreshRootReplies || refreshReplies}
                            on:showAuthModal={() => dispatch("showAuthModal")}
                            on:changed={() => dispatch("changed")}
                        />
                    {/each}
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    .verified {
        display: flex;
        align-content: center;
    }

    .comment-spoiler {
        position: absolute;
        left: -15px;
        top: -10px;
        background-color: var(--comment-spoiler-color);
        width: calc(100% + 20px);
        justify-content: center;
        align-items: center;
        border-radius: 15px;
        min-height: 40px;
        z-index: 2;
        height: calc(100% + 20px);
    }

    .comment-text {
        position: relative;
        color: var(--main-text-color);
        min-height: 24px;
    }

    .message-text {
        white-space: break-spaces;
    }

    .spoiler-blur {
        filter: blur(8px);
    }

    .comment-replies {
        margin-top: 10px;
        padding-left: 12px;
        border-left: 2px solid rgba(255, 255, 255, 0.08);
        gap: 4px;
    }

    .spoiler-subtitle {
        color: var(--secondary-text-color);
    }

    .comment-msg {
        width: 100%;
    }

    .comment-actions {
        margin-top: 12px;
        gap: 14px;
        flex-wrap: wrap;
        align-items: center;
    }

    .reply-button,
    .comment-reply-count,
    .comment-manage button {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        cursor: pointer;
        color: var(--main-text-color);
        background: transparent;
    }

    .comment-manage {
        margin-left: auto;
        gap: 8px;
    }

    .comment-manage button {
        color: var(--secondary-text-color);
        font-size: 13px;
    }

    .comment-manage .danger {
        color: var(--bad-reputation-color);
    }

    .comment {
        margin-top: 10px;
        margin-bottom: 10px;
        padding: 14px 0;
    }

    .subcomment {
        margin-top: 0;
        margin-bottom: 0;
        padding-bottom: 6px;
    }

    .comment-author-info {
        align-items: flex-start;
        width: 100%;
    }

    .comment-author {
        object-fit: cover;
    }

    .comment-author-image {
        margin-right: 10px;
        margin-bottom: 8px;
        cursor: pointer;
    }

    .comment-message {
        font-size: 14px;
        color: var(--main-text-color);
        font-weight: 400;
    }

    .comment-like-count {
        width: 40px;
        min-width: 40px;
        margin-right: 15px;
        align-items: center;
        display: flex;
        flex-direction: column;
    }

    .upvote {
        margin-bottom: 5px;
    }

    .downvote {
        margin-top: 5px;
    }

    .like-positive {
        color: var(--good-reputation-color);
    }

    .like-negative {
        color: var(--bad-reputation-color);
    }

    .comment-author-username {
        align-items: center;
        font-size: 16px;
        font-weight: bold;
        color: var(--main-text-color);
        cursor: pointer;
    }

    .comment-author-username img {
        margin-left: 5px;
        margin-right: 2px;
    }

    .comment-author-date {
        align-items: center;
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-top: 4px;
    }

    .edited-mark {
        margin-left: 5px;
    }

    .reply-loading {
        color: var(--secondary-text-color);
        font-size: 13px;
        padding: 8px 0;
    }

    button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
</style>
