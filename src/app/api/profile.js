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
        filename: image?.name || image?.filename || "avatar.jpg",
        variants: [
            { fieldName: "image", includeNameField: false },
            { fieldName: "image", includeNameField: true },
            { fieldName: "file", includeNameField: false },
            { fieldName: "file", includeNameField: true },
            { fieldName: "avatar", includeNameField: false },
            { fieldName: "avatar", includeNameField: true },
        ],
    });
}


export async function uploadProfileCover(channelId, image) {
    const token = getCurrentToken();

    if (!token) {
        throw new Error("Authentication required");
    }

    if (!channelId) {
        throw new Error("Не удалось определить канал профиля для загрузки обложки.");
    }

    return uploadImage(`/channel/cover/upload/${channelId}`, image, {
        query: {
            token,
        },
        headers: buildAuthHeaders(token),
        filename: image?.name || image?.filename || "profile-cover.jpg",
        fieldName: "file",
        includeNameField: false,
        variants: [
            { fieldName: "file", includeNameField: false },
            { fieldName: "file", includeNameField: true },
            { fieldName: "image", includeNameField: false },
            { fieldName: "image", includeNameField: true },
            { fieldName: "cover", includeNameField: false },
            { fieldName: "cover", includeNameField: true },
        ],
    });
}
