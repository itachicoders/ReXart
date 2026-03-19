<script>
    import Cropper from "cropperjs";
    import "cropperjs/dist/cropper.css";
    import { createEventDispatcher, onDestroy, tick } from "svelte";
    import BaseMainButton from "../buttons/BaseMainButton.svelte";

    export let args = {};

    const dispatch = createEventDispatcher();

    let cropper = null;
    let imageElement = null;
    let stageElement = null;
    let isSaving = false;
    let initializedImage = null;
    let currentImageDataUrl = null;
    let imageLoaded = false;
    let saveError = "";

    function destroyCropper() {
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
    }

    function fitCropBox() {
        if (!cropper) {
            return;
        }

        const containerData = cropper.getContainerData();
        const aspectRatio = args?.aspectRatio ?? 1;
        const padding = 24;
        const maxWidth = Math.max(containerData.width - padding * 2, 120);
        const maxHeight = Math.max(containerData.height - padding * 2, 120);

        let cropWidth = maxWidth;
        let cropHeight = cropWidth / aspectRatio;

        if (cropHeight > maxHeight) {
            cropHeight = maxHeight;
            cropWidth = cropHeight * aspectRatio;
        }

        cropper.setCropBoxData({
            width: cropWidth,
            height: cropHeight,
            left: (containerData.width - cropWidth) / 2,
            top: (containerData.height - cropHeight) / 2,
        });
    }

    async function initCropper() {
        const imageDataUrl = args?.imageDataUrl;

        if (!imageDataUrl || !imageElement || !imageLoaded || initializedImage === imageDataUrl) {
            return;
        }

        await tick();

        if (!imageElement?.isConnected) {
            return;
        }

        destroyCropper();

        cropper = new Cropper(imageElement, {
            aspectRatio: args.aspectRatio ?? 1,
            viewMode: 2,
            autoCropArea: 0.9,
            dragMode: "move",
            background: false,
            responsive: true,
            guides: true,
            restore: false,
            center: true,
            checkOrientation: false,
            toggleDragModeOnDblclick: false,
            ready() {
                requestAnimationFrame(() => {
                    fitCropBox();
                    cropper?.center?.();
                });
            },
        });

        initializedImage = imageDataUrl;
        saveError = "";
    }

    function handleImageLoad() {
        imageLoaded = true;
        initCropper();
    }

    function handleImageError() {
        imageLoaded = false;
        destroyCropper();
        saveError = "Не удалось загрузить изображение для редактирования.";
    }

    function handleResize() {
        if (!cropper || !stageElement) {
            return;
        }

        cropper.resize();
        requestAnimationFrame(() => {
            fitCropBox();
        });
    }

    $: if (args?.imageDataUrl !== currentImageDataUrl) {
        currentImageDataUrl = args?.imageDataUrl ?? null;
        initializedImage = null;
        imageLoaded = false;
        saveError = "";
        destroyCropper();
    }

    $: if (args?.imageDataUrl && imageElement && imageLoaded) {
        initCropper();
    }

    onDestroy(() => {
        destroyCropper();
    });

    function closeModal() {
        dispatch("closeModal");
    }

    function canvasToBlob(canvas, mimeType = "image/jpeg", quality = 0.92) {
        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    blob.filename = args?.filename ?? "cropped-image.jpg";
                    resolve(blob);
                } else {
                    reject(new Error("Не удалось подготовить изображение для загрузки."));
                }
            }, mimeType, quality);
        });
    }

    async function saveCrop() {
        if (isSaving) {
            return;
        }

        if (!cropper) {
            saveError = imageLoaded
                ? "Редактор изображения ещё не готов. Попробуйте нажать сохранить ещё раз."
                : "Изображение ещё загружается. Дождитесь его отображения и попробуйте снова.";
            return;
        }

        saveError = "";
        isSaving = true;
        await tick();

        try {
            const canvas = cropper.getCroppedCanvas({
                width: args.width ?? 512,
                height: args.height ?? 512,
                maxWidth: args.width ?? 512,
                maxHeight: args.height ?? 512,
                imageSmoothingQuality: "high",
            });

            if (!canvas) {
                throw new Error("Не удалось получить обрезанное изображение.");
            }

            const blob = await canvasToBlob(canvas, "image/jpeg", args.quality ?? 0.92);
            const dataUrl = canvas.toDataURL("image/jpeg", args.quality ?? 0.92);

            await args?.onSave?.({
                blob,
                dataUrl,
                filename: blob.filename,
                mimeType: blob.type || "image/jpeg",
            });

            closeModal();
        } catch (error) {
            console.error("Ошибка сохранения изображения:", error);
            saveError = error?.data?.message || error?.message || "Не удалось сохранить изображение.";
            args?.onError?.(error);
        } finally {
            isSaving = false;
        }
    }
</script>

<svelte:window on:resize={handleResize} />

<div class="modal-title">{args?.title ?? "Обрезать изображение"}</div>
<div class="modal-content crop-modal-content">
    <div class="crop-stage" bind:this={stageElement}>
        {#if args?.imageDataUrl}
            <img
                bind:this={imageElement}
                src={args.imageDataUrl}
                alt="crop-target"
                class="crop-image"
                on:load={handleImageLoad}
                on:error={handleImageError}
            />
        {:else}
            <div class="crop-empty">Изображение не выбрано</div>
        {/if}
    </div>

    <div class="crop-hint">
        Перемещайте и масштабируйте изображение, затем сохраните результат.
    </div>

    {#if saveError}
        <div class="crop-error">{saveError}</div>
    {/if}

    <div class="crop-actions flex-row">
        <BaseMainButton style="transparent" borderRadius={10} disabled={isSaving} onClickCallback={closeModal}>
            Отменить
        </BaseMainButton>
        <BaseMainButton style="primary" borderRadius={10} isLoading={isSaving} disabled={isSaving} onClickCallback={saveCrop}>
            Сохранить
        </BaseMainButton>
    </div>
</div>

<style>
    .crop-modal-content {
        gap: 18px;
        height: calc(100% - 80px);
        overflow: hidden;
    }

    .crop-stage {
        flex: 1 1 auto;
        min-height: 360px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        border-radius: 16px;
        background-color: rgba(255, 255, 255, 0.02);
    }

    .crop-image {
        display: block;
        max-width: 100%;
        max-height: 100%;
    }

    .crop-stage :global(.cropper-container) {
        width: 100% !important;
        height: 100% !important;
    }

    .crop-stage :global(.cropper-bg) {
        background-image: none;
        background-color: rgba(255, 255, 255, 0.02);
    }

    .crop-empty,
    .crop-hint {
        color: var(--secondary-text-color);
    }

    .crop-error {
        border-radius: 12px;
        border: 1px solid rgba(226, 75, 75, 0.5);
        background-color: rgba(226, 75, 75, 0.08);
        color: #ff8e8e;
        padding: 12px 14px;
        font-size: 14px;
    }

    .crop-actions {
        flex-shrink: 0;
        margin-top: auto;
        gap: 12px;
        justify-content: flex-end;
    }
</style>
