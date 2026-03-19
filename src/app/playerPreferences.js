import utils from "./utils";

function cloneSettings(settings = {}) {
    return {
        ...utils.playingDefaultSettings,
        ...(settings ?? {}),
        releasePreferences: {
            ...(utils.playingDefaultSettings.releasePreferences ?? {}),
            ...(settings?.releasePreferences ?? {}),
        },
    };
}

export function normalizePlayingSettings(settings = {}) {
    return cloneSettings(settings);
}

export function getReleasePreference(settings = {}, releaseId) {
    const normalized = cloneSettings(settings);

    if (!normalized.rememberReleasePreferences || !releaseId) {
        return null;
    }

    return normalized.releasePreferences?.[String(releaseId)] ?? null;
}

export function getPreferredSourceName(settings = {}, releaseId) {
    const normalized = cloneSettings(settings);
    const releasePreference = getReleasePreference(normalized, releaseId);

    if (releasePreference?.sourceName) {
        return releasePreference.sourceName;
    }

    return utils.sourceValues.find((item) => item.value === normalized.defaultSource)?.label ?? null;
}

export function getPreferredQuality(settings = {}, releaseId) {
    const normalized = cloneSettings(settings);
    const releasePreference = getReleasePreference(normalized, releaseId);

    return releasePreference?.quality ?? normalized.defaultQuality;
}

export function updateReleasePreference(settings = {}, releaseId, patch = {}) {
    const normalized = cloneSettings(settings);

    if (!normalized.rememberReleasePreferences || !releaseId) {
        return normalized;
    }

    normalized.releasePreferences[String(releaseId)] = {
        ...(normalized.releasePreferences[String(releaseId)] ?? {}),
        ...patch,
    };

    return normalized;
}
