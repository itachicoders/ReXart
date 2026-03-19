<script>
    import LeftReleaseBaseButton from "../components/buttons/LeftReleaseBaseButton.svelte";
    import BaseMainButton from "../components/buttons/BaseMainButton.svelte";
    import Preloader from "../components/gui/Preloader.svelte";
    import RatingGraph from "../components/release/RatingGraph.svelte";
    import BookmarkTypes from "../components/elements/BookmarkTypes.svelte";
    import CommentItem from "../components/elements/CommentItem.svelte";
    import AgeRate from "../components/release/AgeRate.svelte";
    import Slider from "../components/elements/Slider.svelte";
    import RelatedReleases from "../components/release/RelatedReleases.svelte";
    import AnimePoster from "../components/release/AnimePoster.svelte";
    import MinInfo from "../components/release/MinInfo.svelte";
    import LicensedPlatforms from "../components/release/LicensedPlatforms.svelte";
    import AddToCollectionModal from "../components/release/AddToCollectionModal.svelte";
    import DownloadModal from "../components/release/DownloadModal.svelte";
    import BaseModal from "../components/modal/BaseModal.svelte";
    import SelectEpisodes from "../components/release/SelectEpisode.svelte";
    import ViewAllButton from "../components/buttons/ViewAllButton.svelte";
    import CommentsModal from "../components/release/CommentsModal.svelte";
    import MetaInfo from "../components/gui/MetaInfo.svelte";
    import NotFound from "./NotFound.svelte";
    import Icon from "../components/elements/Icon.svelte";
    import FavoriteIcon from "../icons/favorite.svg";
    import PlayIcon from "../icons/play.svg";
    import BookmarkStatsInfo from "../components/profile/BookmarkStatsInfo.svelte";
    import AuthPlaceholder from "./AuthPlaceholder.svelte";
    import NotAvaliable from "./NotAvaliable.svelte";

    export let args;
    const release = anixApi.release.info(args.id, true);

    release.then((data) => {
        discordRPC.setActivity({
            type: 3,
            state: "На странице релиза",
            details: data.release.title_ru.slice(0, 127),
            largeImageKey: "anidesk-transparent",
            largeImageText: "AniDesk - Anixart Client",
            instance: true,
            buttons: [
                {
                    label: "Ссылка на релиз",
                    url: `https://anixart.app/release/${data.release.id}`,
                },
                { label: "Ссылка на клиент", url: "https://anidesk.ds1nc.ru/" },
            ],
        });
    });

    let showSelectEpisodeModal,
        showCommentsModal = false,
        showAddToCollectionModal = false,
        showDownloadModal = false,
        showAuthModal = false,
        showNotAvaliableModal = false,
        openCommentsComposer = false;
    let modalSubTitle = null;

    let isFavorite = false;
    let favoriteCount = 0;
    let collectionCount = 0;
    let toastMessage = "";
    let toastTimer = null;
    let initializedReleaseId = null;

    async function setFavorite(i) {
        isFavorite
            ? anixApi.release.removeFavorite(args.id)
            : anixApi.release.addFavorite(args.id);

        changeFavorite(i);
        setFavoriteCount(i ? favoriteCount + 1 : favoriteCount - 1);
    }

    function setFavoriteCount(i) {
        favoriteCount = i;
    }

    function setCollectionCount(i) {
        collectionCount = i ?? 0;
    }

    function changeFavorite(i) {
        isFavorite = i;
    }

    function syncReleaseState(releaseInfo) {
        if (!releaseInfo || initializedReleaseId === releaseInfo.id) return;

        initializedReleaseId = releaseInfo.id;
        setFavoriteCount(releaseInfo.favorites_count ?? 0);
        changeFavorite(releaseInfo.is_favorite ?? false);
        setCollectionCount(releaseInfo.collection_count ?? 0);
    }

    function showToast(message) {
        toastMessage = message;

        if (toastTimer) {
            clearTimeout(toastTimer);
        }

        toastTimer = setTimeout(() => {
            toastMessage = "";
            toastTimer = null;
        }, 2200);
    }

    async function copyReleaseLink(releaseId) {
        try {
            await navigator.clipboard.writeText(`https://anixart.app/release/${releaseId}`);
            showToast("Ссылка на релиз скопирована.");
        } catch (error) {
            console.error("Не удалось скопировать ссылку на релиз:", error);
            showToast("Не удалось скопировать ссылку.");
        }
    }

    function openRelatedPage(related, currentRelease) {
        if (!related?.id) return;

        updateViewportComponent(14, {
            id: related.id,
            name_ru: related.name_ru ?? related.name,
            description: related.description ?? currentRelease?.description,
            image: related.image ?? currentRelease?.image ?? "",
        });
    }

    function openCollectionsPage(currentRelease) {
        updateViewportComponent(15, {
            id: currentRelease.id,
            title: currentRelease.title_ru,
            count: collectionCount,
        });
    }

    function handleCollectionAdded(payload) {
        if (payload?.countDelta) {
            collectionCount += payload.countDelta;
        }

        if (payload?.message) {
            showToast(payload.message);
        }
    }

    function returnSoonText(release) {
        if (release.aired_on_date != 0) {
            const d = new Date(release.aired_on_date * 1000);
            return `${d.getDate()} ${d.toLocaleDateString("ru-RU", { month: "short" })}. ${d.getFullYear()} год.`;
        }

        if (release.year)
            return `${utils.seasons[release.season] !== null ? `${utils.seasons[release.season]}, ` : ""}${release.year} г.`;

        return "Скоро";
    }
