<script>
    export let release;

    function returnFlag(country) {
        switch (country) {
            case "Япония":
                return "./assets/icons/japan.svg";
            case "Китай":
                return "./assets/icons/china.svg";
            default:
                return "./assets/icons/status.svg";
        }
    }

    function splitTags(value) {
        if (!value) return [];

        return String(value)
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }

    function openSearch(query, searchBy = "name") {
        updateViewportComponent(5, {
            query,
            params: {
                where: "releases",
                searchBy,
            },
        });
    }
</script>

<div class="release-minInfo flex-column">
    {#if release.country != "" && release.country != null}
        <div class="release-minInfo-item flex-row">
            <div class="minInfo-icon">
                <img src={returnFlag(release.country)} alt="minInfoIcon" width="37px" height="22px" />
            </div>
            <div class="minInfo-text">
                {release.country}{!release.year ? "" : `, ${release.year} г.`}
            </div>
        </div>
    {/if}

    <div class="release-minInfo-item flex-row">
        <div class="minInfo-icon">
            <img src="./assets/icons/episode.svg" alt="episodes" width="37px" height="22px" />
        </div>
        <div class="minInfo-text">
            {utils.returnEpisodeString(release)} эп. по ~{release.duration} мин.
        </div>
    </div>

    <div class="release-minInfo-item flex-row">
        <div class="minInfo-icon">
            <img src="./assets/icons/status.svg" alt="status" width="37px" height="22px" />
        </div>
        <div class="minInfo-text">
            {release.category.name}{release.status ? `, ${release.status?.name}` : ""}
        </div>
    </div>

    {#if release.studio || release.author || release.director}
        <div class="release-minInfo-item flex-row">
            <div class="minInfo-icon">
                <img src="./assets/icons/studio.svg" alt="studio" width="37px" height="22px" />
            </div>
            <div class="minInfo-text">
                <div class="minInfo-tags-row">
                    {#if release.studio}
                        <button class="search-chip" on:click={() => openSearch(release.studio, "studio")}>Студия {release.studio}</button>
                    {/if}
                    {#if release.author}
                        <button class="search-chip" on:click={() => openSearch(release.author, "author")}>Автор {release.author}</button>
                    {/if}
                    {#if release.director}
                        <button class="search-chip" on:click={() => openSearch(release.director, "director")}>Режиссёр {release.director}</button>
                    {/if}
                </div>
            </div>
        </div>
    {/if}

    {#if release.genres != null && release.genres != ""}
        <div class="release-minInfo-item flex-row genres-row">
            <div class="minInfo-icon">
                <img src="./assets/icons/genres.svg" alt="genres" width="37px" height="22px" />
            </div>
            <div class="minInfo-text">
                <div class="minInfo-tags-row">
                    {#each splitTags(release.genres) as genre}
                        <button class="search-chip" on:click={() => openSearch(genre, "tag")}>{genre}</button>
                    {/each}
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    .release-minInfo {
        max-width: 433px;
        float: right;
    }

    .release-minInfo-item {
        margin-bottom: 8px;
        align-items: flex-start;
    }

    .genres-row {
        margin-top: 2px;
    }

    .minInfo-icon {
        margin-right: 8px;
        min-width: 37px;
        display: flex;
        justify-content: center;
    }

    .minInfo-text {
        color: var(--main-text-color);
        line-height: 1.5;
    }

    .minInfo-tags-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    .search-chip {
        min-height: 32px;
        padding: 6px 12px;
        border-radius: 999px;
        background-color: var(--alt-background-color);
        color: var(--main-text-color);
        font-size: 13px;
        transition: background-color 0.2s ease;
        text-align: left;
    }

    .search-chip:hover {
        background-color: var(--select-button-color);
    }
</style>
