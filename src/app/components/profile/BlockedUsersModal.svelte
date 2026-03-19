<script>
    import BaseMainButton from "../buttons/BaseMainButton.svelte";
    import ProfileAvatar from "./ProfileAvatar.svelte";
    import { fetchBlockedUsersPage, toggleProfileBlock } from "../../api/profile.js";
    import Preloader from "../gui/Preloader.svelte";

    let firstData = fetchBlockedUsersPage(0);
    let page = 0;
    let list = [];
    let loadingMore = false;
    let reachedEnd = false;
    let workingIds = [];

    function consumeFirstPage(data) {
        list = data?.content ?? [];
        reachedEnd = (data?.content?.length ?? 0) === 0;
    }

    async function loadMore(event) {
        const element = event.currentTarget;

        if (
            loadingMore ||
            reachedEnd ||
            element.scrollTop < element.scrollHeight - element.clientHeight - 200
        ) {
            return;
        }

        loadingMore = true;
        page += 1;

        try {
            const data = await fetchBlockedUsersPage(page);
            const content = data?.content ?? [];

            if (content.length === 0) {
                reachedEnd = true;
            } else {
                list = list.concat(content);
            }
        } finally {
            loadingMore = false;
        }
    }

    async function unblockUser(userId) {
        if (workingIds.includes(userId)) return;
        workingIds = [...workingIds, userId];

        try {
            await toggleProfileBlock(userId, false);
            list = list.filter((item) => item.id !== userId);
        } finally {
            workingIds = workingIds.filter((id) => id !== userId);
        }
    }
</script>

<div class="modal-title">Заблокированные пользователи</div>
<div class="modal-content blocked-modal-content" on:scroll={loadMore}>
    {#await firstData}
        <Preloader />
    {:then data}
        {consumeFirstPage(data)}
        {#if list.length === 0}
            <div class="empty-state">Список блокировок пока пуст.</div>
        {:else}
            {#each list as user}
                <div class="blocked-user-row flex-row">
                    <div class="blocked-user-main flex-row">
                        <ProfileAvatar src={user.avatar} alt={user.login} size={{ width: 56, height: 56 }} />
                        <div class="blocked-user-text flex-column">
                            <span class="blocked-user-login">{user.login}</span>
                            <span class="blocked-user-date">
                                Заблокирован: {utils.returnTimeString((user.added_date ?? user.creation_date ?? 0) * 1000, true)}
                            </span>
                        </div>
                    </div>
                    <BaseMainButton
                        style="transparent"
                        borderRadius={10}
                        currentColorVar="--secondary-text-color"
                        isLoading={workingIds.includes(user.id)}
                        onClickCallback={() => unblockUser(user.id)}
                    >
                        Разблокировать
                    </BaseMainButton>
                </div>
            {/each}
        {/if}
    {/await}
</div>

<style>
    .blocked-modal-content {
        gap: 14px;
        height: calc(100% - 80px);
    }

    .blocked-user-row {
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        background-color: var(--alt-background-color);
        border-radius: 14px;
        padding: 14px 18px;
    }

    .blocked-user-main {
        gap: 14px;
        align-items: center;
    }

    .blocked-user-login {
        font-size: 18px;
        color: var(--main-text-color);
        font-weight: 600;
    }

    .blocked-user-date,
    .empty-state {
        color: var(--secondary-text-color);
    }
</style>
