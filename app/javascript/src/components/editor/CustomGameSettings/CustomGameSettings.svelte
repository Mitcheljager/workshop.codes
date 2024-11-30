<script>
  import { customGameSettings } from "@src/stores/editor"
  import SettingsTree from "./SettingsTree.svelte"
</script>

<div class="p-1/4">
  <h2 class="mt-0">Code</h2>
  <SettingsTree tree={$customGameSettings.main.values} />

  <h2>Gamemodes</h2>
  <SettingsTree tree={$customGameSettings.gamemodes.values} />

  <h2>Lobby</h2>
  <SettingsTree tree={$customGameSettings.lobby.values} />

  <h2>Heroes</h2>
  <SettingsTree tree={$customGameSettings.heroes.values} />
</div>
