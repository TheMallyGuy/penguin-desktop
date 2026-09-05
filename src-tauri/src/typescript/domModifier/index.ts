// modify the editor

import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { getReduxStore, waitForReduxStore } from "../helpers/getReactStore";
import { getDiscordRpc, setDiscordRpc } from "../storeManager";
import { modifyCallbackPackageButton, modifyCallbackUploadButton, removeBackToHome, removeSeeProjectPage } from "./editor/menuBarModifier";
import { alertOverwrite } from "./editor/overwriteMethods";
import { addDesktopSettings } from "./editor/settings"
import { emitTo } from "@tauri-apps/api/event";

export async function modifyEditor() {
    if (!window.location.href.toString().includes("packager")) {
        localStorage.setItem("penguin_discord_rpc", String(await getDiscordRpc()))

        modifyCallbackPackageButton(async () => {
            const WINDOW_LABEL = 'packager-win';
            const state = getReduxStore().getState()

            WebviewWindow.getByLabel(WINDOW_LABEL)
                .then(async (existingWindow) => {
                    if (existingWindow) {
                        await existingWindow.unminimize();
                        await existingWindow.setFocus();
                    } else {
                        const packagerWindow = new WebviewWindow(WINDOW_LABEL, {
                            url: 'packager/index.html',
                            title: 'Packager',
                            width: 800,
                            height: 600,
                        });

                        packagerWindow.once('tauri://error', (e) => {
                            console.error('packager window failed to create', e);
                        });

                        packagerWindow.once("tauri://webview-created", async () => {
                            delay(500)
                            emitTo("packager-win", "file://handoff", await state.vm.saveProjectSb3())
                        })
                    }
                })
                .catch(console.error);
        });

        modifyCallbackUploadButton(async () => {
            await alert("Unfortunately, we cannot auto upload to the penguinmod upload site. Therefore, please save your project and upload manually to the site.")
            const store = await waitForReduxStore();
            const state = store.getState();

            window.open(`https://penguinmod.com/upload?name=${encodeURIComponent(state.scratchGui.projectTitle)}`);
        });
        addDesktopSettings(async (checkbox: boolean) => {
            await setDiscordRpc(checkbox)
        });
        removeBackToHome();
        removeSeeProjectPage();
        alertOverwrite();
    } else {
        // TODO handle the json thing from vm
    }
}

export { setupNativeClosePrompt } from "./editor/nativeClose";
