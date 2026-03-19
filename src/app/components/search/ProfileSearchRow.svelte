<script>
    import { Lottie } from "lottie-svelte";
    import ProfileAvatar from "../profile/ProfileAvatar.svelte";

    export let profile;

    const badgeUrl = profile?.badge_url ?? profile?.badge?.image_url ?? null;
    const badgeName = profile?.badge_name ?? profile?.badge?.name ?? "badge";
</script>

<button class="profile-search-row flex-row" on:click={() => updateViewportComponent(9, profile.id)}>
    <ProfileAvatar
        src={profile.avatar}
        alt={profile.login}
        size={{ width: 72, height: 72 }}
        isOnline={profile.is_online}
        outlineWidth={3}
    />
    <div class="profile-search-main flex-column">
        <div class="profile-search-header flex-row">
            <span class="profile-search-login">{profile.login}</span>
            {#if badgeUrl}
                <div class="profile-search-badge">
                    {#if badgeUrl.endsWith(".json")}
                        <Lottie src={badgeUrl} height="20" width="20" />
                    {:else}
                        <img src={badgeUrl} alt={badgeName} width="20" height="20" />
                    {/if}
                </div>
            {/if}
            {#if profile.is_verified}
                <img src="./assets/icons/verified.svg" alt="verified" width="20" height="20" />
            {/if}
        </div>
        {#if profile.status}
            <span class="profile-search-status">{profile.status}</span>
        {:else}
            <span class="profile-search-status">Профиль AniXart</span>
        {/if}
    </div>
</button>

<style>
    .profile-search-row {
        margin: 20px;
        padding: 15px 18px;
        border-radius: 18px;
        background-color: var(--alt-background-color);
        align-items: center;
        gap: 16px;
        transition: background-color 0.2s ease;
    }

    .profile-search-row:hover {
        background-color: var(--select-button-color);
    }

    .profile-search-main {
        min-width: 0;
    }

    .profile-search-header {
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
    }

    .profile-search-login {
        font-size: 20px;
        font-weight: 700;
        color: var(--main-text-color);
        line-height: 1.2;
    }

    .profile-search-status {
        color: var(--secondary-text-color);
        font-size: 14px;
        margin-top: 4px;
        line-height: 1.4;
        word-break: break-word;
    }

    .profile-search-badge {
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>
