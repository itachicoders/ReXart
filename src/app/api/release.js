import { getCurrentToken, request } from "./request.js";

export async function fetchLicensedPlatforms(releaseId) {
    return request(`/release/streaming/platform/${releaseId}`, {
        query: {
            token: getCurrentToken(),
        },
    });
}

export async function fetchRelatedReleasesPage(relatedId, page = 0) {
    return request(`/related/${relatedId}/${page}`, {
        query: {
            token: getCurrentToken(),
            "API-Version": "v2",
        },
    });
}
