import { startRpc } from "./discordRpc.ts";
import { modifyEditor, setupNativeClosePrompt } from "./domModifier/index.ts";
import { registerListener } from "./eventsListener.ts";
import { registerPmp } from "./fileHandlerOrSomethingRenameThisLaterIAmBadAtNamingThings.ts";
import { checkForUpdates } from "./helpers/updaterHelper.ts";
import { getAddonsConfig, getEditorAddonsConfig, startAutoSavingTwAddons } from "./twaddons/addons.ts"
import { setupAddonsOverwrite } from "./twaddons/addonsOverwrite.ts"

(window as any).GlobalPackagerImporter = () => new Promise((resolve, reject) => {
    (window as any).__pmImportResolve = resolve;
    (window as any).__pmImportReject = reject;
    window.dispatchEvent(new Event("packager-importer-ready"));
});

(async function () {
    const injected = window as unknown as { __windowInjected?: boolean };
    if (injected.__windowInjected) return;
    injected.__windowInjected = true;


    const query = new URLSearchParams(window.location.search);
    const isExtensionWindow = query.has('tauriExtWindow');
    if (isExtensionWindow) {
        if (query.has('tauriHideStageControls')) {

            const style = document.createElement('style');
            style.textContent = '[class*="stage-header-wrapper-overlay"] { display: none !important; }';
            document.head.appendChild(style);
        }
        registerPmp()
        return
    }

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
