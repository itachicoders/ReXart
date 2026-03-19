<script>
    import { localStorageWritable } from "@babichjacob/svelte-localstorage";
    import BaseMainButton from "../buttons/BaseMainButton.svelte";
    import DropdownButton from "../buttons/DropdownButton.svelte";
    import {
        DISCOVERY_FILTER_DEFAULT,
        DISCOVERY_COUNTRY_OPTIONS,
        DISCOVERY_CATEGORY_OPTIONS,
        DISCOVERY_SEASON_OPTIONS,
        DISCOVERY_STATUS_OPTIONS,
        DISCOVERY_SORT_OPTIONS,
        DISCOVERY_SOURCE_OPTIONS,
        DISCOVERY_PROFILE_LIST_OPTIONS,
        DISCOVERY_AGE_RATING_OPTIONS,
        DISCOVERY_GENRE_GROUPS,
        fetchFilterTypes,
    } from "../../api/discovery.js";

    export let args = {};

    let utoken;
    const userToken = localStorageWritable("user_token", null);
    userToken.subscribe((value) => (utoken = JSON.parse(value)));

    let typesData = [];
    let genresInput = (args?.filter?.genres ?? []).join(", ");
    let workingFilter = {
        ...DISCOVERY_FILTER_DEFAULT,
        ...(args?.filter ?? {}),
    };

    fetchFilterTypes()
        .then((data) => (typesData = data?.types ?? []))
        .catch(() => (typesData = []));

    function toggleArrayValue(key, value) {
        const current = workingFilter[key] ?? [];
        if (current.includes(value)) {
            workingFilter[key] = current.filter((item) => item !== value);
        } else {
            workingFilter[key] = [...current, value];
        }
        workingFilter = { ...workingFilter };
    }

    function toggleGenre(genre) {
        const parts = genresInput
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);

        if (parts.includes(genre)) {
            genresInput = parts.filter((item) => item !== genre).join(", ");
        } else {
            genresInput = [...parts, genre].join(", ");
        }
    }

    function applyFilter() {
        const normalized = {
            ...workingFilter,
            studio: workingFilter.studio?.trim() ? workingFilter.studio.trim() : null,
            genres: genresInput
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
        };

        args?.onApply?.(normalized);
    }

    function resetFilter() {
        workingFilter = { ...DISCOVERY_FILTER_DEFAULT };
        genresInput = "";
    }
</script>

