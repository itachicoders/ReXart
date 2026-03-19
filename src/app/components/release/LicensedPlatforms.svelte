<script>
    import { fetchLicensedPlatforms } from "../../api/release.js";

    export let releaseId;

    let platforms = fetchLicensedPlatforms(releaseId).catch(() => ({ content: [] }));
</script>

{#await platforms}
{:then data}
    {#if data?.content?.length > 0}
        <div class="licensed-platforms flex-column">
            <span class="licensed-title">Легальный просмотр</span>
            <div class="licensed-grid">
                {#each data.content as item}
                    <button class="licensed-item flex-row" on:click={() => winApi.openLink(item.url)}>
                        <img class="licensed-icon" src={item.icon} alt={item.name} width="26" height="26" />
                        <span>{item.name}</span>
                    </button>
                {/each}
            </div>
        </div>
    {/if}
{/await}

<style>
    .licensed-platforms {
        max-width: 433px;
        margin-top: 18px;
        gap: 12px;
    }

    .licensed-title {
        font-size: 18px;
        font-weight: 700;
        color: var(--main-text-color);
    }

    .licensed-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
    }

    .licensed-item {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        min-height: 46px;
        padding: 10px 12px;
        border-radius: 14px;
        background-color: var(--alt-background-color);
        color: var(--main-text-color);
        transition: background-color 0.2s ease;
        text-align: left;
    }

    .licensed-item:hover {
        background-color: var(--select-button-color);
    }

    .licensed-icon {
        border-radius: 999px;
        object-fit: cover;
    }
</style>
