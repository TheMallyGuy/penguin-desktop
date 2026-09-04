import { startRpc } from "./discordRpc.ts";
import { modifyEditor, setupNativeClosePrompt } from "./domModifier.ts"
import { registerListener } from "./eventsListener.ts";
import { registerPmp } from "./fileHandlerOrSomethingRenameThisLaterIAmBadAtNamingThings.ts";
import { checkForUpdates } from "./helpers/updaterHelper.ts";
import { getAddonsConfig, getEditorAddonsConfig, startAutoSavingTwAddons } from "./twaddons/addons.ts"
import { setupAddonsOverwrite } from "./twaddons/addonsOverwrite.ts"

(async function () {
    const injected = window as unknown as { __windowInjected?: boolean };
    if (injected.__windowInjected) return;
    injected.__windowInjected = true;

    checkForUpdates()

    setupAddonsOverwrite()
    setupNativeClosePrompt()
    modifyEditor()
    getEditorAddonsConfig() // these are made to save the configs before updating the app
    startAutoSavingTwAddons()
    registerListener()
    await startRpc()

    registerPmp()

    const twcfg = await getAddonsConfig()
    console.log(twcfg)
})();