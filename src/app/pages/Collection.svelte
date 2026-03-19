<script>
    import Preloader from "../components/gui/Preloader.svelte";
    import ProfileAvatar from "../components/profile/ProfileAvatar.svelte";
    import AnimeFullRowCard from "../components/elements/AnimeFullRowCard.svelte";
    import { Lottie } from "lottie-svelte";
    import BaseMainButton from "../components/buttons/BaseMainButton.svelte";
    import Icon from "../components/elements/Icon.svelte";
    import BookmarkIcon from "../icons/favorite.svg";
    import CommentIcon from "../icons/comment.svg";
    import AuthPlaceholder from "./AuthPlaceholder.svelte";
    import MetaInfo from "../components/gui/MetaInfo.svelte";
    import BaseModal from "../components/modal/BaseModal.svelte";
    import CommentsModal from "../components/release/CommentsModal.svelte";
    import CommentItem from "../components/elements/CommentItem.svelte";
    import { fetchCommentsPage } from "../api/comments.js";
    import { localStorageWritable } from "@babichjacob/svelte-localstorage";

    export let args;
    let page = 0;
    let allData = [];
    let updateInfo = false;
    let modalSubTitle = null;
    let showAuthModal = false;
    let showCommentsModal = false;
    let openCommentsComposer = false;

    let isFavorite = false;
    let favoriteCount = 0;
    let utoken;

    const userToken = localStorageWritable("user_token", null);
    userToken.subscribe((value) => (utoken = JSON.parse(value)));

    let info = getCollectionInfo();

    async function getCollectionInfo() {
        let base = await anixApi.collection.info(args.id);
        let releases = await anixApi.collection.getCollectionReleases(
            args.id,
            page,
        );

        const comments = await fetchCommentsPage({
            type: "collection",
            entityId: args.id,
            page: 0,
            sort: 1,
        }).catch(() => ({ content: [], total_count: 0 }));

        return {
            info: base,
            releases: releases,
            comments: comments,
        };
    }

    async function getCollectionPage() {
        const data = await anixApi.collection.getCollectionReleases(
            args.id,
            page,
        );
        allData = allData.concat(data.content);
        updateInfo = false;
    }

    function setFavorite(fav) {
        isFavorite = fav;
    }

    function setFavCount(count) {
        favoriteCount = count;
    }

    function updateFavorite() {
        if (anixApi.client.token) {
            if (isFavorite) {
                anixApi.collection.removeCollectionFavorite(args.id);
            } else {
                anixApi.collection.addCollectionFavorite(args.id);
            }
            
            setFavCount(isFavorite ? favoriteCount - 1 : favoriteCount + 1);
            setFavorite(!isFavorite);
        } else {
            showAuthModal = true;
        }
    }

    setViewportScrollEvent(async (e) => {
        if (
            e.srcElement.scrollTop >= e.srcElement.scrollHeight - 2000 &&
            !updateInfo
        ) {
            updateInfo = true;
            page++;
            await getCollectionPage();
        }
    });
</script>

