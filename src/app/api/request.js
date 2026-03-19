const DEFAULT_ENDPOINT = "api-s.anixsekai.com";

function safeParse(value) {
    try {
        return value ? JSON.parse(value) : null;
    } catch {
        return null;
    }
}

function normalizeStoredValue(value, fallback = null) {
    if (value === null || value === undefined) return fallback;
    if (typeof value !== "string") return value;

    const trimmed = value.trim();
    if (!trimmed.length) return fallback;

    if (
        (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
        (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
        try {
            return JSON.parse(trimmed);
        } catch {
            return trimmed.slice(1, -1);
        }
    }

    return trimmed;
}

export function getStoredUserToken() {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return safeParse(window.localStorage.getItem("user_token"));
}

export function getCurrentToken() {
    return window?.anixApi?.client?.token || getStoredUserToken()?.token || null;
}

export function getCurrentUserId() {
    return getStoredUserToken()?.id || null;
}

export function buildAuthHeaders(token = getCurrentToken()) {
    if (!token) {
        return {};
    }

    return {
        Authorization: `Bearer ${token}`,
        "X-Profile-Token": token,
    };
}

export function getApiBaseUrl() {
    const fromClient = window?.anixApi?.client?.baseUrl;
    if (fromClient) return fromClient;

    if (typeof window !== "undefined" && window.localStorage) {
        const endpoint = normalizeStoredValue(window.localStorage.getItem("endpointUrl"), DEFAULT_ENDPOINT);
        if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
            return endpoint;
        }
        return `https://${endpoint}`;
    }

    return `https://${DEFAULT_ENDPOINT}`;
}

export function buildUrl(path, query = {}) {
    const url = new URL(path, getApiBaseUrl());

    Object.entries(query).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") return;
        url.searchParams.set(key, value);
    });

    return url.toString();
}

export async function request(path, {
    query = {},
    method = "GET",
    body = null,
    headers = {},
    apiVersion = null,
} = {}) {
    const finalHeaders = { ...headers };

    if (apiVersion) {
        finalHeaders["API-Version"] = apiVersion;
    }

    const response = await fetch(buildUrl(path, query), {
        method,
        headers: finalHeaders,
        body,
    });

    const text = await response.text();
    let data = null;

    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }
    }

    if (!response.ok) {
        const error = new Error(`Request failed with status ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
    }

    if (data && typeof data === "object" && "code" in data && data.code !== 0) {
        const error = new Error(data.message || "API returned an error");
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
}

export function dataUrlToBlob(dataUrl) {
    if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.includes(",")) {
        return null;
    }

    const [meta, content] = dataUrl.split(",");
    const mimeMatch = meta.match(/data:(.*?);base64/);
    const mime = mimeMatch?.[1] ?? "image/jpeg";
    const binary = atob(content);
    const length = binary.length;
    const bytes = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return new Blob([bytes], { type: mime });
}

export function resolveImageBlob(image) {
    if (!image) {
        return null;
    }

    if (typeof Blob !== "undefined" && image instanceof Blob) {
        return image;
    }

    if (typeof File !== "undefined" && image instanceof File) {
        return image;
    }

    if (image?.blob && typeof Blob !== "undefined" && image.blob instanceof Blob) {
        return image.blob;
    }

    if (typeof image === "string") {
        return dataUrlToBlob(image);
    }

    return null;
}

export async function uploadImage(path, image, {
    query = {},
    fieldName = "image",
    filename = "image.jpg",
    method = "POST",
    apiVersion = null,
    headers = {},
} = {}) {
    const blob = resolveImageBlob(image);

    if (!blob) {
        throw new Error("Unable to convert image payload to Blob");
    }

    const finalFilename = image?.filename ?? filename;
    const formData = new FormData();
    formData.append(fieldName, blob, finalFilename);
    formData.append("name", fieldName);

    return request(path, {
        method,
        query,
        body: formData,
        apiVersion,
        headers,
    });
}
