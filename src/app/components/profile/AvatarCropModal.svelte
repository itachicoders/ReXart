<script>
    import Cropper from "cropperjs";
    import "cropperjs/dist/cropper.css";
    import { createEventDispatcher, onDestroy, tick } from "svelte";
    import BaseMainButton from "../buttons/BaseMainButton.svelte";

    export let args = {};

    const dispatch = createEventDispatcher();

    let cropper;
    let imageElement;
    let isSaving = false;
    let initializedImage = null;
    let saveError = "";

    async function initCropper() {
        if (!args?.imageDataUrl || !imageElement || initializedImage === args.imageDataUrl) {
            return;
        }

        initializedImage = args.imageDataUrl;
        await tick();

        if (cropper) {
            cropper.destroy();
        }

        cropper = new Cropper(imageElement, {
            aspectRatio: args.aspectRatio ?? 1,
            viewMode: 1,
            autoCropArea: 1,
            dragMode: "move",
            background: false,
            responsive: true,
            guides: true,
        });

        saveError = "";
    }

    $: if (args?.imageDataUrl) {
        initCropper();
    }

    onDestroy(() => {
        if (cropper) {
            cropper.destroy();
        }
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
        if (!cropper || isSaving) return;

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

<div class="modal-title">{args?.title ?? "Обрезать изображение"}</div>
<div class="modal-content crop-modal-content">
    {#if args?.imageDataUrl}
        <img bind:this={imageElement} src={args.imageDataUrl} alt="crop-target" class="crop-image" />
    {:else}
        <div class="crop-empty">Изображение не выбрано</div>
    {/if}

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
    }

    .crop-image {
        max-width: 100%;
        min-height: 420px;
        object-fit: contain;
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
        margin-top: auto;
        gap: 12px;
        justify-content: flex-end;
    }
</style>
