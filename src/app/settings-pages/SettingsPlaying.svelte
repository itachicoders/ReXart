<script>
    import Separator from "../components/elements/Separator.svelte";
    import CheckboxElement from "../components/settings/CheckboxElement.svelte";
    import DropdownElement from "../components/settings/DropdownElement.svelte";
    import { localStorageWritable } from "@babichjacob/svelte-localstorage";
    import utils from "../utils";
    import { normalizePlayingSettings } from "../playerPreferences.js";

    let playingSettings;

    const playingSettingsRaw = localStorageWritable("playingSettings", utils.playingDefaultSettings);

    playingSettingsRaw.subscribe((value) => {
        playingSettings = normalizePlayingSettings(value);
    })

    function updateKey(key, value) {
        playingSettings[key] = value;

        playingSettingsRaw.set(playingSettings);
    }
</script>

<div class="flex-column playing-settings">
    <CheckboxElement title="Запоминать вариант, источник и качество" description="При повторном запуске релиза ReXart восстановит последние использованные настройки воспроизведения." value={playingSettings.rememberReleasePreferences} onChangeCallback={(v) => updateKey('rememberReleasePreferences', v)} />
    <CheckboxElement title="Не сохранять историю просмотра" description="Серия не будут отображаться в вашей истории." value={playingSettings.disableHistory} onChangeCallback={(v) => updateKey('disableHistory', v)} />

    <Separator width="75%" />

    <DropdownElement title="Качество видео по умолчанию" values={utils.qualityValues} value={playingSettings.defaultQuality} placeholder="Выберите качество" onChangeCallback={(e, v) => updateKey('defaultQuality', v)} />
    <DropdownElement title="Источник по умолчанию (Если доступен)" values={utils.sourceValues} value={playingSettings.defaultSource} placeholder="Выберите источник" onChangeCallback={(e, v) => updateKey('defaultSource', v)} />
</div>

<style>
    .playing-settings {
        align-items: center;
        margin-top: 40px;
    }
</style>