</script>

{#await release}
    <Preloader />
{:then r}
    {#if r.release == null || r.code == 2}
        <NotFound />
    {:else}
        {syncReleaseState(r.release)}
        {#key modalSubTitle}
            <MetaInfo
                subTitle={modalSubTitle === null
                    ? r.release.title_ru
                    : `${modalSubTitle} | ${r.release.title_ru}`}
            />
        {/key}
        <div class="release flex-row" tabindex="-1">
            <div
                tabindex="-1"
                class="left-info-release hide-scroll flex-column"
                on:mouseenter={() => {
                    document
                        .querySelector(".left-info-release")
                        .classList.remove("hide-scroll");
                }}
                on:mouseleave={() => {
                    document
                        .querySelector(".left-info-release")
                        .classList.add("hide-scroll");
                }}
            >
                <AnimePoster
                    size={{ width: 387, height: 567 }}
                    posterInfo={{
                        poster: r.release.image,
                        title: r.release.title_ru,
                    }}
                    shadow={true}
                    borderRadius={20}
                />
                {#if r.release.is_view_blocked}
                    <LeftReleaseBaseButton
                        text="Недоступно"
                        onClickCallback={null}
                        btnType="blocked"
                    />
                {:else if !r.release.episodes_released}
                    <LeftReleaseBaseButton
                        text={returnSoonText(r.release)}
                        onClickCallback={null}
                        btnType="soon"
                    />
                {:else}
                    <LeftReleaseBaseButton
                        text="Воспроизвести"
                        onClickCallback={() => (showSelectEpisodeModal = true)}
                        btnType="play"
                    >
                        <Icon
                            src={PlayIcon}
                            size={{ width: 28, height: 28 }}
                            varColor="--background-color"
                        />
                    </LeftReleaseBaseButton>
                {/if}
                <LeftReleaseBaseButton
                    bookmarkType={r.release.profile_list_status ?? 0}
                    btnType="bookmark"
                    release={r.release}
                    on:showAuthModal={() => (showAuthModal = true)}
                ></LeftReleaseBaseButton>
                <LeftReleaseBaseButton
                    text={favoriteCount}
                    onClickCallback={() => {
                        if (anixApi.client.token) {
                            isFavorite ? setFavorite(false) : setFavorite(true);
                        } else {
                            showAuthModal = true;
                        }
                    }}
                    btnType="favorite"
                    favorite={isFavorite}
                >
                    <Icon
                        src={FavoriteIcon}
                        varColor={isFavorite
                            ? "--hold-on-color"
                            : "--main-text-color"}
                        size={{ width: 22, height: 28 }}
                    />
                </LeftReleaseBaseButton>

                {#if r.release.status?.id !== 3}
                    <div class="rating-container flex-row">
                        <div class="rate-text">
                            <span class="rating-text">Рейтинг</span>
                            <span class="rate"
                                >{r.release.grade.toFixed(2)}</span
                            >
                            <div class="rate-vote-text">
                                <span class="rating-votes"
                                    >{r.release.vote_count}</span
                                > голосов
                            </div>
                        </div>
                        <RatingGraph release={r.release} />
                    </div>
                {/if}
                <div class="bookmarks-bar-container">
                    <BookmarkTypes
                        types={{
                            watching: r.release.watching_count,
                            plan: r.release.plan_count,
                            completed: r.release.completed_count,
                            hold_on: r.release.hold_on_count,
                            dropped: r.release.dropped_count,
                        }}
                    />
                </div>
                <BookmarkStatsInfo item={r.release}  size={13} type="grid"/>
            </div>
            <div tabindex="-1" class="right-info-release flex-column">
                <div class="release-title">{r.release.title_ru}</div>
                <div class="release-alt-title">
                    {r.release.title_original}
                    <AgeRate ageRate={r.release.age_rating} />
                </div>
                {#if r.release.note}
                    <div class="release-note flex-column">
                        {@html r.release.note}
                    </div>
                {/if}
                <div class="release-description">{r.release.description}</div>
                <div class="release-actions flex-row">
                    <BaseMainButton
                        style="transparent"
                        borderRadius="10"
                        height={38}
                        currentColorVar="--secondary-text-color"
                        onClickCallback={() => {
                            if (anixApi.client.token) {
                                showAddToCollectionModal = true;
                            } else {
                                showAuthModal = true;
                            }
                        }}
                    >
                        В коллекцию
                    </BaseMainButton>
                    <BaseMainButton
                        style="transparent"
                        borderRadius="10"
                        height={38}
                        currentColorVar="--secondary-text-color"
                        onClickCallback={() => openCollectionsPage(r.release)}
                    >
                        Коллекции · {collectionCount}
                    </BaseMainButton>
                    {#if r.release.related?.id}
                        <BaseMainButton
                            style="transparent"
                            borderRadius="10"
                            height={38}
                            currentColorVar="--secondary-text-color"
                            onClickCallback={() => openRelatedPage(r.release.related, r.release)}
                        >
                            Франшиза
                        </BaseMainButton>
                    {/if}
                    <BaseMainButton
                        style="transparent"
                        borderRadius="10"
                        height={38}
                        currentColorVar="--secondary-text-color"
                        onClickCallback={() => (showDownloadModal = true)}
                    >
                        Скачать
                    </BaseMainButton>
                    <BaseMainButton
                        style="transparent"
                        borderRadius="10"
                        height={38}
                        currentColorVar="--secondary-text-color"
                        onClickCallback={() => copyReleaseLink(r.release.id)}
                    >
                        Поделиться
                    </BaseMainButton>
                </div>
                <div class="flex-row">
                    {#if r.release.screenshot_images.length > 0}
                        <div class="release-images">
                            Кадры
                            <Slider
                                images={r.release.screenshot_images}
                                params={{
                                    id: "release-images-slider",
                                    widthSlider: 880,
                                    heightSlider: 250,
                                    minHeightSlider: 250,
                                    minWidthSlider: 440,
                                    heightImg: 242,
                                    scrollParam: 440,
                                }}
                            />
                        </div>
                    {:else if r.release.related_releases.length > 0}
                        <RelatedReleases
                            release={r.release}
                            on:viewAllCalled={() =>
                                openRelatedPage(r.release.related, r.release)}
                        />
                    {/if}
                    <div class="release-side-info flex-column">
                        <MinInfo release={r.release} />
                        <LicensedPlatforms releaseId={r.release.id} />
                    </div>
                </div>
                {#if r.release.screenshot_images.length > 0 && r.release.related_releases.length > 0}
                    <RelatedReleases
                        release={r.release}
                        on:viewAllCalled={() =>
                            openRelatedPage(r.release.related, r.release)}
                    />
                {/if}
                <div class="release-comments flex-column">
                    <div class="comments-title flex-row">
                        <div class="flex-column">
                            <span>Комментарии</span>
                            <span class="minText">Популярные и актуальные</span>
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
                            <ViewAllButton
                                marginLeft={"0"}
                                width={"220px"}
                                onClickCallback={() => {
                                    openCommentsComposer = false;
                                    showCommentsModal = true;
                                }}
                            />
                        </div>
                    </div>
                    {#each r.release.comments as comment}
                        <CommentItem
                            {comment}
                            type="release"
                            entityId={r.release.id}
                            on:showAuthModal={() => (showAuthModal = true)}
                        />
                    {/each}
                </div>
            </div>
        </div>
        <BaseModal
            modalComponent={SelectEpisodes}
            showed={showSelectEpisodeModal}
            modalSize={{ width: "1000px", height: "580px" }}
            modalArgs={r.release}
            bind:modalTitle={modalSubTitle}
            on:closeModal={() => (showSelectEpisodeModal = false)}
        />
        <BaseModal
            modalComponent={CommentsModal}
            modalSize={{ width: "75%", height: "80%" }}
            showed={showCommentsModal}
            modalArgs={{ id: r.release.id, type: "release", openComposer: openCommentsComposer }}
            bind:modalTitle={modalSubTitle}
            on:closeModal={() => (showCommentsModal = false)}
        />
        <BaseModal
            modalComponent={AddToCollectionModal}
            showed={showAddToCollectionModal}
            modalSize={{ width: "80%", height: "85%" }}
            modalArgs={{ releaseId: r.release.id, onAdded: handleCollectionAdded }}
            bind:modalTitle={modalSubTitle}
            on:closeModal={() => (showAddToCollectionModal = false)}
        />

        <BaseModal
            modalComponent={DownloadModal}
            showed={showDownloadModal}
            modalSize={{ width: "84%", height: "88%" }}
            modalArgs={{
                releaseId: r.release.id,
                releaseTitleRu: r.release.title_ru,
                releaseTitleOriginal: r.release.title_original,
            }}
            bind:modalTitle={modalSubTitle}
            on:closeModal={() => (showDownloadModal = false)}
        />

        <BaseModal
            modalComponent={AuthPlaceholder}
            showed={showAuthModal}
            bind:modalTitle={modalSubTitle}
            modalSize={{ width: "70%", height: "90%" }}
            on:closeModal={() => (showAuthModal = false)}
        />

        {#if toastMessage}
            <div class="release-toast">{toastMessage}</div>
        {/if}

        <BaseModal
            modalComponent={NotAvaliable}
            showed={showNotAvaliableModal}
            bind:modalTitle={modalSubTitle}
            modalSize={{ width: "60%", height: "70%" }}
            on:closeModal={() => (showNotAvaliableModal = false)}
        />
    {/if}
{/await}

<style>

    .release-actions {
        gap: 10px;
        flex-wrap: wrap;
        margin-bottom: 18px;
    }

    .release-toast {
        position: fixed;
        left: calc(75px + 50%);
        bottom: 22px;
        transform: translateX(-50%);
        z-index: 9;
        padding: 12px 18px;
        border-radius: 12px;
        background-color: var(--alt-background-color);
        color: var(--main-text-color);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
        font-size: 14px;
        font-weight: 600;
    }

    :global(.release-minInfo) {
        margin-top: 40px;
        margin-left: auto;
        margin-right: 5px;
    }

    .right-info-release {
        overflow-y: auto;
        padding-top: 20px;
        padding-bottom: 20px;
        padding-right: 20px;
        width: 100%;
    }

    :global(.related-releases) {
        min-width: 530px;
    }

    .bookmarks-bar-container {
        margin-top: 10px;
        margin-right: 6px;
        min-width: 385px;
    }

    .rating-container {
        margin-top: 20px;
        min-width: 390px;
    }

    .rate-text {
        display: flex;
        flex-direction: column;
        margin-left: 4px;
        min-width: 88px;
    }

    :global(.slider) {
        margin-top: 4px;
    }

    .rating-text {
        font-size: 15px;
        color: var(--main-text-color);
        font-weight: 300;
    }

    .rate {
        font-size: 32px;
        color: var(--main-text-color);
        font-weight: bold;
        letter-spacing: 0.5px;
        line-height: 32px;
        margin-top: 5px;
        margin-bottom: 3px;
    }

    .rate-vote-text {
        font-size: 12px;
        color: var(--secondary-text-color);
    }

    .rating-votes {
        font-weight: bold;
    }

    .comments-actions {
        margin-left: auto;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;
    }

    .add-comment-button {
        padding: 10px 14px;
        border-radius: 10px;
        background-color: var(--accent-color, #2563eb);
        color: white;
        font-weight: 600;
    }

    .release-comments {
        margin-top: 10px;
        font-size: 20px;
        font-weight: bold;
        color: var(--main-text-color);
    }

    .minText {
        font-size: 14px;
        font-weight: normal;
        color: var(--secondary-text-color);
    }

    .release-images {
        font-size: 20px;
        font-weight: bold;
        color: var(--main-text-color);
        margin-bottom: 5px;
        margin-right: 50px;
    }

    .release {
        width: 100%;
        height: 100%;
        overflow: hidden;
    }

    .release-note {
        display: flex;
        font-size: 12px;
        color: var(--main-text-color);
        background-color: var(--alt-background-color);
        width: calc(100% - 30px);
        padding: 10px;
        padding-left: 20px;
        border-radius: 10px;
        margin-top: 5px;
        margin-bottom: 10px;
        line-height: 22px;
    }

    .left-info-release img {
        border-radius: 15px;
        object-fit: cover;
    }

    .left-info-release {
        max-width: 388px;
        overflow-y: auto;
        overflow-x: hidden;
        padding-left: 20px;
        padding-top: 20px;
        padding-bottom: 20px;
        display: flex;
        width: fit-content;
        /* flex-wrap: nowrap; */
        min-width: 390px;
        padding-right: 15px;
    }

    .left-info-release::-webkit-scrollbar {
        width: 6px;
        height: 17px;
    }

    .right-info-release {
        margin-left: 20px;
    }

    .release-side-info {
        margin-left: auto;
    }

    .release-title {
        margin-top: 10px;
        font-size: 30px;
        font-weight: bold;
        color: var(--main-text-color);
        margin-bottom: 5px;
    }

    .release-alt-title {
        font-size: 16px;
        font-weight: bold;
        color: var(--secondary-text-color);
        margin-bottom: 5px;
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .release-description {
        font-size: 14px;
        color: var(--main-text-color);
        line-height: 24px;
        margin-bottom: 15px;
    }
</style>
