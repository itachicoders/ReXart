import { buildAuthHeaders, getCurrentToken, request, uploadImage } from "./request.js";

export async function fetchHistoryPage(page = 0) {
    return request(`/history/${page}`, {
        query: {
            token: getCurrentToken(),
        },
    });
}

export async function fetchBlockedUsersPage(page = 0) {
    if (!getCurrentToken()) {
        return { content: [], total_page_count: 0, current_page: 0 };
    }

    return request(`/profile/blocklist/all/${page}`, {
        query: {
            token: getCurrentToken(),
        },
    });
}

export async function toggleProfileBlock(profileId, shouldBlock = true) {
    if (!getCurrentToken()) {
        throw new Error("Authentication required");
    }

    return request(`/profile/blocklist/${shouldBlock ? "add" : "remove"}/${profileId}`, {
        query: {
            token: getCurrentToken(),
        },
    });
}

export async function uploadProfileAvatar(image) {
    const token = getCurrentToken();

    if (!token) {
        throw new Error("Authentication required");
    }

    return uploadImage(`/profile/preference/avatar/edit`, image, {
        query: {
            token,
        },
        headers: buildAuthHeaders(token),
        filename: image?.filename ?? "avatar.jpg",
    });
}
