<script>
    import { CHANGELOG_DATA } from "../../changelog.js";
    import BaseMainButton from "../buttons/BaseMainButton.svelte";
    import { createEventDispatcher } from "svelte";

    export let args = {};

    const dispatch = createEventDispatcher();
</script>

<div class="modal-title">{args?.title ?? CHANGELOG_DATA.title}</div>
<div class="modal-content changelog-content">
    <div class="changelog-version">Версия: {args?.version ?? CHANGELOG_DATA.version}</div>

    {#each CHANGELOG_DATA.sections as section}
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
        <BaseMainButton style="primary" borderRadius={10} onClickCallback={() => dispatch("closeModal")}>
            Закрыть
        </BaseMainButton>
    </div>
</div>

<style>
    .changelog-content {
        gap: 18px;
    }

    .changelog-version {
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
</style>
