<script>
    import AnimeColumnCard from "../elements/AnimeColumnCard.svelte";
    import Preloader from "../gui/Preloader.svelte";
    import { fetchSchedule } from "../../api/discovery.js";

    const schedule = fetchSchedule();

    const DAYS = [
        { key: "monday", label: "Понедельник" },
        { key: "tuesday", label: "Вторник" },
        { key: "wednesday", label: "Среда" },
        { key: "thursday", label: "Четверг" },
        { key: "friday", label: "Пятница" },
        { key: "saturday", label: "Суббота" },
        { key: "sunday", label: "Воскресенье" },
    ];
</script>

<div class="modal-title">Расписание</div>
<div class="modal-content schedule-content">
    {#await schedule}
        <Preloader />
    {:then data}
        {#each DAYS as day}
            <div class="schedule-section flex-column">
                <span class="schedule-day">{day.label}</span>
                {#if (data?.[day.key]?.length ?? 0) === 0}
                    <div class="schedule-empty">Нет релизов на этот день.</div>
                {:else}
                    <div class="schedule-row flex-row">
                        {#each data[day.key] as release}
                            <div class="schedule-card">
                                <AnimeColumnCard anime={release} />
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        {/each}
    {/await}
</div>

<style>
    .schedule-content {
        gap: 20px;
    }

    .schedule-section {
        gap: 10px;
    }

    .schedule-day {
        color: var(--main-text-color);
        font-size: 22px;
        font-weight: 600;
    }

    .schedule-row {
        gap: 12px;
        overflow-x: auto;
    }

    .schedule-card {
        min-width: 210px;
    }

    .schedule-empty {
        color: var(--secondary-text-color);
    }
</style>
