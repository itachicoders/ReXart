import { buildAuthHeaders, getCurrentToken, getCurrentUserId, isAuthorized, request, uploadImage } from "./request.js";

export async function fetchUserCollectionsPage(profileId = getCurrentUserId(), page = 0) {
    const token = getCurrentToken();

    if (!profileId) {
        return { content: [], total_page_count: 0, current_page: 0 };
    }

    return request(`/collection/all/profile/${profileId}/${page}`, {
        query: {
            token,
        },
        headers: token ? buildAuthHeaders(token) : {},
    });
}

export async function fetchReleaseCollectionsPage(releaseId, page = 0) {
    const token = getCurrentToken();

    return request(`/collection/all/release/${releaseId}/${page}`, {
        query: {
            token,
        },
        headers: token ? buildAuthHeaders(token) : {},
    });
}

export async function fetchCollectionInfo(collectionId) {
    const token = getCurrentToken();

    return request(`/collection/${collectionId}`, {
        query: {
            token,
        },
        headers: token ? buildAuthHeaders(token) : {},
    });
}

export async function fetchCollectionReleasesPage(collectionId, page = 0) {
    const token = getCurrentToken();

    return request(`/collection/${collectionId}/releases/${page}`, {
        query: {
            token,
        },
        headers: token ? buildAuthHeaders(token) : {},
    });
}

export async function addReleaseToCollection(collectionId, releaseId) {
    const token = getCurrentToken();

    if (!token || !isAuthorized()) {
        throw new Error("Authentication required");
    }

    return request(`/collectionMy/release/add/${collectionId}`, {
        query: {
            release_id: releaseId,
            token,
        },
        headers: buildAuthHeaders(token),
    });
}

export async function createCollection({ title, description, is_private = false, releases = [] }) {
    const token = getCurrentToken();

    if (!token || !isAuthorized()) {
        throw new Error("Authentication required");
    }

    return request(`/collectionMy/create`, {
        method: "POST",
        query: {
            token,
        },
        headers: {
            ...buildAuthHeaders(token),
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
    const token = getCurrentToken();

    if (!token || !isAuthorized()) {
        throw new Error("Authentication required");
    }

    return request(`/collectionMy/edit/${collectionId}`, {
        method: "POST",
        query: {
            token,
        },
        headers: {
            ...buildAuthHeaders(token),
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

export async function deleteCollection(collectionId) {
    const token = getCurrentToken();

    if (!token || !isAuthorized()) {
        throw new Error("Authentication required");
    }

    return request(`/collectionMy/remove/${collectionId}`, {
        query: {
            token,
        },
        headers: buildAuthHeaders(token),
    });
}

export async function uploadCollectionImage(collectionId, dataUrl) {
    const token = getCurrentToken();

    if (!token || !isAuthorized()) {
        throw new Error("Authentication required");
    }

    return uploadImage(`/collectionMy/editImage/${collectionId}`, dataUrl, {
        query: {
            token,
        },
        headers: buildAuthHeaders(token),
        filename: "collection-cover.jpg",
        variants: [
            { fieldName: "image", includeNameField: false },
            { fieldName: "image", includeNameField: true },
            { fieldName: "file", includeNameField: false },
            { fieldName: "file", includeNameField: true },
            { fieldName: "cover", includeNameField: false },
            { fieldName: "cover", includeNameField: true },
        ],
    });
}
