import { startRpc } from "./discordRpc.ts";
import { modifyEditor, setupNativeClosePrompt } from "./domModifier.ts"
import { registerListener } from "./eventsListener.ts";
import { getAddonsConfig, getEditorAddonsConfig, startAutoSavingTwAddons } from "./twaddons/addons.ts"
import { setupAddonsOverwrite } from "./twaddons/addonsOverwrite.ts"

(async function () {
    setupAddonsOverwrite()
    setupNativeClosePrompt()
    modifyEditor()
    getEditorAddonsConfig() // these are made to save the configs before updating the app
    startAutoSavingTwAddons()
    registerListener()
    await startRpc()

    const twcfg = await getAddonsConfig()
    console.log(twcfg)
})();