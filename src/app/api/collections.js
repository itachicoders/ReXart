import { getCurrentToken, getCurrentUserId, request, uploadImage } from "./request.js";

export async function fetchUserCollectionsPage(profileId = getCurrentUserId(), page = 0) {
    if (!profileId) {
        return { content: [], total_page_count: 0, current_page: 0 };
    }

    return request(`/collection/all/profile/${profileId}/${page}`, {
        query: {
            token: getCurrentToken(),
        },
    });
}

export async function fetchReleaseCollectionsPage(releaseId, page = 0) {
    return request(`/collection/all/release/${releaseId}/${page}`, {
        query: {
            token: getCurrentToken(),
        },
    });
}

export async function fetchCollectionInfo(collectionId) {
    return request(`/collection/${collectionId}`, {
        query: {
            token: getCurrentToken(),
        },
    });
}

export async function fetchCollectionReleasesPage(collectionId, page = 0) {
    return request(`/collection/${collectionId}/releases/${page}`, {
        query: {
            token: getCurrentToken(),
        },
    });
}

export async function addReleaseToCollection(collectionId, releaseId) {
    return request(`/collectionMy/release/add/${collectionId}`, {
        query: {
            release_id: releaseId,
            token: getCurrentToken(),
        },
    });
}

export async function createCollection({ title, description, is_private = false, releases = [] }) {
    return request(`/collectionMy/create`, {
        method: "POST",
        query: {
            token: getCurrentToken(),
        },
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            title,
            description,
            is_private,
            private: is_private,
            releases,
        }),
    });
}

export async function editCollection(collectionId, { title, description, is_private = false, releases = [] }) {
    return request(`/collectionMy/edit/${collectionId}`, {
        method: "POST",
        query: {
            token: getCurrentToken(),
        },
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            title,
            description,
            is_private,
            private: is_private,
            releases,
        }),
    });
}

export async function uploadCollectionImage(collectionId, dataUrl) {
    return uploadImage(`/collectionMy/editImage/${collectionId}`, dataUrl, {
        query: {
            token: getCurrentToken(),
        },
        filename: "collection-cover.jpg",
    });
}
