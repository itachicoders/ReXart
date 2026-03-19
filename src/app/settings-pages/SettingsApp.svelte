<script>
    import Separator from "../components/elements/Separator.svelte";
    import CheckboxElement from "../components/settings/CheckboxElement.svelte";
    import TitleElement from "../components/settings/TitleElement.svelte";
    import DropdownElement from "../components/settings/DropdownElement.svelte";
    import BlankElement from "../components/settings/BlankElement.svelte";
    import BaseMainButton from "../components/buttons/BaseMainButton.svelte";
    import { localStorageWritable } from "@babichjacob/svelte-localstorage";
    import InfoElement from "../components/settings/InfoElement.svelte";

    let guiSettings, endpointUrl, changelogPreferences;

    let restartRequired = baseSettings.restartRequired;

    const guiSettingsRaw = localStorageWritable(
        "guiSettings",
        utils.guiDefaultSettings,
    );

    const endpointUrlRaw = localStorageWritable("endpointUrl", "api-s.anixsekai.com");
    const changelogPreferencesRaw = localStorageWritable("changelogPreferences", {
        showOnUpdate: true,
        lastSeenVersion: null,
    });

    guiSettingsRaw.subscribe((value) => {
        guiSettings = value;
    });
    
    endpointUrlRaw.subscribe((value) => {
        endpointUrl = value;
    });

    changelogPreferencesRaw.subscribe((value) => {
        changelogPreferences = value;
    });

    function updateGuiKey(key, value) {
        guiSettings[key] = value;

        guiSettingsRaw.set(guiSettings);
    }

    function updateMainKey(key, value) {
        restartRequired = true;
        baseSettings.restartRequired = true;
        baseSettings[key] = value;

        settings.set(key, value);
    }

    function updateChangelogPreference(key, value) {
        const nextValue = {
            ...(changelogPreferences ?? {
                showOnUpdate: true,
                lastSeenVersion: null,
            }),
            [key]: value,
        };

        changelogPreferences = nextValue;
        changelogPreferencesRaw.set(nextValue);
    }
</script>

<div class="flex-column app-settings">
    {#if restartRequired}
        <InfoElement
            title="Требуется перезагрузка"
            description="Изменения вступят в силу после перезагрузки."
            type="warning"
        />
    {/if}

    <TitleElement title="Основное" />

    <CheckboxElement
        title="Включить автообновление"
        description="Приложение будет автоматически загружать и устанавливать обновления при их наличии."
        value={baseSettings.AutoUpdate}
        onChangeCallback={(e) => updateMainKey("AutoUpdate", e)}
    />
    <CheckboxElement
        title="Включить Discord RPC"
        description="Отображает текущий статус просмотра в вашем профиле Discord."
        value={baseSettings.EnableRPC}
        onChangeCallback={(e) => updateMainKey("EnableRPC", e)}
    />
    <CheckboxElement
        title="Включить DevTools"
        description="Позволяет использовать DevTools в приложении, доступно только в бете."
        value={baseSettings.EnableDevTools}
        onChangeCallback={(e) => updateMainKey("EnableDevTools", e)}
    />

    <DropdownElement
        title="Эндпоинт API"
        values={utils.endpointValues}
        value={endpointUrl}
        placeholder="Выберите эндпоинт"
        onChangeCallback={(e, v) => {
            endpointUrlRaw.set(v);
            restartRequired = true;
            baseSettings.restartRequired = true;
        }}
    />

    <Separator width="75%" />

    <TitleElement title="Обновления и журнал изменений" />

    <CheckboxElement
        title="Показывать журнал изменений после обновления"
        description="После установки новой версии приложение автоматически покажет список основных изменений."
        value={changelogPreferences?.showOnUpdate ?? true}
        onChangeCallback={(e) => updateChangelogPreference("showOnUpdate", e)}
    />

    <BlankElement title="Журнал изменений">
        <BaseMainButton style="transparent" width="240px" borderRadius={6} currentColorVar="--secondary-text-color" onClickCallback={() => window.dispatchEvent(new CustomEvent("open-changelog-modal"))}>
            Открыть журнал изменений
        </BaseMainButton>
    </BlankElement>

    <Separator width="75%" />

    <TitleElement title="Внешний вид" />

    <DropdownElement
        title="Тема"
        values={utils.themeValues}
        value={guiSettings.theme}
        placeholder="Выберите тему"
        onChangeCallback={(e, v) => {
            updateGuiKey("theme", v);
            document.body.classList = [`${v}-theme`];
        }}
    />
</div>

<style>
    .app-settings {
        align-items: center;
        margin-top: 40px;
    }
</style>