<div class="modal-title">Фильтр</div>
<div class="modal-content filters-content">
    <div class="filters-grid">
        <div class="filter-field flex-column">
            <span>Страна</span>
            <DropdownButton values={DISCOVERY_COUNTRY_OPTIONS} value={workingFilter.country} width={260} onChange={(e, value) => (workingFilter = { ...workingFilter, country: value })} />
        </div>
        <div class="filter-field flex-column">
            <span>Категория</span>
            <DropdownButton values={DISCOVERY_CATEGORY_OPTIONS} value={workingFilter.category_id} width={260} onChange={(e, value) => (workingFilter = { ...workingFilter, category_id: value })} />
        </div>
        <div class="filter-field flex-column">
            <span>Сезон</span>
            <DropdownButton values={DISCOVERY_SEASON_OPTIONS} value={workingFilter.season} width={260} onChange={(e, value) => (workingFilter = { ...workingFilter, season: value })} />
        </div>
        <div class="filter-field flex-column">
            <span>Статус</span>
            <DropdownButton values={DISCOVERY_STATUS_OPTIONS} value={workingFilter.status_id} width={260} onChange={(e, value) => (workingFilter = { ...workingFilter, status_id: value })} />
        </div>
        <div class="filter-field flex-column">
            <span>Сортировка</span>
            <DropdownButton values={DISCOVERY_SORT_OPTIONS} value={workingFilter.sort} width={260} onChange={(e, value) => (workingFilter = { ...workingFilter, sort: value })} />
        </div>
        <div class="filter-field flex-column">
            <span>Первоисточник</span>
            <DropdownButton values={DISCOVERY_SOURCE_OPTIONS} value={workingFilter.source} width={260} onChange={(e, value) => (workingFilter = { ...workingFilter, source: value })} />
        </div>
        <label class="filter-field flex-column">
            <span>Студия</span>
            <input class="filter-input" type="text" bind:value={workingFilter.studio} placeholder="Например, MAPPA" />
        </label>
        <label class="filter-field flex-column">
            <span>Жанры через запятую</span>
            <textarea class="filter-input filter-textarea" bind:value={genresInput} placeholder="экшен, драма, исэкай"></textarea>
        </label>
    </div>

    <div class="genre-groups flex-column">
        <span class="section-title">Быстрый выбор жанров</span>
        {#each DISCOVERY_GENRE_GROUPS as group}
            <div class="genre-group flex-column">
                <span class="genre-group-title">{group.label}</span>
                <div class="chips-row flex-row">
                    {#each group.items as genre}
                        <button
                            class="chip-button"
                            class:chip-selected={genresInput.split(",").map((item) => item.trim()).filter(Boolean).includes(genre)}
                            on:click={() => toggleGenre(genre)}
                        >
                            {genre}
                        </button>
                    {/each}
                </div>
            </div>
        {/each}
    </div>

    <div class="filters-grid compact-grid">
        <label class="filter-field flex-column">
            <span>Год от</span>
            <input class="filter-input" type="number" bind:value={workingFilter.start_year} placeholder="2000" />
        </label>
        <label class="filter-field flex-column">
            <span>Год до</span>
            <input class="filter-input" type="number" bind:value={workingFilter.end_year} placeholder="2026" />
        </label>
        <label class="filter-field flex-column">
            <span>Серий от</span>
            <input class="filter-input" type="number" bind:value={workingFilter.episodes_from} placeholder="1" />
        </label>
        <label class="filter-field flex-column">
            <span>Серий до</span>
            <input class="filter-input" type="number" bind:value={workingFilter.episodes_to} placeholder="24" />
        </label>
        <label class="filter-field flex-column">
            <span>Длительность от (мин.)</span>
            <input class="filter-input" type="number" bind:value={workingFilter.episode_duration_from} placeholder="10" />
        </label>
        <label class="filter-field flex-column">
            <span>Длительность до (мин.)</span>
            <input class="filter-input" type="number" bind:value={workingFilter.episode_duration_to} placeholder="40" />
        </label>
    </div>

    <label class="toggle-row flex-row">
        <input type="checkbox" bind:checked={workingFilter.is_genres_exclude_mode_enabled} />
        <span>Исключать найденные жанры из выдачи</span>
    </label>

    {#if utoken}
        <div class="checkbox-section flex-column">
            <span class="section-title">Исключить из своих списков</span>
            <div class="checkbox-grid">
                {#each DISCOVERY_PROFILE_LIST_OPTIONS as item}
                    <label class="checkbox-item flex-row">
                        <input
                            type="checkbox"
                            checked={workingFilter.profile_list_exclusions.includes(item.value)}
                            on:change={() => toggleArrayValue("profile_list_exclusions", item.value)}
                        />
                        <span>{item.label}</span>
                    </label>
                {/each}
            </div>
        </div>
    {/if}

    <div class="checkbox-section flex-column">
        <span class="section-title">Возрастные рейтинги</span>
        <div class="checkbox-grid">
            {#each DISCOVERY_AGE_RATING_OPTIONS as item}
                <label class="checkbox-item flex-row">
                    <input
                        type="checkbox"
                        checked={workingFilter.age_ratings.includes(item.value)}
                        on:change={() => toggleArrayValue("age_ratings", item.value)}
                    />
                    <span>{item.label}</span>
                </label>
            {/each}
        </div>
    </div>

    {#if typesData.length > 0}
        <div class="checkbox-section flex-column">
            <span class="section-title">Варианты озвучек</span>
            <div class="checkbox-grid">
                {#each typesData as item}
                    <label class="checkbox-item flex-row">
                        <input
                            type="checkbox"
                            checked={workingFilter.types.includes(Number(item.id))}
                            on:change={() => toggleArrayValue("types", Number(item.id))}
                        />
                        <span>{item.name}</span>
                    </label>
                {/each}
            </div>
        </div>
    {/if}

    <div class="filter-actions flex-row">
        <BaseMainButton style="transparent" borderRadius={10} onClickCallback={resetFilter}>
            Сбросить
        </BaseMainButton>
        <BaseMainButton style="primary" borderRadius={10} onClickCallback={applyFilter}>
            Применить
        </BaseMainButton>
    </div>
</div>

<style>
    .filters-content {
        gap: 18px;
    }

    .filters-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
    }

    .compact-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .filter-field {
        gap: 8px;
    }

    .filter-field > span,
    .section-title {
        color: var(--main-text-color);
        font-weight: 600;
    }

    .filter-input {
        min-height: 40px;
        border-radius: 12px;
        border: 1px solid var(--rate-back-color);
        background-color: var(--alt-background-color);
        color: var(--main-text-color);
        padding: 10px 12px;
    }

    .filter-textarea {
        min-height: 84px;
        resize: vertical;
    }

    .genre-groups,
    .checkbox-section {
        gap: 10px;
    }

    .genre-group {
        gap: 8px;
    }

    .genre-group-title {
        color: var(--secondary-text-color);
        font-size: 14px;
    }

    .chips-row {
        flex-wrap: wrap;
        gap: 8px;
    }

    .chip-button {
        padding: 8px 10px;
        border-radius: 999px;
        background-color: var(--alt-background-color);
        color: var(--secondary-text-color);
        border: 1px solid var(--rate-back-color);
    }

    .chip-selected {
        color: var(--main-text-color);
        border-color: var(--select-button-color);
    }

    .checkbox-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px 14px;
    }

    .checkbox-item {
        align-items: center;
        gap: 8px;
        color: var(--main-text-color);
    }

    .toggle-row {
        align-items: center;
        gap: 10px;
        color: var(--main-text-color);
    }

    .filter-actions {
        justify-content: flex-end;
        gap: 12px;
        padding-bottom: 6px;
    }
</style>
