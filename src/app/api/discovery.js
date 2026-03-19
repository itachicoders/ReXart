import { getCurrentToken, request } from "./request.js";

export const DISCOVERY_FILTER_DEFAULT = {
    country: null,
    season: null,
    sort: 0,
    source: null,
    studio: null,
    age_ratings: [],
    category_id: null,
    end_year: null,
    episode_duration_from: null,
    episode_duration_to: null,
    episodes_from: null,
    episodes_to: null,
    genres: [],
    is_genres_exclude_mode_enabled: false,
    profile_list_exclusions: [],
    start_year: null,
    status_id: null,
    types: [],
};

export const DISCOVERY_COUNTRY_OPTIONS = [
    { label: "Неважно", value: null },
    { label: "Япония", value: "Япония" },
    { label: "Китай", value: "Китай" },
    { label: "Южная Корея", value: "Южная Корея" },
];

export const DISCOVERY_CATEGORY_OPTIONS = [
    { label: "Неважно", value: null },
    { label: "Сериал", value: 1 },
    { label: "Полнометражный фильм", value: 2 },
    { label: "OVA", value: 3 },
    { label: "Дорама", value: 4 },
];

export const DISCOVERY_SEASON_OPTIONS = [
    { label: "Неважно", value: null },
    { label: "Зима", value: 1 },
    { label: "Весна", value: 2 },
    { label: "Лето", value: 3 },
    { label: "Осень", value: 4 },
];

export const DISCOVERY_STATUS_OPTIONS = [
    { label: "Неважно", value: null },
    { label: "Вышел", value: 1 },
    { label: "Выходит", value: 2 },
    { label: "Анонс", value: 3 },
];

export const DISCOVERY_SORT_OPTIONS = [
    { label: "По дате добавления", value: 0 },
    { label: "По рейтингу", value: 1 },
    { label: "По годам", value: 2 },
    { label: "По популярности", value: 3 },
];

export const DISCOVERY_SOURCE_OPTIONS = [
    { label: "Неважно", value: null },
    { label: "Оригинал", value: "Оригинал" },
    { label: "Манга", value: "Манга" },
    { label: "Ранобэ", value: "Ранобэ" },
    { label: "Новелла", value: "Новелла" },
    { label: "Веб-новелла", value: "Веб-новелла" },
    { label: "Визуальная новелла", value: "Визуальная новелла" },
    { label: "Игра", value: "Игра" },
    { label: "Музыка", value: "Музыка" },
    { label: "Другое", value: "Другое" },
];

export const DISCOVERY_PROFILE_LIST_OPTIONS = [
    { label: "Избранное", value: 0 },
    { label: "Смотрю", value: 1 },
    { label: "В планах", value: 2 },
    { label: "Просмотрено", value: 3 },
    { label: "Отложено", value: 4 },
    { label: "Брошено", value: 5 },
];

export const DISCOVERY_AGE_RATING_OPTIONS = [
    { label: "0+", value: 1 },
    { label: "6+", value: 2 },
    { label: "12+", value: 3 },
    { label: "16+", value: 4 },
    { label: "18+", value: 5 },
];

export const DISCOVERY_GENRE_GROUPS = [
    {
        label: "Базовые жанры",
        items: [
            "драма",
            "комедия",
            "повседневность",
            "приключения",
            "романтика",
            "сверхъестественное",
            "спорт",
            "фантастика",
            "фэнтези",
            "экшен",
        ],
    },
    {
        label: "Тематика",
        items: [
            "военное",
            "детектив",
            "исторический",
            "исэкай",
            "магия",
            "музыка",
            "пародия",
            "психологическое",
            "школа",
            "шоу-бизнес",
        ],
    },
];

export const DISCOVERY_POPULAR_PRESETS = [
    {
        id: "ongoing",
        label: "Онгоинги",
        filter: {
            ...DISCOVERY_FILTER_DEFAULT,
            sort: 3,
            episodes_from: 1,
            episodes_to: 48,
            status_id: 2,
        },
    },
    {
        id: "finished",
        label: "Завершённые",
        filter: {
            ...DISCOVERY_FILTER_DEFAULT,
            sort: 3,
            status_id: 1,
        },
    },
    {
        id: "films",
        label: "Фильмы",
        filter: {
            ...DISCOVERY_FILTER_DEFAULT,
            sort: 3,
            category_id: 2,
        },
    },
    {
        id: "ova",
        label: "OVA",
        filter: {
            ...DISCOVERY_FILTER_DEFAULT,
            sort: 3,
            category_id: 3,
        },
    },
];

export async function fetchFilterTypes() {
    return request(`/type/all`, {
        query: {
            token: getCurrentToken(),
        },
    });
}

export async function fetchFilteredReleases(filter = DISCOVERY_FILTER_DEFAULT, page = 0) {
    return request(`/filter/${page}`, {
        method: "POST",
        query: {
            token: getCurrentToken(),
        },
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            country: filter.country,
            category_id: filter.category_id,
            genres: filter.genres,
            is_genres_exclude_mode_enabled: filter.is_genres_exclude_mode_enabled,
            profile_list_exclusions: filter.profile_list_exclusions,
            types: filter.types,
            studio: filter.studio,
            source: filter.source,
            start_year: filter.start_year,
            end_year: filter.end_year,
            season: filter.season,
            episodes_from: filter.episodes_from,
            episodes_to: filter.episodes_to,
            episode_duration_from: filter.episode_duration_from,
            episode_duration_to: filter.episode_duration_to,
            status_id: filter.status_id,
            age_ratings: filter.age_ratings,
            sort: filter.sort,
        }),
    });
}

export async function fetchSchedule() {
    return request(`/schedule`, {
        query: {
            token: getCurrentToken(),
        },
    });
}
