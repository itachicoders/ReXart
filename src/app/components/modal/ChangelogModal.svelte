<script>
    import BaseMainButton from "../buttons/BaseMainButton.svelte";
    import { createEventDispatcher } from "svelte";

    export let args = {};

    const dispatch = createEventDispatcher();

    const changelog = args?.data ?? null;

    function closeModal() {
        dispatch("closeModal");
    }
</script>

{#if changelog}
    <div class="modal-title">{changelog.title}</div>

    <div class="modal-content changelog-content">
        <div class="changelog-meta">
            <div class="changelog-version">Версия: {changelog.version}</div>
            {#if changelog.date}
                <div class="changelog-date">{changelog.date}</div>
            {/if}
        </div>

        {#each changelog.sections as section}
            <div class="changelog-section flex-column">
                <div class="changelog-section-title">{section.title}</div>

                <ul class="changelog-list">
                    {#each section.items as item}
                        <li>{item}</li>
                    {/each}
                </ul>
            </div>
        {/each}

        <div class="changelog-actions flex-row">
            <BaseMainButton
                style="primary"
                borderRadius={10}
                onClickCallback={closeModal}
            >
                Понятно
            </BaseMainButton>
        </div>
    </div>
{:else}
    <div class="modal-title">Журнал изменений</div>

    <div class="modal-content changelog-content">
        <div class="changelog-empty">
            Нет данных для отображения.
        </div>

        <div class="changelog-actions flex-row">
            <BaseMainButton
                style="primary"
                borderRadius={10}
                onClickCallback={closeModal}
            >
                Закрыть
            </BaseMainButton>
        </div>
    </div>
{/if}

<style>
    .changelog-content {
        gap: 18px;
    }

    .changelog-meta {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .changelog-version,
    .changelog-date {
        color: var(--secondary-text-color);
        font-size: 14px;
    }

    .changelog-section {
        gap: 10px;
        border-radius: 16px;
        background-color: var(--alt-background-color);
        padding: 16px 18px;
    }

    .changelog-section-title {
        color: var(--main-text-color);
        font-size: 18px;
        font-weight: 700;
    }

    .changelog-list {
        margin: 0;
        padding-left: 20px;
        color: var(--main-text-color);
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .changelog-actions {
        justify-content: flex-end;
        margin-top: auto;
    }

    .changelog-empty {
        color: var(--secondary-text-color);
        font-size: 14px;
    }
</style>
