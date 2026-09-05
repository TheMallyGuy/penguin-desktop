// modify the editor

import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { getReduxStore, waitForReduxStore } from "../helpers/getReactStore";
import { getDiscordRpc, setDiscordRpc } from "../storeManager";
import { modifyCallbackPackageButton, modifyCallbackUploadButton, removeBackToHome, removeSeeProjectPage } from "./editor/menuBarModifier";
import { alertOverwrite } from "./editor/overwriteMethods";
import { addDesktopSettings } from "./editor/settings"
import { interceptPackagerDownloads } from "./editor/packagerDownloads";
import { emit, emitTo, listen } from "@tauri-apps/api/event";

export async function modifyEditor() {
    if (!window.location.href.toString().includes("packager")) {
        localStorage.setItem("penguin_discord_rpc", String(await getDiscordRpc()))

        modifyCallbackPackageButton(async () => {
            const WINDOW_LABEL = 'packager-win';

            WebviewWindow.getByLabel(WINDOW_LABEL)
                .then(async (existingWindow) => {
                    if (existingWindow) {
                        await existingWindow.unminimize();
                        await existingWindow.setFocus();
                        return;
                    }

                    const unlistenReady = await listen(`${WINDOW_LABEL}://ready`, async () => { // handle the ready
                        unlistenReady();

                        const state = getReduxStore().getState();
                        const blob: Blob = await state.scratchGui.vm.saveProjectSb3();
                        const bytes = Array.from(new Uint8Array(await blob.arrayBuffer()));

                        await emitTo(WINDOW_LABEL, "file://handoff", bytes);
                    });

                    const packagerWindow = new WebviewWindow(WINDOW_LABEL, {
                        url: 'packager/index.html',
                        title: 'Packager',
                        width: 800,
                        height: 600,
                    });

                    packagerWindow.once('tauri://error', (e) => {
                        console.error('packager window failed to create', e);
                    });
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
    } else {
        interceptPackagerDownloads();

        await listen<number[]>("file://handoff", (p) => {
            const bytes = new Uint8Array(p.payload);

            const resolveImport = (window as any).__pmImportResolve;
            if (typeof resolveImport !== 'function') {
                console.warn('packager import hook not ready yet, dropping handoff payload');
                return;
            }

            resolveImport({ data: bytes.buffer, name: 'project.sb3' });
        })

        await emit("packager-win://ready") // we emit that we're ready
    }

    // default methods must inject
    alertOverwrite();
}

export { setupNativeClosePrompt } from "./editor/nativeClose";