{#await info}
    <Preloader />
{:then c}
    {#key modalSubTitle}
        <MetaInfo
            subTitle={modalSubTitle === null
                ? c.info.collection.title
                : `${modalSubTitle} | ${c.info.collection.title}`}
        />
    {/key}
    {setFavorite(c.info.collection.is_favorite)}
    {setFavCount(c.info.collection.favorites_count)}
    <div class="collection-info flex-column">
        <img
            src={c.info.collection.image}
            class="collection-cover"
            alt="CollectionCover"
        />
        <div class="collection-author flex-row">
            <button
                class="author flex-row"
                on:click={() =>
                    updateViewportComponent(9, c.info.collection.creator.id)}
            >
                <div class="collection-author-image">
                    <ProfileAvatar
                        src={c.info.collection.creator.avatar}
                        alt={c.info.collection.creator.login}
                        size={{ width: 40, height: 40 }}
                    />
                </div>
                <span class="collection-author-name"
                    >{c.info.collection.creator.login}</span
                >
                {#if c.info.collection.creator.badge}
                    {#if c.info.collection.creator.badge.image_url.endsWith(".json")}
                        <div class="lottie-badge">
                            <Lottie
                                path={c.info.collection.creator.badge.image_url}
                                container={document.querySelector(
                                    ".lottie-badge",
                                )}
                                autoplay={true}
                                renderer="svg"
                            />
                        </div>
                    {:else}
                        <img
                            height="20"
                            width="20"
                            src={c.info.collection.creator.badge.image_url}
                            alt={c.info.collection.creator.badge.name}
                        />
                    {/if}
                {/if}
                {#if c.info.collection.creator.is_verified}
                    <div class="verified">
                        <img
                            height="20"
                            width="20"
                            src="./assets/icons/verified.svg"
                            alt="verified"
                        />
                    </div>
                {/if}
            </button>
            <div class="collection-date flex-column">
                <span
                    >Дата создания: {utils.returnTimeString(
                        c.info.collection.creation_date * 1000,
                        true,
                    )}</span
                >
                <span
                    >Дата обновления: {utils.returnTimeString(
                        c.info.collection.last_update_date * 1000,
                        true,
                    )}</span
                >
            </div>
        </div>
        <span class="collection-title">{c.info.collection.title}</span>
        <div class="collection-buttons flex-row">
            <BaseMainButton
                style="transparent"
                currentColorVar={isFavorite
                    ? "--hold-on-color"
                    : "--secondary-text-color"}
                borderRadius="10"
                onClickCallback={() => updateFavorite()}
            >
                <div
                    class="bookmark-btn {isFavorite ? 'favorite' : ''} flex-row"
                >
                    <Icon
                        src={BookmarkIcon}
                        varColor={isFavorite
                            ? "--hold-on-color"
                            : "--secondary-text-color"}
                        size={{ width: 15, height: 15 }}
                    />
                    <span>{favoriteCount}</span>
                </div>
            </BaseMainButton>
            <!--SOON
            <BaseMainButton
                style="transparent"
                borderRadius="10"
                currentColorVar="--secondary-text-color"
            >
                <Icon
                    src={CommentIcon}
                    varColor="--secondary-text-color"
                    size={{ width: 15, height: 15 }}
                />
            </BaseMainButton>
            -->
            {#if c.info.collection.creator.id == utoken?.id}
                <BaseMainButton
                    style="transparent"
                    borderRadius="10"
                    currentColorVar="--secondary-text-color"
                    onClickCallback={() => updateViewportComponent(16, { mode: "edit", id: c.info.collection.id })}
                >
                    Редактировать
                </BaseMainButton>
            {/if}
        </div>
        <span class="collection-description"
            >{c.info.collection.description}</span
        >
    </div>
    <div class="collection-comments flex-column">
        <div class="comments-title flex-row">
            <div class="flex-column">
                <span>Комментарии</span>
                <span class="minText">Обсуждение коллекции</span>
            </div>
            <div class="comments-actions flex-row">
                {#if anixApi.client.token}
                    <button
                        class="add-comment-button"
                        on:click={() => {
                            openCommentsComposer = true;
                            showCommentsModal = true;
                        }}
                    >
                        Оставить комментарий
                    </button>
                {/if}
                <button
                    class="show-all-comments"
                    on:click={() => {
                        openCommentsComposer = false;
                        showCommentsModal = true;
                    }}
                >
                    Показать все
                </button>
            </div>
        </div>
        {#if c.comments?.content?.length > 0}
            {#each c.comments.content.slice(0, 5) as comment}
                <CommentItem
                    {comment}
                    type="collection"
                    entityId={args.id}
                    on:showAuthModal={() => (showAuthModal = true)}
                />
            {/each}
        {:else}
            <div class="empty-comments">Комментариев пока нет</div>
        {/if}
    </div>

    <div class="releases-container">
        <div class="collection-releases flex-column">
            <span class="collection-releases-title"
                >{c.releases.total_count}
                {utils.getNumericWord(c.releases.total_count, [
                    "релиз",
                    "релиза",
                    "релизов",
                ])} в коллекции</span
            >
            {#each c.releases.content as release}
                <AnimeFullRowCard anime={release} />
            {/each}
            {#each allData as release}
                <AnimeFullRowCard anime={release} />
            {/each}
        </div>
    </div>
{/await}

<BaseModal
    modalComponent={AuthPlaceholder}
    showed={showAuthModal}
    bind:modalTitle={modalSubTitle}
    modalSize={{ width: "70%", height: "90%" }}
    on:closeModal={() => (showAuthModal = false)}
/>

<BaseModal
    modalComponent={CommentsModal}
    showed={showCommentsModal}
    modalArgs={{ id: args.id, type: "collection", openComposer: openCommentsComposer }}
    bind:modalTitle={modalSubTitle}
    modalSize={{ width: "75%", height: "80%" }}
    on:closeModal={() => (showCommentsModal = false)}
/>

<style>
    .collection-comments {
        width: 880px;
        margin: 5px auto 25px auto;
    }

    .comments-title {
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 10px;
        flex-wrap: wrap;
    }

    .comments-title > div > span:first-child {
        font-size: 26px;
        font-weight: 600;
        color: var(--main-text-color);
    }

    .minText,
    .empty-comments {
        color: var(--secondary-text-color);
    }

    .comments-actions {
        gap: 10px;
    }

    .add-comment-button,
    .show-all-comments {
        padding: 10px 14px;
        border-radius: 10px;
        color: var(--main-text-color);
        border: 1px solid var(--gray-btn);
        background-color: transparent;
        font-weight: 600;
    }

    .add-comment-button {
        background-color: var(--accent-color, #2563eb);
        color: white;
        border: none;
    }

    .collection-info {
        margin: 10px 20px 30px 20px;
        align-items: center;
    }

    .collection-cover {
        border-radius: 15px;
        height: 500px;
        width: 890px;
        object-fit: cover;
    }

    .collection-author {
        width: 880px;
        margin-top: 20px;
        align-items: center;
        justify-content: space-between;
    }

    .author {
        align-items: center;
        gap: 5px;
    }

    .collection-description {
        width: 880px;
        margin-top: 20px;
        color: var(--secondary-text-color);
        white-space: break-spaces;
    }

    .collection-author-name {
        font-size: 16px;
        font-weight: 600;
        color: var(--main-text-color);
        margin-left: 5px;
    }

    .collection-date {
        align-items: flex-start;
        font-size: 12px;
        color: var(--secondary-text-color);
    }

    .collection-title {
        font-size: 30px;
        font-weight: 600;
        color: var(--main-text-color);
        margin-top: 20px;
    }

    .collection-releases-title {
        margin-left: 20px;
        font-size: 16px;
        font-weight: 600;
        color: var(--main-text-color);
        margin-top: 20px;
    }

    .favorite {
        color: var(--hold-on-color) !important;
    }

    .collection-buttons {
        width: 880px;
        gap: 10px;
        margin-top: 15px;
    }

    .bookmark-btn {
        padding: 10px;
        gap: 5px;
        font-weight: 600;
    }

    .lottie-badge {
        height: 20px;
        width: 20px;
    }

    .collection-releases {
        max-width: 90%;
        min-width: 75%;
    }

    .releases-container {
        width: 100%;
        display: flex;
        justify-content: center;
    }

    .verified {
        display: flex;
        align-content: center;
    }
</style>
