<script>
    import { createEventDispatcher } from "svelte";

    export let initialMessage = "";
    export let initialSpoiler = false;
    export let placeholder = "Написать комментарий...";
    export let submitLabel = "Отправить";
    export let cancelLabel = "Отмена";
    export let autofocus = false;
    export let compact = false;
    export let mentionLogin = null;
    export let disabled = false;

    const dispatch = createEventDispatcher();

    let message = initialMessage;
    let spoiler = initialSpoiler;

    function submit() {
        const normalized = message.replace(/\n/g, "\r\n").trim();
        if (!normalized || disabled) return;
        dispatch("submit", {
            message: normalized,
            spoiler,
        });
    }
</script>

<div class="composer" class:compact>
    <textarea
        bind:value={message}
        class="composer-textarea"
        rows={compact ? 3 : 5}
        placeholder={placeholder}
        disabled={disabled}
        autofocus={autofocus}
    ></textarea>
    <div class="composer-footer flex-row">
        <label class="spoiler-switch">
            <input type="checkbox" bind:checked={spoiler} disabled={disabled} />
            <span>Спойлер</span>
        </label>
        <div class="composer-actions flex-row">
            <button class="secondary" type="button" on:click={() => dispatch("cancel")} disabled={disabled}>
                {cancelLabel}
            </button>
            <button class="primary" type="button" on:click={submit} disabled={disabled || !message.trim()}>
                {submitLabel}
            </button>
        </div>
    </div>
</div>

<style>
    .composer {
        margin-top: 12px;
        background-color: var(--alt-background-color);
        border-radius: 12px;
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .compact {
        padding: 12px;
    }

    .composer-textarea {
        min-height: 100px;
        resize: vertical;
        width: 100%;
        border: 1px solid var(--border-color, rgba(255,255,255,0.12));
        border-radius: 10px;
        padding: 12px;
        color: var(--main-text-color);
        background-color: var(--background-color);
        font-family: inherit;
        font-size: 14px;
        box-sizing: border-box;
    }

    .compact .composer-textarea {
        min-height: 80px;
    }

    .composer-footer {
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
    }

    .spoiler-switch {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--secondary-text-color);
        font-size: 14px;
    }

    .composer-actions {
        gap: 10px;
        margin-left: auto;
    }

    .composer-actions button {
        border: none;
        border-radius: 8px;
        padding: 10px 14px;
        cursor: pointer;
        color: var(--main-text-color);
        font-weight: 600;
    }

    .composer-actions button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .secondary {
        background-color: transparent;
        border: 1px solid var(--gray-btn);
    }

    .primary {
        background-color: var(--accent-color, #2563eb);
        color: white;
    }
</style>
