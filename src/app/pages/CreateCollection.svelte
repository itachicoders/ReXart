<script>
    import { localStorageWritable } from "@babichjacob/svelte-localstorage";
    import BaseMainButton from "../components/buttons/BaseMainButton.svelte";
    import BaseModal from "../components/modal/BaseModal.svelte";
    import MetaInfo from "../components/gui/MetaInfo.svelte";
    import AuthPlaceholder from "./AuthPlaceholder.svelte";
    import Preloader from "../components/gui/Preloader.svelte";
    import ReleasePickerModal from "../components/collection/ReleasePickerModal.svelte";
    import AvatarCropModal from "../components/profile/AvatarCropModal.svelte";
    import {
        createCollection,
        editCollection,
        fetchCollectionInfo,
        fetchCollectionReleasesPage,
        uploadCollectionImage,
    } from "../api/collections.js";

    export let args = {};

    let utoken;
    const userToken = localStorageWritable("user_token", null);
    userToken.subscribe((value) => (utoken = JSON.parse(value)));

    let isEdit = args?.mode === "edit";
    let loading = isEdit;
    let saving = false;
    let title = "";
    let description = "";
    let isPrivate = false;
    let coverPreview = null;
    let releases = [];
    let showPickerModal = false;
    let showCropModal = false;
    let cropSource = null;
    let fileInput;
    let editInitialized = false;
    let editLoadingStarted = false;

    async function loadEditState() {
        if (!isEdit || !args?.id || !utoken) {
            loading = false;
            return;
        }

        loading = true;

        editLoadingStarted = true;

        try {
            const info = await fetchCollectionInfo(args.id);
            title = info?.collection?.title ?? "";
            description = info?.collection?.description ?? "";
            isPrivate = !!info?.collection?.is_private;
            coverPreview = info?.collection?.image ?? null;

            let page = 0;
            let canLoad = true;
            let loaded = [];

            while (canLoad && page < 4) {
                const pageData = await fetchCollectionReleasesPage(args.id, page);
                const content = pageData?.content ?? [];
                if (content.length === 0) {
                    canLoad = false;
                } else {
                    loaded = loaded.concat(content);
                    page += 1;
                }
            }

            releases = loaded;
            editInitialized = true;
        } finally {
            loading = false;
        }
    }

    $: if (utoken && isEdit && loading && !editInitialized && !editLoadingStarted) {
        loadEditState();
    }

    $: if (!isEdit) {
        loading = false;
    }

    function openFilePicker() {
        fileInput?.click();
    }

    function onCoverSelected(event) {
        const file = event.currentTarget.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            cropSource = reader.result;
            showCropModal = true;
        };
        reader.readAsDataURL(file);
        event.currentTarget.value = "";
    }

    function addRelease(release) {
        if (releases.find((item) => item.id === release.id)) return;
        releases = [release, ...releases];
    }

    function removeRelease(releaseId) {
        releases = releases.filter((item) => item.id !== releaseId);
    }

    async function saveCollection() {
        if (saving) return;
        if (title.trim().length < 3 || releases.length === 0) return;

        saving = true;

        editLoadingStarted = true;

        try {
            const payload = {
                title: title.trim(),
                description: description.trim(),
                is_private: isPrivate,
                releases: releases.map((item) => item.id),
            };

            const response = isEdit
                ? await editCollection(args.id, payload)
                : await createCollection(payload);

            const collectionId = response?.collection?.id ?? args.id;

            if (coverPreview && !String(coverPreview).startsWith("http")) {
                await uploadCollectionImage(collectionId, coverPreview);
            }

            updateViewportComponent(12, { id: collectionId });
        } finally {
            saving = false;
        }
    }
</script>

<MetaInfo subTitle={isEdit ? "Редактирование коллекции" : "Создание коллекции"} />

