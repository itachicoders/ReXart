const ANILIBRIA_API_URL = "https://anilibria.top";
const TORAPI_API_URL = "https://torapi.vercel.app";

function ensureArray(value) {
    return Array.isArray(value) ? value : [];
}

async function fetchJson(url) {
    const response = await fetch(url);

    if (!response.ok) {
        const error = new Error(`External request failed with status ${response.status}`);
        error.status = response.status;
        throw error;
    }

    return response.json();
}

export function formatBytes(bytes) {
    if (bytes === null || bytes === undefined || Number.isNaN(Number(bytes))) {
        return null;
    }

    const value = Number(bytes);

    if (value < 1024) {
        return `${value} B`;
    }

    const units = ["KB", "MB", "GB", "TB"];
    let unitIndex = -1;
    let size = value;

    do {
        size /= 1024;
        unitIndex += 1;
    } while (size >= 1024 && unitIndex < units.length - 1);

    return `${size.toFixed(size >= 100 ? 0 : 1)} ${units[unitIndex]}`;
}

export async function searchAnilibriaTorrents(queryRu, queryOriginal) {
    const ruTitle = (queryRu || "").trim();
    const origTitle = (queryOriginal || "").trim();

    if (!ruTitle && !origTitle) return [];

    // Вспомогательная функция: делает запрос к API и жестко проверяет совпадение
    const searchAndFindMatch = async (searchQuery) => {
        if (!searchQuery) return null;

        const searchUrl = new URL(`${ANILIBRIA_API_URL}/api/v1/app/search/releases`);
        searchUrl.searchParams.set("query", searchQuery);

        const releaseCandidates = ensureArray(await fetchJson(searchUrl.toString()));
        if (!releaseCandidates.length) return null;

        const ruLower = ruTitle.toLowerCase();
        const origLower = origTitle.toLowerCase();

        // Жесткая фильтрация: релиз должен содержать искомые слова
        return releaseCandidates.find((item) => {
            const itemRu = (item.name?.main || "").toLowerCase();
            const itemEn = (item.name?.english || "").toLowerCase();

            // Проверяем, есть ли пересечения по русскому ИЛИ английскому названию
            const isRuMatch = ruLower && (itemRu === ruLower || itemRu.includes(ruLower) || ruLower.includes(itemRu));
            const isEnMatch = origLower && (itemEn === origLower || itemEn.includes(origLower) || origLower.includes(itemEn));

            return isRuMatch || isEnMatch;
        });
    };

    // 1. Сначала пробуем найти по оригинальному названию (обычно работает точнее в API)
    let bestMatch = await searchAndFindMatch(origTitle);

    // 2. Если по оригиналу ничего нет, пробуем по русскому
    if (!bestMatch) {
        bestMatch = await searchAndFindMatch(ruTitle);
    }

    // 3. САМОЕ ВАЖНОЕ: Если точного или частичного совпадения нет - возвращаем пустоту.
    // Больше никаких левых тайтлов вроде "Полуночный удар"
    if (!bestMatch || !bestMatch.id) {
        return [];
    }

    // Если нашли нужный релиз, забираем его торренты
    const torrents = ensureArray(await fetchJson(`${ANILIBRIA_API_URL}/api/v1/anime/torrents/release/${bestMatch.id}`));

    return torrents.map((item) => ({
        id: item.hash,
        title: `${item.release?.name?.main || item.release?.name?.english || ruTitle} (${item.description} эп.)`,
        filename: item.filename,
        size: formatBytes(item.size),
        codec: item.codec?.value || null,
        quality: item.quality?.value || null,
        seeders: item.seeders ?? null,
        leechers: item.leechers ?? null,
        magnet: item.magnet || null,
        file: `${ANILIBRIA_API_URL}/api/v1/anime/torrents/${item.hash}/file`,
        sourceLabel: "Anilibria",
    }));
}

async function fetchTorApi({ type, service, query }) {
    const url = new URL(`${TORAPI_API_URL}/api/search/${type}/${service}`);
    url.searchParams.set("query", query);

    const response = await fetch(url.toString());
    if (!response.ok) {
        throw new Error(`TorAPI request failed with status ${response.status}`);
    }

    return response.json();
}

export async function searchTorApiTorrents(query, service) {
    if (!query?.trim()) return [];

    const searchResults = await fetchTorApi({
        type: "title",
        service,
        query: query.trim(),
    });

    if (!Array.isArray(searchResults) || !searchResults.length || searchResults.Result) {
        return [];
    }

    const items = await Promise.all(
        searchResults.slice(0, 8).map(async (item) => {
            try {
                const detailResults = await fetchTorApi({
                    type: "id",
                    service,
                    query: String(item.Id),
                });

                const detail = Array.isArray(detailResults) ? detailResults[0] : null;
                if (!detail) return null;

                return {
                    id: detail.Hash || item.Id,
                    title: detail.Name || detail.Files?.[0]?.Name || item.Name || query,
                    filename: detail.Duration || item.Duration || "",
                    size: detail.Size || null,
                    codec: detail.Video || null,
                    quality: detail.Quality || null,
                    seeders: detail.Seeds ?? null,
                    leechers: detail.Peers ?? null,
                    magnet: detail.Magnet || null,
                    file: detail.Torrent || null,
                    sourceLabel: service,
                };
            } catch {
                return null;
            }
        }),
    );

    return items.filter(Boolean);
}
