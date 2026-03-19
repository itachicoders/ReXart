import { buildAuthHeaders, getCurrentToken, getCurrentUserId, isAuthorized, request, uploadImage } from "./request.js";

export async function fetchUserCollectionsPage(profileId = getCurrentUserId(), page = 0) {
    const token = getCurrentToken();

    if (!token || !profileId) {
        return { content: [], total_page_count: 0, current_page: 0 };
    }

    return request(`/collection/all/profile/${profileId}/${page}`, {
        query: {
            token,
        },
        headers: buildAuthHeaders(token),
    });
}

export async function fetchCollectionInfo(collectionId) {
    return request(`/collection/${collectionId}`);
}

export async function fetchCollectionReleasesPage(collectionId, page = 0) {
    return request(`/collection/content/${collectionId}/${page}`);
}

export async function createCollection({ title, description = "", is_private = false, releases = [] }) {
    const token = getCurrentToken();

    if (!token) {
        throw new Error("Authentication required");
    }

    const body = new URLSearchParams({
        title,
        description,
        private: is_private ? "true" : "false",
    });

    releases.forEach((releaseId) => {
        body.append("release_id[]", String(releaseId));
    });

    return request(`/collectionMy/add`, {
        method: "POST",
        query: { token },
        body,
    });
}

export async function addReleaseToCollection(collectionId, releaseId) {
    const token = getCurrentToken();

    if (!token) {
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

export async function removeReleaseFromCollection(collectionId, releaseId) {
    const token = getCurrentToken();

    if (!token) {
        throw new Error("Authentication required");
    }

    return request(`/collectionMy/release/remove/${collectionId}`, {
        query: {
            release_id: releaseId,
            token,
        },
    });
}

export async function editCollection(collectionId, { title, description = "", is_private = false, releases = [] }) {
    const token = getCurrentToken();

    if (!token) {
        throw new Error("Authentication required");
    }

    const body = new URLSearchParams({
        title,
        description,
        private: is_private ? "true" : "false",
    });

    releases.forEach((releaseId) => {
        body.append("release_id[]", String(releaseId));
    });

    return request(`/collectionMy/edit/${collectionId}`, {
        method: "POST",
        query: { token },
        body,
    });
}

export async function deleteCollection(collectionId) {
    const token = getCurrentToken();

    if (!token) {
        throw new Error("Authentication required");
    }

    return request(`/collectionMy/remove/${collectionId}`, {
        query: { token },
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