{#if !utoken}
    <AuthPlaceholder />
{:else if loading}
    <Preloader />
{:else}
    <div class="collection-editor flex-column">
        <div class="collection-editor-header flex-row">
            <div class="collection-editor-cover flex-column">
                {#if coverPreview}
                    <img src={coverPreview} alt="cover-preview" />
                {:else}
                    <div class="cover-placeholder">Обложка коллекции</div>
                {/if}
                <BaseMainButton style="transparent" borderRadius={10} onClickCallback={openFilePicker}>
                    {coverPreview ? "Изменить обложку" : "Выбрать обложку"}
                </BaseMainButton>
                <input bind:this={fileInput} type="file" accept="image/*" hidden on:change={onCoverSelected} />
            </div>

            <div class="collection-editor-main flex-column">
                <label class="editor-field flex-column">
                    <span>Название</span>
                    <input class="editor-input" bind:value={title} placeholder="Например, Лучшие вечерние онгоинги" />
                </label>
                <label class="editor-field flex-column">
                    <span>Описание</span>
                    <textarea class="editor-input editor-textarea" bind:value={description} placeholder="Опишите идею коллекции"></textarea>
                </label>
                <label class="checkbox-line flex-row">
                    <input type="checkbox" bind:checked={isPrivate} />
                    <span>Сделать коллекцию приватной</span>
                </label>
                <div class="editor-actions flex-row">
                    <BaseMainButton style="transparent" borderRadius={10} onClickCallback={() => updateViewportComponent(3)}>
                        К списку коллекций
                    </BaseMainButton>
                    <BaseMainButton style="primary" borderRadius={10} isLoading={saving} disabled={title.trim().length < 3 || releases.length === 0} onClickCallback={saveCollection}>
                        {isEdit ? "Сохранить изменения" : "Создать коллекцию"}
                    </BaseMainButton>
                </div>
            </div>
        </div>

        <div class="selected-releases flex-column">
            <div class="selected-header flex-row">
                <div class="flex-column">
                    <span class="section-title">Релизы в коллекции</span>
                    <span class="section-subtitle">Добавьте хотя бы один релиз и при необходимости измените порядок вручную.</span>
                </div>
                <BaseMainButton style="primary" borderRadius={10} onClickCallback={() => (showPickerModal = true)}>
                    Добавить релизы
                </BaseMainButton>
            </div>

            {#if releases.length === 0}
                <div class="release-empty">Пока релизы не добавлены.</div>
            {:else}
                {#each releases as release}
                    <div class="selected-release-row flex-row">
                        <div class="selected-release-text flex-column">
                            <span class="selected-release-title">{release.title_ru}</span>
                            <span class="selected-release-meta">{utils.returnEpisodeString(release)} эп. · {release.grade?.toFixed?.(2) ?? "0.00"} ★</span>
                        </div>
                        <div class="selected-release-actions flex-row">
                            <BaseMainButton style="transparent" borderRadius={10} onClickCallback={() => updateViewportComponent(8, { id: release.id })}>
                                Открыть
                            </BaseMainButton>
                            <BaseMainButton style="transparent" borderRadius={10} currentColorVar="--secondary-text-color" onClickCallback={() => removeRelease(release.id)}>
                                Удалить
                            </BaseMainButton>
                        </div>
                    </div>
                {/each}
            {/if}
        </div>
    </div>

    <BaseModal
        modalComponent={ReleasePickerModal}
        showed={showPickerModal}
        modalSize={{ width: "80%", height: "80%" }}
        modalArgs={{
            selectedIds: releases.map((item) => item.id),
            onAdd: addRelease,
        }}
        on:closeModal={() => (showPickerModal = false)}
    />

    <BaseModal
        modalComponent={AvatarCropModal}
        showed={showCropModal}
        modalSize={{ width: "78%", height: "84%" }}
        modalArgs={{
            imageDataUrl: cropSource,
            title: "Обрезать обложку",
            aspectRatio: 16 / 9,
            width: 1280,
            height: 720,
            onSave: (payload) => {
                coverPreview = payload?.dataUrl ?? payload;
            },
        }}
        on:closeModal={() => (showCropModal = false)}
    />
{/if}

<style>
    .collection-editor {
        max-width: 1280px;
        margin: 30px auto;
        gap: 24px;
    }

    .collection-editor-header {
        gap: 24px;
        align-items: flex-start;
    }

    .collection-editor-cover {
        gap: 14px;
        width: 420px;
    }

    .collection-editor-cover img,
    .cover-placeholder {
        width: 100%;
        aspect-ratio: 16 / 9;
        border-radius: 18px;
        object-fit: cover;
        background-color: var(--alt-background-color);
    }

    .cover-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--secondary-text-color);
    }

    .collection-editor-main,
    .selected-releases {
        gap: 16px;
        width: 100%;
    }

    .editor-field {
        gap: 8px;
    }

    .editor-field > span,
    .section-title {
        color: var(--main-text-color);
        font-weight: 600;
    }

    .editor-input {
        min-height: 42px;
        padding: 10px 14px;
        border-radius: 12px;
        border: 1px solid var(--rate-back-color);
        background-color: var(--alt-background-color);
        color: var(--main-text-color);
    }

    .editor-textarea {
        min-height: 170px;
        resize: vertical;
    }

    .checkbox-line {
        gap: 10px;
        align-items: center;
        color: var(--main-text-color);
    }

    .editor-actions,
    .selected-header,
    .selected-release-actions {
        justify-content: space-between;
        gap: 12px;
        align-items: center;
    }

    .section-subtitle,
    .release-empty,
    .selected-release-meta {
        color: var(--secondary-text-color);
    }

    .selected-release-row {
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        border-radius: 14px;
        background-color: var(--alt-background-color);
        padding: 14px 18px;
    }

    .selected-release-title {
        color: var(--main-text-color);
        font-size: 18px;
        font-weight: 600;
    }
</style>
