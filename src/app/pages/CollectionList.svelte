<script>
    import { localStorageWritable } from "@babichjacob/svelte-localstorage";
    import CollectionFullRowCard from "../components/elements/CollectionFullRowCard.svelte";
    import Preloader from "../components/gui/Preloader.svelte";
    import DropdownButton from "../components/buttons/DropdownButton.svelte";
    import BaseMainButton from "../components/buttons/BaseMainButton.svelte";
    import MetaInfo from "../components/gui/MetaInfo.svelte";
    import AuthPlaceholder from "./AuthPlaceholder.svelte";

    let utoken;
    const userToken = localStorageWritable("user_token", null);
    userToken.subscribe((value) => (utoken = JSON.parse(value)));

    let page = 0;
    let sort = 4;
    let allData = [];
    let reachedEnd = false;
    let firstData = anixApi.collection.all(page, sort);
    let updateInfo = false;

    async function getCollectionPage() {
        const data =
            sort == 0
                ? await anixApi.collection.getCollectionFavorites(page)
                : await anixApi.collection.all(page, sort);

        if ((data?.content?.length ?? 0) === 0) {
            reachedEnd = true;
        } else {
            allData = allData.concat(data.content);
        }

        updateInfo = false;
    }

    setViewportScrollEvent(async (e) => {
        if (
            reachedEnd ||
            e.srcElement.scrollTop < e.srcElement.scrollHeight - 2000 ||
            updateInfo
        ) {
            return;
        }

        updateInfo = true;
        page++;
        await getCollectionPage();
    });
</script>

<MetaInfo subTitle="Коллекции" />

<div class="button-container flex-row">
    <DropdownButton
        values={utils.collectionSortValues}
        value={sort}
        onChange={(e, v) => {
            sort = v;
            page = 0;
            allData = [];
            reachedEnd = false;
            firstData =
                sort == 0
                    ? anixApi.collection.getCollectionFavorites(page)
                    : anixApi.collection.all(page, sort);
        }}
    />

    {#if utoken}
        <BaseMainButton style="primary" borderRadius={10} onClickCallback={() => updateViewportComponent(16, { mode: "create" })}>
            Создать коллекцию
        </BaseMainButton>
    {/if}
</div>

{#if sort == 0 && !anixApi.client.token}
    <AuthPlaceholder />
{:else}
    {#await firstData}
        <Preloader />
    {:then data}
        {#each data.content as collection}
            <CollectionFullRowCard {collection} />
        {/each}
        {#each allData as collection}
            <CollectionFullRowCard {collection} />
        {/each}
    {/await}
{/if}

<style>
    .button-container {
        margin-top: 20px;
        margin-left: 20px;
        gap: 12px;
        align-items: center;
    }
</style>
