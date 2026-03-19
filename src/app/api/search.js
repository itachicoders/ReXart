import { getCurrentToken, request } from "./request.js";

export const SEARCH_WHERE_VALUES = [
    { label: "Релизах", value: "releases", auth: false },
    { label: "Профилях", value: "profiles", auth: false },
    { label: "Списках", value: "list", auth: true },
    { label: "Истории", value: "history", auth: true },
    { label: "Избранном", value: "favorites", auth: true },
    { label: "Всех коллекциях", value: "collections_all", auth: false },
    { label: "Своих коллекциях", value: "collections_fav", auth: true },
];

export const SEARCH_BY_VALUES = {
    releases: [
        { label: "Названию", value: "name" },
        { label: "Студии", value: "studio" },
        { label: "Режиссёру", value: "director" },
        { label: "Автору", value: "author" },
        { label: "Тегу", value: "tag" },
    ],
    list: [
        { label: "Смотрю", value: "watching" },
        { label: "В планах", value: "planned" },
        { label: "Просмотрено", value: "watched" },
        { label: "Отложено", value: "delayed" },
        { label: "Заброшено", value: "abandoned" },
    ],
};

const SEARCH_BY_NUMERIC_VALUES = {
    releases: {
        name: 0,
        studio: 1,
        director: 2,
        author: 3,
        tag: 4,
    },
    list: {
        watching: 1,
        planned: 2,
        watched: 3,
        delayed: 4,
        abandoned: 5,
    },
};

function getSearchByValue(where = "releases", searchBy = "name") {
    return SEARCH_BY_NUMERIC_VALUES?.[where]?.[searchBy] ?? 0;
}

export function getSearchByOptions(where = "releases") {
    return SEARCH_BY_VALUES[where] ?? [];
}

export function isSearchWhereRequiresAuth(where = "releases") {
    return SEARCH_WHERE_VALUES.find((item) => item.value === where)?.auth ?? false;
}

export async function searchContent({ where = "releases", searchBy = "name", query = "", page = 0 } = {}) {
    const token = getCurrentToken();
    const body = JSON.stringify({
        query,
        searchBy: getSearchByValue(where, searchBy),
    });

    switch (where) {
        case "profiles":
            return request(`/search/profiles/${page}`, {
                method: "POST",
                apiVersion: "v2",
                query: { token },
                headers: { "Content-Type": "application/json" },
                body,
            });

        case "list":
            return request(`/search/profile/list/${getSearchByValue(where, searchBy)}/${page}`, {
                method: "POST",
                apiVersion: "v2",
                query: { token },
                headers: { "Content-Type": "application/json" },
                body,
            });

        case "history":
            return request(`/search/history/${page}`, {
                method: "POST",
                apiVersion: "v2",
                query: { token },
                headers: { "Content-Type": "application/json" },
                body,
            });

        case "favorites":
            return request(`/search/favorites/${page}`, {
                method: "POST",
                apiVersion: "v2",
                query: { token },
                headers: { "Content-Type": "application/json" },
                body,
            });

        case "collections_all":
            return request(`/search/collections/${page}`, {
                method: "POST",
                apiVersion: "v2",
                query: { token },
                headers: { "Content-Type": "application/json" },
                body,
            });

        case "collections_fav":
            return request(`/search/favoriteCollections/${page}`, {
                method: "POST",
                apiVersion: "v2",
                query: { token },
                headers: { "Content-Type": "application/json" },
                body,
            });

        case "releases":
        default:
            return request(`/search/releases/${page}`, {
                method: "POST",
                apiVersion: "v2",
                query: { token },
                headers: { "Content-Type": "application/json" },
                body,
            });
    }
}
